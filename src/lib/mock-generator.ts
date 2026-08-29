import { Question, MockTest, SectionType } from "@/types";
import { getQuestions, getMocks, saveMock } from "./db";
import {
  SECTION_BLUEPRINTS,
  groupByTopic,
  OTHER_TOPIC,
  TopicQuota,
} from "./topic-classifier";

/**
 * BLUEPRINT-DRIVEN MOCK ASSEMBLY
 *
 * The old generator sampled each 50-question section uniformly at random. That
 * is how candidates got papers with a dozen Blood Relation questions and zero
 * syllogisms, and how non-verbal figure questions — the ones this whole figure
 * pipeline exists to surface — could vanish from a mock entirely. It also never
 * checked that a question had an answer key, so the ~1,600 keyless legacy rows
 * were eligible to be served as unscoreable questions.
 *
 * This version samples to the syllabus quota in src/lib/topic-classifier.ts:
 *   - every topic gets at least its `min` (e.g. 8 non-verbal figures)
 *   - no topic exceeds its `max` (e.g. Blood Relations capped at 3)
 *   - only scoreable, active questions are eligible
 *   - the section still always reaches exactly 50, even if a topic runs dry
 */

const SECTIONS: SectionType[] = ["REASONING", "GA", "QUANT", "ENGLISH"];
const PER_SECTION = 50;

// Fisher–Yates shuffle / take-n.
function sampleRandom<T>(array: T[], n: number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

/**
 * Only questions we can actually mark. The flat-text extraction left ~1,600 rows
 * with a null `correctOption`; serving one means a candidate can never get it
 * right. The figure-aware extraction recovers the key from the radio-icon
 * geometry, but this guard stays as the backstop.
 */
function isScoreable(q: Question): boolean {
  return q.isActive && Boolean(q.correctOption);
}

interface SectionFill {
  picked: Question[];
  /** Per-topic counts, for the generation log. */
  tally: Record<string, number>;
  /** True if the pool could not supply a full 50 even ignoring caps. */
  short: boolean;
}

/**
 * Fill one section to the blueprint:
 *   1. give every topic its `min` (or all it has, if fewer)
 *   2. distribute the remaining slots round-robin without passing any `max`
 *   3. if quotas still leave it short (a topic ran dry), top up from OTHER and
 *      then, as a last resort, from any remaining bucket — a complete 50-question
 *      section always wins over an advisory cap.
 */
function fillSection(section: SectionType, questions: Question[]): SectionFill {
  const blueprint = SECTION_BLUEPRINTS[section] || [];

  // Shuffle each topic bucket once so both passes draw randomly.
  const buckets = new Map<string, Question[]>();
  for (const [key, list] of groupByTopic(questions)) {
    buckets.set(key, sampleRandom(list, list.length));
  }

  const picked: Question[] = [];
  const usedIds = new Set<string>();
  const tally: Record<string, number> = {};

  const take = (key: string, n: number): number => {
    const bucket = buckets.get(key);
    if (!bucket) return 0;
    let taken = 0;
    while (bucket.length && taken < n) {
      const q = bucket.pop()!;
      if (usedIds.has(q.id)) continue;
      usedIds.add(q.id);
      picked.push(q);
      tally[key] = (tally[key] || 0) + 1;
      taken++;
    }
    return taken;
  };

  // 1. Minimums first — this is what guarantees the non-verbal figure floor.
  for (const topic of blueprint) take(topic.key, topic.min);

  // 2. Fill to 50, one per topic per lap, never exceeding a topic's max.
  const headroom = (t: TopicQuota) => t.max - (tally[t.key] || 0);
  let progressed = true;
  while (picked.length < PER_SECTION && progressed) {
    progressed = false;
    for (const topic of blueprint) {
      if (picked.length >= PER_SECTION) break;
      if (headroom(topic) <= 0) continue;
      if (take(topic.key, 1) > 0) progressed = true;
    }
  }

  // 3. Quotas exhausted but still short: OTHER bucket, then anything left.
  if (picked.length < PER_SECTION) take(OTHER_TOPIC, PER_SECTION - picked.length);
  if (picked.length < PER_SECTION) {
    for (const [key, bucket] of buckets) {
      while (picked.length < PER_SECTION && bucket.length) {
        const q = bucket.pop()!;
        if (usedIds.has(q.id)) continue;
        usedIds.add(q.id);
        picked.push(q);
        tally[key] = (tally[key] || 0) + 1;
      }
    }
  }

  // Shuffle so topics aren't clustered in printed order within the section.
  return { picked: sampleRandom(picked, picked.length), tally, short: picked.length < PER_SECTION };
}

export async function generateMockTest(customTitle?: string): Promise<MockTest> {
  const allQuestions = await getQuestions();
  const scoreable = allQuestions.filter(isScoreable);

  const pools: Record<SectionType, Question[]> = {
    REASONING: [],
    GA: [],
    QUANT: [],
    ENGLISH: [],
  };
  for (const q of scoreable) {
    if (pools[q.section]) pools[q.section].push(q);
  }

  for (const section of SECTIONS) {
    if (pools[section].length < PER_SECTION) {
      throw new Error(
        `Insufficient scoreable questions in ${section}: found ${pools[section].length}, ` +
          `need ${PER_SECTION}. Questions with no answer key are excluded.`
      );
    }
  }

  const sections: Record<SectionType, string[]> = {
    REASONING: [],
    GA: [],
    QUANT: [],
    ENGLISH: [],
  };
  const diagnostics: string[] = [];
  for (const section of SECTIONS) {
    const { picked, tally, short } = fillSection(section, pools[section]);
    sections[section] = picked.map((q) => q.id);
    if (short) diagnostics.push(`⚠ ${section} under-filled ${picked.length}/50`);
    // The non-verbal figure floor is the headline invariant — always surface it.
    if (section === "REASONING") {
      diagnostics.push(`non-verbal figures=${tally.NON_VERBAL_FIGURES || 0}`);
    }
  }

  const existingMocks = await getMocks();
  const mockNumber = existingMocks.length + 1;
  const title = customTitle || `NBE Junior Assistant Full Mock #${mockNumber}`;
  const mockId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const mock: MockTest = {
    id: mockId,
    title,
    createdAt: new Date().toISOString(),
    timeLimitMinutes: 180,
    totalQuestions: 200,
    sections,
  };

  console.log(`[generateMockTest] ${mockId} · ${diagnostics.join(" · ")}`);
  await saveMock(mock);
  return mock;
}

import {
  Question,
  SectionType,
  AnswerState,
  TopicPerformance,
  SectionTopicAnalysis,
  MockTopicAnalysis,
} from "@/types";

/**
 * TOPIC TAXONOMY & MOCK BLUEPRINT
 *
 * Mocks were being assembled by random sampling inside a section, which is how
 * candidates ended up with 10–15 Blood Relation questions in one paper and zero
 * syllogisms, and why non-verbal figure questions could vanish entirely. This
 * module gives the generator the syllabus shape from
 * PRD/07_QUESTION_SEGREGATION_AND_MOCK_BLUEPRINT.md so it can sample to quota
 * instead of sampling blind.
 *
 * Classification is keyword/figure based and deliberately cheap — it runs over
 * the whole bank on every generate. It is a floor, not a ceiling: a later AI pass
 * can persist a better `topic` on the document and this will defer to it.
 */

export interface TopicQuota {
  /** Stable key, also what gets persisted to Question.topic. */
  key: string;
  /** Human label for admin surfaces. */
  label: string;
  /** Fewest questions of this topic a mock must contain. */
  min: number;
  /** Most it may contain — the cap that kills topic skew. */
  max: number;
  /** Matched against stem + options. */
  patterns: RegExp[];
}

const REASONING_TOPICS: TopicQuota[] = [
  {
    key: "NON_VERBAL_FIGURES",
    label: "Non-Verbal (Mirror, Paper Fold, Embedded, Cubes)",
    min: 8,
    max: 10,
    patterns: [
      /mirror image|water image/i,
      /paper (?:is )?(?:folded|cut)|folded and cut/i,
      /hidden|embedded (?:figure|in)/i,
      /\b(?:dice|cube|cubes)\b/i,
      /answer figures?|question figures?/i,
      /complete the (?:figure|pattern)/i,
    ],
  },
  {
    key: "ANALOGY_CLASSIFICATION",
    label: "Analogies & Classification",
    min: 8,
    max: 10,
    patterns: [
      /is related to .* in the same way as/i,
      /\banalog(?:y|ous)\b/i,
      /three of the following four are alike/i,
      /odd one out|does not belong/i,
      /select the (?:option|word|number) that is related/i,
    ],
  },
  {
    key: "CODING_DECODING",
    label: "Coding-Decoding",
    min: 6,
    max: 8,
    patterns: [
      /coded as|code language|in a certain code/i,
      /what will be the code for/i,
      /decoded|encoded/i,
    ],
  },
  {
    key: "SERIES",
    label: "Series (Number / Alphabet)",
    min: 6,
    max: 8,
    patterns: [
      /which (?:number|letter|letter-cluster|term) will (?:replace|come)/i,
      /complete the (?:given )?series/i,
      /missing (?:number|term|letter)/i,
      /\?\s*$/,
    ],
  },
  {
    key: "SYLLOGISM",
    label: "Syllogisms & Statements",
    min: 4,
    max: 6,
    patterns: [
      /statements?\s*:.*conclusions?\s*:/is,
      /\bsome\b.*\ball\b.*\bno\b/i,
      /which of the conclusions? logically follows/i,
      /venn diagram/i,
    ],
  },
  {
    key: "DIRECTION_SENSE",
    label: "Direction Sense",
    min: 3,
    max: 4,
    patterns: [
      /walks? \d+\s*m/i,
      /turns? (?:to (?:his|her) )?(?:left|right)/i,
      /(?:north|south|east|west)[-\s]?(?:east|west)?\b.*\b(?:direction|facing)/i,
      /how far.*from (?:his|her|the) starting point/i,
    ],
  },
  {
    key: "MATH_OPERATIONS",
    label: "Mathematical Operations",
    min: 3,
    max: 4,
    patterns: [
      /interchang(?:e|ing) (?:the )?(?:two )?(?:signs|numbers)/i,
      /which two (?:signs|numbers) (?:should|need to) be interchanged/i,
      /balance the (?:given )?equation/i,
      /\+\s*and\s*[-−×÷]/i,
    ],
  },
  {
    key: "BLOOD_RELATION",
    label: "Blood Relations",
    // The defect that started this: capped hard, never a minimum.
    min: 2,
    max: 3,
    patterns: [
      /how is [a-z]+ related to/i,
      /pointing to a (?:man|woman|photograph|person|lady|boy|girl)/i,
      /(?:father|mother|sister|brother|son|daughter|husband|wife) of/i,
      /is the (?:father|mother|sister|brother|son|daughter|husband|wife)/i,
    ],
  },
];

const GA_TOPICS: TopicQuota[] = [
  {
    key: "SCIENCE",
    label: "General Science",
    min: 10,
    max: 12,
    patterns: [
      /\bvitamin|enzyme|hormone|cell|tissue|blood group|photosynthesis\b/i,
      /\batom|molecule|element|compound|acid|alkali|valency|periodic table\b/i,
      /\bvelocity|acceleration|newton|gravity|refraction|magnet|circuit|ohm\b/i,
      /chemical (?:formula|symbol|name)/i,
    ],
  },
  {
    key: "HISTORY_CULTURE",
    label: "Indian History & Culture",
    min: 8,
    max: 10,
    patterns: [
      /\bdynasty|empire|mughal|maurya|gupta|chola|sultanate\b/i,
      /\bfreedom (?:struggle|movement)|satyagraha|revolt of 1857\b/i,
      /\bdance|festival|temple|monument|classical (?:dance|music)\b/i,
      /\b(?:18|19)\d{2}\b.*\b(?:battle|treaty|act|session)\b/i,
    ],
  },
  {
    key: "POLITY",
    label: "Indian Polity & Constitution",
    min: 8,
    max: 10,
    patterns: [
      /\bconstitution|article \d+|schedule|amendment\b/i,
      /\bfundamental (?:rights?|duties)|directive principles\b/i,
      /\b(?:lok sabha|rajya sabha|parliament|president|governor|judiciary)\b/i,
      /\bpanchayat|election commission|attorney general\b/i,
    ],
  },
  {
    key: "CURRENT_STATIC",
    label: "Current Affairs & Static GK",
    min: 8,
    max: 10,
    patterns: [
      /\baward|prize|trophy|championship|olympic|commonwealth|asian games\b/i,
      /\bscheme|yojana|mission|abhiyan|campaign\b/i,
      /\bappointed|inaugurated|launched|summit|conference\b/i,
      /\bcapital of|currency of|headquarters\b/i,
    ],
  },
  {
    key: "GEOGRAPHY",
    label: "Geography & Environment",
    min: 6,
    max: 8,
    patterns: [
      /\briver|tributary|mountain|plateau|desert|lake|strait|peninsula\b/i,
      /\bmonsoon|climate|rainfall|soil|forest|wildlife sanctuary|biosphere\b/i,
      /\blongitude|latitude|tropic|equator\b/i,
      /\bnational park|tiger reserve\b/i,
    ],
  },
  {
    key: "ECONOMY",
    label: "Economy & Banking",
    min: 4,
    max: 6,
    patterns: [
      /\brbi|reserve bank|repo rate|inflation|gdp|fiscal|budget\b/i,
      /\bbank|nabard|sebi|niti aayog|census\b/i,
      /\bfive year plan|per capita income|subsidy\b/i,
    ],
  },
];

const QUANT_TOPICS: TopicQuota[] = [
  {
    key: "DATA_INTERPRETATION",
    label: "Data Interpretation (Tables, Bar/Pie Charts)",
    min: 8,
    max: 10,
    patterns: [
      /bar graph|pie chart|line graph|histogram/i,
      /study the (?:given )?(?:table|graph|chart|data)/i,
      /the (?:given|following) table (?:shows|represents)/i,
    ],
  },
  {
    key: "PERCENT_PROFIT_LOSS",
    label: "Percentage, Profit & Loss",
    min: 8,
    max: 10,
    patterns: [
      /\bprofit|loss|discount|marked price|cost price|selling price\b/i,
      /\bper\s?cent|percentage|\d+\s*%/i,
    ],
  },
  {
    key: "NUMBER_SYSTEM",
    label: "Number System & Simplification",
    min: 6,
    max: 8,
    patterns: [
      /\bhcf|lcm|divisib(?:le|ility)|remainder|prime\b/i,
      /simplify|value of\s*[:=]|find the value/i,
      /\bsquare root|cube root|surd\b/i,
    ],
  },
  {
    key: "RATIO_AVERAGE",
    label: "Ratio, Proportion & Averages",
    min: 6,
    max: 8,
    patterns: [
      /\bratio|proportion|in the ratio\b/i,
      /\baverage|mean|median|mode\b/i,
      /\bpartnership|share of\b/i,
    ],
  },
  {
    key: "TIME_WORK_DISTANCE",
    label: "Time & Work, Time & Distance",
    min: 6,
    max: 8,
    patterns: [
      /\bcan (?:do|complete) (?:a|the) (?:piece of )?work\b/i,
      /\bworking together|alone can\b/i,
      /\bkm\/h|km per hour|m\/s|speed|train|boat|stream|upstream|downstream\b/i,
      /\bpipes?|cistern|tank\b/i,
    ],
  },
  {
    key: "ALGEBRA_MENSURATION",
    label: "Basic Algebra & Mensuration",
    min: 6,
    max: 8,
    patterns: [
      /\barea|perimeter|volume|surface area|circumference\b/i,
      /\btriangle|circle|square|rectangle|cylinder|cone|sphere|cuboid\b/i,
      /\bif x|x\s*[+\-]\s*y|equation|polynomial|factoris/i,
      /\bsin|cos|tan|theta|θ\b/i,
    ],
  },
  {
    key: "INTEREST",
    label: "Simple & Compound Interest",
    min: 4,
    max: 5,
    patterns: [
      /simple interest|compound interest|\bper annum\b/i,
      /\binterest (?:rate|of|on)\b/i,
    ],
  },
];

const ENGLISH_TOPICS: TopicQuota[] = [
  {
    key: "READING_COMPREHENSION",
    label: "Reading Comprehension",
    min: 10,
    max: 12,
    patterns: [
      /read the (?:following )?passage/i,
      /comprehension/i,
      /according to the passage|the author (?:says|suggests|implies)/i,
    ],
  },
  {
    key: "ERROR_IMPROVEMENT",
    label: "Spotting Errors & Sentence Improvement",
    min: 8,
    max: 10,
    patterns: [
      /grammatical(?:ly)? (?:error|incorrect)/i,
      /select the (?:option|part) (?:that|which) (?:has|contains) an? error/i,
      /sentence improvement|improve the (?:underlined )?(?:part|segment)/i,
      /\bno error\b/i,
    ],
  },
  {
    key: "VOCABULARY",
    label: "Synonyms, Antonyms & One-word Substitutions",
    min: 8,
    max: 10,
    patterns: [
      /\bsynonym|antonym|opposite in meaning|similar in meaning\b/i,
      /one[-\s]word substitut/i,
      /\bcorrectly spelt|misspelt|spelling\b/i,
      /most appropriate (?:meaning|word) (?:of|for) the (?:given )?word/i,
    ],
  },
  {
    key: "CLOZE",
    label: "Cloze Test",
    min: 5,
    max: 10,
    patterns: [
      /fill in (?:the )?blank/i,
      /blank number \d+/i,
      /cloze/i,
    ],
  },
  {
    key: "IDIOMS",
    label: "Idioms & Phrases",
    min: 5,
    max: 6,
    patterns: [
      /\bidiom|phrase\b/i,
      /meaning of the (?:given )?(?:idiom|expression)/i,
    ],
  },
  {
    key: "VOICE_SPEECH",
    label: "Active/Passive & Direct/Indirect Speech",
    min: 4,
    max: 6,
    patterns: [
      /passive voice|active voice/i,
      /indirect (?:speech|narration)|direct (?:speech|narration)/i,
    ],
  },
];

export const SECTION_BLUEPRINTS: Record<SectionType, TopicQuota[]> = {
  REASONING: REASONING_TOPICS,
  GA: GA_TOPICS,
  QUANT: QUANT_TOPICS,
  ENGLISH: ENGLISH_TOPICS,
};

/** Bucket for questions no pattern claims; fills whatever quota is left over. */
export const OTHER_TOPIC = "OTHER";

function searchableText(q: Question): string {
  return [q.questionText, q.options?.a, q.options?.b, q.options?.c, q.options?.d]
    .filter(Boolean)
    .join(" ");
}

/**
 * A figure-only reasoning question has no words to match on — the artwork *is*
 * the question. Those are exactly the non-verbal items the blueprint must
 * guarantee, so treat the presence of option figures as the signal.
 */
function isNonVerbalByFigure(q: Question): boolean {
  if (q.section !== "REASONING") return false;
  return Boolean(q.optionsAreImages || q.stemIsFigureOnly);
}

export function classifyTopic(q: Question): string {
  // An explicitly stored topic (e.g. from an AI pass) always wins.
  if (q.topic) return q.topic;
  if (isNonVerbalByFigure(q)) return "NON_VERBAL_FIGURES";

  const text = searchableText(q);
  const topics = SECTION_BLUEPRINTS[q.section] || [];
  // Blueprint order is significant: the most specific topics are listed first so
  // "pointing to a photograph" lands in BLOOD_RELATION rather than ANALOGY.
  for (const topic of topics) {
    if (topic.patterns.some((p) => p.test(text))) return topic.key;
  }
  return OTHER_TOPIC;
}

export function groupByTopic(questions: Question[]): Map<string, Question[]> {
  const groups = new Map<string, Question[]>();
  for (const q of questions) {
    const key = classifyTopic(q);
    const bucket = groups.get(key);
    if (bucket) bucket.push(q);
    else groups.set(key, [q]);
  }
  return groups;
}

/**
 * Human-readable label for any topic key.
 */
export function getTopicLabel(topicKey: string, section?: SectionType): string {
  if (topicKey === OTHER_TOPIC) return "Applied Concepts & Mixed Questions";

  if (section && SECTION_BLUEPRINTS[section]) {
    const found = SECTION_BLUEPRINTS[section].find((t) => t.key === topicKey);
    if (found) return found.label;
  }

  for (const list of Object.values(SECTION_BLUEPRINTS)) {
    const found = list.find((t) => t.key === topicKey);
    if (found) return found.label;
  }

  return topicKey.replace(/_/g, " ");
}

/**
 * High-yield CBT revision advice per topic for NBEMS Junior Assistant.
 */
export const TOPIC_ACTION_ADVICE: Record<string, string> = {
  // QUANT (Mathematics)
  PERCENT_PROFIT_LOSS:
    "Master percentage multipliers (e.g. 20% profit = 1.2x CP) and successive discount formulas. Avoid setting up algebraic x variables.",
  RATIO_AVERAGE:
    "Use unit-value unitary method for ratios and age problems; use net deviation method for averages instead of calculating large sums.",
  NUMBER_SYSTEM:
    "Revise divisibility rules (7, 11, 13, 19), prime factorization for HCF/LCM remainder models, and strict BODMAS calculation order.",
  TIME_WORK_DISTANCE:
    "Take LCM of days as total units of work to calculate individual daily efficiencies. For trains and boats, use relative speed formulas.",
  DATA_INTERPRETATION:
    "Practice column addition shortcuts and percentage approximations. Never perform manual 4-digit long divisions during the CBT.",
  ALGEBRA_MENSURATION:
    "Memorize standard formula sheets for cylinder/cone/sphere surface area & volume, plus standard polynomial identities.",
  INTEREST:
    "Use fractional interest rates. For 2-year CI − SI difference, use D = P(r/100)². For 3-year, use D = P(r/100)² × (3 + r/100).",

  // REASONING
  NON_VERBAL_FIGURES:
    "Track one element at a time (e.g. corner dot, arrowhead) through rotational increments (+45°, +90°). Eliminate wrong options immediately.",
  ANALOGY_CLASSIFICATION:
    "Check number patterns (squares ± 1, cubes, prime numbers) and alphabetical skip values before guessing semantic relations.",
  CODING_DECODING:
    "Write the A=1..Z=26 rank table and reverse letter pairs (A-Z, B-Y) on your rough sheet first. Check for cross-pattern shifts.",
  SERIES:
    "Write consecutive term differences. If differences aren't constant, calculate the second difference or check alternate series.",
  SYLLOGISM:
    "Draw standard minimal Venn diagrams. Remember: never assume unstated conclusions or convert 'Some' into 'All'.",
  DIRECTION_SENSE:
    "Sketch a quick directional compass (N, S, E, W) with distance annotations. Use Pythagoras theorem for diagonal displacement.",
  MATH_OPERATIONS:
    "Test option signs systematically starting from division and multiplication first (BODMAS), verifying if LHS equals RHS.",
  BLOOD_RELATION:
    "Draw family trees using generational levels (+ for male, - for female, = for married couples) to avoid mental mix-ups.",

  // GENERAL AWARENESS
  SCIENCE:
    "Revise human vitamins & deficiency diseases, SI units, basic chemical formulas (Baking soda, Bleaching powder), and Newton's laws.",
  HISTORY_CULTURE:
    "Revise Delhi Sultanate/Mughal chronology, 1857 revolt centers & leaders, and classical dance forms with their native states.",
  POLITY:
    "Review Articles 14 to 32 (Fundamental Rights), Writs, President/Governor executive powers, and key constitutional amendments.",
  CURRENT_STATIC:
    "Revise national sports awards, major appointments from the last 6 months, flagship government welfare schemes, and national parks.",
  GEOGRAPHY:
    "Review major Indian river origins & tributaries (Ganga, Godavari, Brahmaputra), mountain passes, and biosphere reserves.",
  ECONOMY:
    "Revise RBI monetary policy tools (Repo rate, Reverse Repo, CRR, SLR), inflation indices (CPI vs WPI), and budget terms.",

  // ENGLISH
  READING_COMPREHENSION:
    "Read question stems before reading the passage to locate exact keywords rapidly without reading the text twice.",
  ERROR_IMPROVEMENT:
    "Look for Subject-Verb Agreement, singular/plural noun mismatch, misplaced modifiers, and fixed preposition usage.",
  VOCABULARY:
    "Focus on high-frequency SSC/NBEMS words, antonym-synonym roots, and prefix/suffix meanings. Eliminate extreme words.",
  CLOZE:
    "Read the complete passage first to grasp overall context and tense before picking option words for the blanks.",
  IDIOMS:
    "Review standard idioms and phrasal verbs from previous papers. Understand figurative context rather than literal meaning.",
  VOICE_SPEECH:
    "Active/Passive retains original tense (adds 'be' + V3). Direct/Indirect shifts present tenses to past tenses.",

  OTHER:
    "Review fundamental concepts and practice timed section drills to strengthen speed and eliminate careless calculation mistakes.",
};

export function getTopicAdvice(topicKey: string, section?: SectionType): string {
  if (TOPIC_ACTION_ADVICE[topicKey]) {
    return TOPIC_ACTION_ADVICE[topicKey];
  }
  return TOPIC_ACTION_ADVICE.OTHER;
}

const SECTION_DISPLAY_NAMES: Record<SectionType, string> = {
  REASONING: "General Intelligence & Reasoning",
  GA: "General Awareness",
  QUANT: "Quantitative Aptitude (Mathematics)",
  ENGLISH: "English Comprehension",
};

/**
 * Analyzes candidate's 200 questions into section-wise and topic-wise performance,
 * explicitly identifying weak topics (where wrong answers occurred).
 */
export function analyzeAttemptTopics(
  questions: Question[],
  answers: AnswerState[],
  orderedQuestionIds?: string[]
): MockTopicAnalysis {
  const answerMap = new Map<string, AnswerState>(answers.map((a) => [a.questionId, a]));
  const questionMap = new Map<string, Question>(questions.map((q) => [q.id, q]));

  // Canonical 1-indexed question numbers
  const idToNumber = new Map<string, number>();
  if (orderedQuestionIds && orderedQuestionIds.length > 0) {
    orderedQuestionIds.forEach((id, idx) => idToNumber.set(id, idx + 1));
  } else {
    questions.forEach((q, idx) => idToNumber.set(q.id, idx + 1));
  }

  const sections: SectionType[] = ["REASONING", "GA", "QUANT", "ENGLISH"];
  const bySection: Partial<Record<SectionType, SectionTopicAnalysis>> = {};
  const allWeakTopicsList: TopicPerformance[] = [];

  for (const sec of sections) {
    // Collect questions in this section
    const secQuestions = questions.filter((q) => q.section === sec);
    const topicBuckets = new Map<
      string,
      {
        total: number;
        correct: number;
        wrong: number;
        skipped: number;
        wrongNumbers: number[];
      }
    >();

    let secTotalWrong = 0;
    let secTotalCorrect = 0;
    let secTotalSkipped = 0;

    for (const q of secQuestions) {
      const topicKey = classifyTopic(q);
      if (!topicBuckets.has(topicKey)) {
        topicBuckets.set(topicKey, { total: 0, correct: 0, wrong: 0, skipped: 0, wrongNumbers: [] });
      }
      const b = topicBuckets.get(topicKey)!;
      b.total += 1;

      const ans = answerMap.get(q.id);
      const selected = ans?.selectedOption || null;
      const qNum = idToNumber.get(q.id) || 1;

      if (!selected) {
        b.skipped += 1;
        secTotalSkipped += 1;
      } else if (selected === q.correctOption) {
        b.correct += 1;
        secTotalCorrect += 1;
      } else {
        b.wrong += 1;
        b.wrongNumbers.push(qNum);
        secTotalWrong += 1;
      }
    }

    const topicPerfList: TopicPerformance[] = [];

    for (const [key, b] of topicBuckets.entries()) {
      const attempted = b.correct + b.wrong;
      const accuracy = attempted > 0 ? Math.round((b.correct / attempted) * 100) : 0;

      let status: TopicPerformance["status"] = "STRONG";
      if (b.wrong >= 2) {
        status = "CRITICAL_WEAKNESS";
      } else if (b.wrong === 1) {
        status = "NEEDS_WORK";
      } else if (b.wrong === 0 && b.skipped > 0) {
        status = "MODERATE";
      }

      const item: TopicPerformance = {
        topicKey: key,
        topicLabel: getTopicLabel(key, sec),
        section: sec,
        total: b.total,
        correct: b.correct,
        wrong: b.wrong,
        skipped: b.skipped,
        accuracyPercentage: accuracy,
        wrongQuestionNumbers: b.wrongNumbers.sort((a, b) => a - b),
        status,
        actionAdvice: getTopicAdvice(key, sec),
      };

      topicPerfList.push(item);
      if (b.wrong > 0) {
        allWeakTopicsList.push(item);
      }
    }

    // Topics to work on: wrong > 0, sorted by most wrong answers descending, then lowest accuracy
    const topicsToWorkOn = topicPerfList
      .filter((t) => t.wrong > 0)
      .sort((a, b) => b.wrong - a.wrong || a.accuracyPercentage - b.accuracyPercentage);

    // All topics: weak first, then others
    const allTopicsSorted = [...topicPerfList].sort((a, b) => {
      if (a.wrong > 0 && b.wrong === 0) return -1;
      if (b.wrong > 0 && a.wrong === 0) return 1;
      return b.wrong - a.wrong || a.accuracyPercentage - b.accuracyPercentage;
    });

    bySection[sec] = {
      section: sec,
      sectionLabel: SECTION_DISPLAY_NAMES[sec],
      totalQuestions: secQuestions.length,
      totalWrong: secTotalWrong,
      totalCorrect: secTotalCorrect,
      totalSkipped: secTotalSkipped,
      topicsToWorkOn,
      allTopics: allTopicsSorted,
    };
  }

  // Overall top weak topics across all sections
  const overallWeakTopics = allWeakTopicsList.sort(
    (a, b) => b.wrong - a.wrong || a.accuracyPercentage - b.accuracyPercentage
  );

  return {
    bySection: bySection as Record<SectionType, SectionTopicAnalysis>,
    overallWeakTopics,
  };
}

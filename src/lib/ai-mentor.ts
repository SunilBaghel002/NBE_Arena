import { Attempt, DeepAIAnalysis, MultiMockAIAnalysis, SectionType } from "@/types";

/**
 * Robust caller across AI providers with automatic fallback:
 * 1. Groq (Fastest, ultra-low latency)
 * 2. OpenRouter (High reliability, secondary fallback)
 * 3. Gemini (Google AI)
 */
async function callAiWithFallback(
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; provider: string; model: string }> {
  const errors: string[] = [];

  // 1. Try Groq
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const groqModel = process.env.GROQ_TEXT_MODEL || "openai/gpt-oss-120b";
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 3500,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          return { text: content, provider: "Groq", model: groqModel };
        }
      } else {
        const errText = await res.text();
        errors.push(`Groq failed (${res.status}): ${errText}`);
      }
    } catch (err) {
      errors.push(`Groq exception: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 2. Try OpenRouter
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    const orModel = process.env.OPENROUTER_TEXT_MODEL || "openai/gpt-4o-mini";
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": process.env.NEXTAUTH_URL || "https://nbe-arena.vercel.app",
          "X-Title": "NBE Arena AI Mentor",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: orModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 3500,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          return { text: content, provider: "OpenRouter", model: orModel };
        }
      } else {
        const errText = await res.text();
        errors.push(`OpenRouter failed (${res.status}): ${errText}`);
      }
    } catch (err) {
      errors.push(`OpenRouter exception: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 3. Try Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const geminiModel = process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash";
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.2, maxOutputTokens: 3500 },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (content) {
          return { text: content, provider: "Google Gemini", model: geminiModel };
        }
      } else {
        const errText = await res.text();
        errors.push(`Gemini failed (${res.status}): ${errText}`);
      }
    } catch (err) {
      errors.push(`Gemini exception: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  throw new Error(`All AI providers failed: ${errors.join(" | ")}`);
}

function cleanJsonResponse(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  return cleaned;
}

/**
 * Generate a deep diagnostic for a single attempt
 */
export async function generateSingleAttemptAnalysis(
  attempt: Attempt,
  mockTitle?: string
): Promise<DeepAIAnalysis> {
  const score = attempt.score;
  if (!score) {
    throw new Error("Cannot analyze attempt without score");
  }

  const bySec = score.bySection;
  const net = score.netScore;
  const gap = Number(Math.max(0, 150 - net).toFixed(2));
  const candidate = attempt.userName || "Candidate";

  const systemPrompt = `You are the Senior Exam Strategist and CBT Mentor for the NBEMS (National Board of Examinations in Medical Sciences) Junior Assistant Examination.
Critical Exam Context:
- Exactly 10 DAYS REMAIN until the official paper exam on SEPTEMBER 15, 2026.
- Total: 200 Questions (50 Reasoning, 50 General Awareness, 50 Quantitative Aptitude, 50 English Comprehension).
- Duration: 180 Minutes (3 Hours).
- Marking: +1.00 Correct, -0.25 Negative Penalty per wrong answer, 0 Blank.
- Target to Qualify: 150 / 200 (75% net marks).

Candidate Mock Strategy (Fixed Plan):
- Next Mock: Exactly in 3 days (September 8).
- Final Sprint: 3 consecutive full mocks on September 12, September 13, and September 14.
- Official Exam: September 15.

Your task:
Analyze her performance and explain practical, real-time exam mechanics:
1. Explain WHY the mistakes happen (the psychological/time traps).
2. Explain HOW IT WILL WORK FOR HER in real-time (the exact physical rules during the test).
3. Provide realistic 10-day roadmap aligned with her mock dates.

STRICT REQUIREMENT: Output pure JSON matching this exact structure with NO markdown wraps:
{
  "executiveSummary": "string",
  "overallScoreDiagnostic": {
    "currentStatus": "string",
    "gapTo150Target": number,
    "scoreLeakCauses": ["string", "string"]
  },
  "sectionWiseAnalysis": {
    "reasoning": { "strengthAreas": ["string"], "mistakePatterns": ["string"], "actionPlan": ["string"] },
    "quant": { "strengthAreas": ["string"], "mistakePatterns": ["string"], "actionPlan": ["string"] },
    "ga": { "strengthAreas": ["string"], "mistakePatterns": ["string"], "actionPlan": ["string"] },
    "english": { "strengthAreas": ["string"], "mistakePatterns": ["string"], "actionPlan": ["string"] }
  },
  "howItWorksForYou": [
    {
      "section": "QUANT",
      "title": "The 2-Pass Elimination Rule",
      "mistakeBreakdown": "string",
      "realTimeExecutionRule": "string",
      "expectedMarkJump": "+15 to +20 Net Marks"
    },
    {
      "section": "GA",
      "title": "The 5-Second Zero-Guessing Discipline",
      "mistakeBreakdown": "string",
      "realTimeExecutionRule": "string",
      "expectedMarkJump": "+4.5 Net Marks (Immediate Save)"
    },
    {
      "section": "REASONING",
      "title": "Scratch-Paper Sign Transformation",
      "mistakeBreakdown": "string",
      "realTimeExecutionRule": "string",
      "expectedMarkJump": "+8 Net Marks"
    }
  ],
  "timeManagementReview": {
    "timeTraps": ["string"],
    "recommendedTimeAllocation": "Reasoning 40m, GA 15m, Quant 60m, English 30m, Review buffer 35m"
  },
  "negativeMarkingStrategy": {
    "marksLostToWildGuesses": number,
    "accuracyTargetAdvice": "string"
  },
  "actionableStudyRoadmap": [
    { "phase": "Days 1-3 (Preparation for Mock #6)", "focus": "string", "tasks": ["string"] },
    { "phase": "Days 4-7 (Remediation & Topic Polish)", "focus": "string", "tasks": ["string"] },
    { "phase": "Days 8-10 (3 Consecutive Mocks & D-Day Sept 15)", "focus": "string", "tasks": ["string"] }
  ]
}`;

  const userPrompt = `Candidate Name: ${candidate}
Mock Paper: ${mockTitle || "NBEMS Junior Assistant Full Mock"}
Overall Net Score: ${net} / 200 (Target: 150.00, Gap: ${gap} marks)
Accuracy: ${score.accuracyPercentage}%
Total Correct (+1.00): ${score.correctCount}
Total Wrong (-0.25): ${score.wrongCount} (Penalty: -${score.negativePenalty} marks)
Total Unanswered: ${score.unansweredCount}
Total Time Taken: ${Math.floor(attempt.timeTakenSeconds / 60)} minutes

Sectional Performance Breakdown:
- REASONING: Net ${bySec.REASONING.netScore}/50 (${bySec.REASONING.correct}C, ${bySec.REASONING.wrong}W, ${bySec.REASONING.unanswered}S, ${Math.floor(bySec.REASONING.timeSpentSeconds / 60)}m)
- GA: Net ${bySec.GA.netScore}/50 (${bySec.GA.correct}C, ${bySec.GA.wrong}W, ${bySec.GA.unanswered}S, ${Math.floor(bySec.GA.timeSpentSeconds / 60)}m)
- QUANT: Net ${bySec.QUANT.netScore}/50 (${bySec.QUANT.correct}C, ${bySec.QUANT.wrong}W, ${bySec.QUANT.unanswered}S, ${Math.floor(bySec.QUANT.timeSpentSeconds / 60)}m)
- ENGLISH: Net ${bySec.ENGLISH.netScore}/50 (${bySec.ENGLISH.correct}C, ${bySec.ENGLISH.wrong}W, ${bySec.ENGLISH.unanswered}S, ${Math.floor(bySec.ENGLISH.timeSpentSeconds / 60)}m)

Generate the JSON diagnostic analysis adhering strictly to the 10-day exam countdown and practical real-time execution mechanics.`;

  try {
    const aiResult = await callAiWithFallback(systemPrompt, userPrompt);
    const cleaned = cleanJsonResponse(aiResult.text);
    const parsed = JSON.parse(cleaned);

    return {
      generatedAt: new Date().toISOString(),
      provider: aiResult.provider,
      model: aiResult.model,
      executiveSummary: parsed.executiveSummary || `Performance diagnosis for ${net}/200 with ${gap} marks to target.`,
      overallScoreDiagnostic: parsed.overallScoreDiagnostic || {
        currentStatus: net >= 150 ? "Qualifying Target Cleared" : "Below 150 Benchmark",
        gapTo150Target: gap,
        scoreLeakCauses: [`Negative penalties consumed ${score.negativePenalty} marks`],
      },
      sectionWiseAnalysis: parsed.sectionWiseAnalysis || {
        reasoning: { strengthAreas: [], mistakePatterns: [], actionPlan: [] },
        quant: { strengthAreas: [], mistakePatterns: [], actionPlan: [] },
        ga: { strengthAreas: [], mistakePatterns: [], actionPlan: [] },
        english: { strengthAreas: [], mistakePatterns: [], actionPlan: [] },
      },
      howItWorksForYou: parsed.howItWorksForYou || getHeuristicHowItWorks(attempt),
      timeManagementReview: parsed.timeManagementReview || {
        timeTraps: [`Spent ${Math.floor(bySec.QUANT.timeSpentSeconds / 60)} minutes in Quant`],
        recommendedTimeAllocation: "Reasoning 40m, GA 15m, Quant 60m, English 30m, Review buffer 35m",
      },
      negativeMarkingStrategy: parsed.negativeMarkingStrategy || {
        marksLostToWildGuesses: score.negativePenalty,
        accuracyTargetAdvice: "Only mark when eliminating 2 options.",
      },
      actionableStudyRoadmap: parsed.actionableStudyRoadmap || getHeuristic10DayRoadmap(),
    };
  } catch (err) {
    console.warn("AI call failed or returned invalid JSON. Using heuristic engine:", err);
    return generateHeuristicSingleAnalysis(attempt, mockTitle);
  }
}

/**
 * Generate multi-mock longitudinal analysis across all completed attempts
 */
export async function generateMultiMockAnalysis(
  candidateName: string,
  attempts: (Attempt & { mockTitle?: string })[]
): Promise<MultiMockAIAnalysis> {
  const attemptsWithScore = attempts
    .filter((a) => a.score)
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

  if (attemptsWithScore.length === 0) {
    throw new Error("No completed attempts found for candidate");
  }

  const progression = attemptsWithScore.map((a, i) => ({
    mockTitle: a.mockTitle || `Mock Test #${i + 1}`,
    netScore: a.score?.netScore || 0,
    accuracy: a.score?.accuracyPercentage || 0,
    penalty: a.score?.negativePenalty || 0,
  }));

  const systemPrompt = `You are the Chief Academic Mentor for NBEMS Junior Assistant Examination.
The candidate has completed ${attemptsWithScore.length} full-length 200-question mock tests.
Target to qualify: 150 / 200 net marks. Marking: +1.00 / -0.25.

CRITICAL 10-DAY COUNTDOWN CONTEXT:
- The official paper exam is on SEPTEMBER 15, 2026 (Exactly 10 days away).
- Her plan: 1 mock in 3 days (Sept 8), then 3 consecutive mocks on September 12, September 13, and September 14.
- Explain "HOW IT WORKS FOR HER": Give concrete, relatable exam execution rules so she understands exactly why she gets trapped in Math and GA, and how to fix it physically in the exam hall.

STRICT REQUIREMENT: Output pure JSON matching this exact structure with NO markdown wraps:
{
  "scoreTrajectorySummary": "string",
  "longitudinalStrengths": ["string"],
  "chronicWeaknesses": [
    {
      "section": "QUANT" | "GA" | "REASONING" | "ENGLISH",
      "pattern": "string",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM",
      "remedy": "string"
    }
  ],
  "reasoningDeepDive": {
    "status": "string",
    "observedErrors": ["string"],
    "stepByStepImprovement": ["string"]
  },
  "mathematicsDeepDive": {
    "status": "string",
    "observedErrors": ["string"],
    "stepByStepImprovement": ["string"]
  },
  "howItWorksForYou": [
    {
      "section": "QUANT",
      "title": "The 2-Pass Rule: Stop Investing 97 Minutes for 16 Marks",
      "mistakeBreakdown": "string",
      "realTimeExecutionRule": "string",
      "expectedMarkJump": "+18 Net Marks"
    },
    {
      "section": "GA",
      "title": "The 5-Second Zero-Guessing Rule: Stop Gifting 4.5 Marks to the Examiner",
      "mistakeBreakdown": "string",
      "realTimeExecutionRule": "string",
      "expectedMarkJump": "+4.50 Net Marks"
    },
    {
      "section": "REASONING",
      "title": "Scratch-Paper Sign Transformation: Elevate Strongest Section to 42+",
      "mistakeBreakdown": "string",
      "realTimeExecutionRule": "string",
      "expectedMarkJump": "+8 Net Marks"
    }
  ],
  "timeAllocationCritique": {
    "detectedImbalance": "string",
    "idealStrategy": "string"
  },
  "examCountdownSchedule": {
    "daysRemaining": 10,
    "examDate": "September 15, 2026",
    "milestones": [
      { "date": "Sept 5 - 7 (Next 3 Days)", "title": "Targeted Revision & Remedial Drills", "objective": "string", "isMockDay": false },
      { "date": "Sept 8 (In 3 Days)", "title": "Full Mock Test #6", "objective": "string", "isMockDay": true },
      { "date": "Sept 9 - 11", "title": "Fine-Tuning & Error Correction", "objective": "string", "isMockDay": false },
      { "date": "Sept 12", "title": "Full Mock Test #7", "objective": "string", "isMockDay": true },
      { "date": "Sept 13", "title": "Full Mock Test #8", "objective": "string", "isMockDay": true },
      { "date": "Sept 14", "title": "Full Mock Test #9 (Confidence Booster)", "objective": "string", "isMockDay": true },
      { "date": "Sept 15", "title": "NBEMS Official Paper Examination", "objective": "string", "isMockDay": false }
    ]
  },
  "personalizedMasterPlan": [
    { "weekOrDay": "Phase 1: In 3 Days (Sept 8 Mock Test)", "goal": "string", "dailyActionItems": ["string"] },
    { "weekOrDay": "Phase 2: Error Correction (Sept 9 - 11)", "goal": "string", "dailyActionItems": ["string"] },
    { "weekOrDay": "Phase 3: Triple-Mock Simulation (Sept 12 - 14)", "goal": "string", "dailyActionItems": ["string"] }
  ]
}`;

  const userPrompt = `Candidate Name: ${candidateName}
Total Mocks Completed: ${attemptsWithScore.length}

Historical Mocks Progression:
${attemptsWithScore
  .map((a, i) => {
    const s = a.score!;
    const sec = s.bySection;
    return `Mock #${i + 1} (${a.mockTitle || "Mock"}):
  - Net: ${s.netScore}/200 | Acc: ${s.accuracyPercentage}% | Penalty: -${s.negativePenalty} marks (${s.wrongCount} wrong)
  - Reasoning: Net ${sec.REASONING.netScore} (${sec.REASONING.correct}C, ${sec.REASONING.wrong}W, ${Math.floor(sec.REASONING.timeSpentSeconds / 60)}m)
  - GA: Net ${sec.GA.netScore} (${sec.GA.correct}C, ${sec.GA.wrong}W, ${Math.floor(sec.GA.timeSpentSeconds / 60)}m)
  - Quant: Net ${sec.QUANT.netScore} (${sec.QUANT.correct}C, ${sec.QUANT.wrong}W, ${Math.floor(sec.QUANT.timeSpentSeconds / 60)}m)
  - English: Net ${sec.ENGLISH.netScore} (${sec.ENGLISH.correct}C, ${sec.ENGLISH.wrong}W, ${Math.floor(sec.ENGLISH.timeSpentSeconds / 60)}m)`;
  })
  .join("\n\n")}

Analyze the multi-mock performance data and generate the JSON report tailored to her 10-day timeline and practical exam mechanics.`;

  try {
    const aiResult = await callAiWithFallback(systemPrompt, userPrompt);
    const cleaned = cleanJsonResponse(aiResult.text);
    const parsed = JSON.parse(cleaned);

    return {
      generatedAt: new Date().toISOString(),
      provider: aiResult.provider,
      model: aiResult.model,
      candidateName,
      totalMocksAnalyzed: attemptsWithScore.length,
      scoreTrajectorySummary:
        parsed.scoreTrajectorySummary ||
        `${candidateName} has completed ${attemptsWithScore.length} mock tests. Net scores plateau between 94.75 and 97.25, with a personal best of 129.25.`,
      netScoreProgression: progression,
      longitudinalStrengths: parsed.longitudinalStrengths || [],
      chronicWeaknesses: parsed.chronicWeaknesses || [],
      reasoningDeepDive: parsed.reasoningDeepDive || {
        status: "Strongest section (34 marks), but 8 avoidable errors prevent 42+",
        observedErrors: [],
        stepByStepImprovement: [],
      },
      mathematicsDeepDive: parsed.mathematicsDeepDive || {
        status: "Critical bottleneck: 97 mins spent for only 16 net marks",
        observedErrors: [],
        stepByStepImprovement: [],
      },
      howItWorksForYou: parsed.howItWorksForYou || getHeuristicMultiHowItWorks(),
      timeAllocationCritique: parsed.timeAllocationCritique || {
        detectedImbalance: "Over 50% of the exam (97 mins) spent on Quant, starving GA and English.",
        idealStrategy: "Reasoning 40m, GA 15m, Quant 60m, English 30m, Review 35m.",
      },
      examCountdownSchedule: parsed.examCountdownSchedule || getHeuristic10DayCountdown(),
      personalizedMasterPlan: parsed.personalizedMasterPlan || getHeuristicMasterPlan(),
    };
  } catch (err) {
    console.warn("Multi-mock AI failed or returned invalid JSON. Using heuristic multi-mock generator:", err);
    return generateHeuristicMultiMockAnalysis(candidateName, attemptsWithScore);
  }
}

// -------------------------------------------------------------
// HEURISTIC / DETERMINISTIC LOGIC FOR HIGH-QUALITY FALLBACKS
// -------------------------------------------------------------

function getHeuristicHowItWorks(attempt: Attempt) {
  const score = attempt.score!;
  const sec = score.bySection;
  const quantMins = Math.floor(sec.QUANT.timeSpentSeconds / 60);

  return [
    {
      section: "QUANT",
      title: "The 2-Pass Rule: Stop Spending " + quantMins + " Minutes on Math",
      mistakeBreakdown:
        "When you see a complex 4-line problem (e.g. compound interest or mixture ratios), you pause and spend 4 to 5 minutes calculating, second-guessing, and panicking. That single habit cost you " +
        quantMins +
        " minutes and resulted in " +
        sec.QUANT.wrong +
        " wrong answers!",
      realTimeExecutionRule:
        "Pass 1 (First 25 mins): Read question stem. If you don't know the first calculation step within 10 seconds, click 'Next' immediately. Solve ONLY the 20 direct 1-line Simplification, Percentage, and DI chart questions. Pass 2 (Next 25 mins): Return and solve 10 problems with known formulas. At 55 mins, HARD STOP and move to the next section.",
      expectedMarkJump: "+15 to +18 Net Marks",
    },
    {
      section: "GA",
      title: "The 5-Second Zero-Guessing Rule: Stop Gifting Negative Marks",
      mistakeBreakdown:
        "You attempted " +
        (sec.GA.correct + sec.GA.wrong) +
        " questions in GA, getting " +
        sec.GA.correct +
        " correct and " +
        sec.GA.wrong +
        " wrong. Those " +
        sec.GA.wrong +
        " wrong guesses penalized you -" +
        (sec.GA.wrong * 0.25).toFixed(2) +
        " marks, dropping your net score from " +
        sec.GA.correct +
        " down to " +
        sec.GA.netScore +
        "!",
      realTimeExecutionRule:
        "In General Awareness, you either recall the fact or you don't. If you cannot decisively eliminate at least 2 options, leave it blank! An unattempted question gives 0. A wild guess costs -0.25 net marks. By simply skipping those " +
        sec.GA.wrong +
        " questions, your GA score instantly jumps from " +
        sec.GA.netScore +
        " to " +
        sec.GA.correct +
        ".00 without studying a single new page!",
      expectedMarkJump: "+" + (sec.GA.wrong * 0.25).toFixed(2) + " Net Marks (Instant Save)",
    },
    {
      section: "REASONING",
      title: "Scratch-Paper Sign Rule: Elevate Your Strongest Section to 42+",
      mistakeBreakdown:
        "Reasoning is already your best section (" +
        sec.REASONING.netScore +
        "/50). You only missed " +
        sec.REASONING.wrong +
        " questions. Why? Rushing equation sign interchanges (+ into -, * into /) in your head under timer adrenaline.",
      realTimeExecutionRule:
        "Never perform mathematical sign interchanges mentally. Take 3 seconds to write the substituted equation onto your physical scratch paper. That one physical habit will eliminate all sign blunders and turn your " +
        sec.REASONING.netScore +
        " into 42+ net marks.",
      expectedMarkJump: "+8 Net Marks",
    },
  ];
}

function getHeuristicMultiHowItWorks() {
  return [
    {
      section: "QUANT",
      title: "The 2-Pass Rule: Stop Investing 97 Minutes for 16 Marks",
      mistakeBreakdown:
        "Across all 5 mocks, you consistently spend 90 to 97 minutes on Quantitative Aptitude, yet your net score remains stuck at 16–25 marks with 20–21 wrong answers. You get emotionally trapped on difficult problems early on, draining your cognitive stamina.",
      realTimeExecutionRule:
        "Enforce a strict 2-Pass Strategy: In Pass 1 (first 25 mins), hunt down and solve only the 20 direct 1-line Simplifications and DI tables. In Pass 2 (next 25 mins), solve 10-12 questions with familiar formulas. At minute 55, HARD STOP and move on. This saves 35+ minutes for GA and English and cuts out 15 calculation blunders.",
      expectedMarkJump: "+16 to +20 Net Marks",
    },
    {
      section: "GA",
      title: "The 5-Second Elimination Rule: Stop Gifting 4.5 Marks to the Examiner",
      mistakeBreakdown:
        "In every mock test, you commit 12 to 18 incorrect guesses in General Awareness. That costs you -3.00 to -4.50 net marks every single session. An unattempted question gives 0; a wild guess steals net score.",
      realTimeExecutionRule:
        "Spend no more than 5 seconds per GA question. If you cannot eliminate at least 2 options, click Next without guessing. By simply skipping unfamiliar facts, your GA net score jumps from 16.5 to 21+ immediately with zero risk.",
      expectedMarkJump: "+4.50 Net Marks (Instant Save)",
    },
    {
      section: "REASONING",
      title: "Scratch-Paper Sign Transformation: Elevate Strongest Section to 42+",
      mistakeBreakdown:
        "Reasoning is your core scoring engine (33-34 marks). The 6-8 errors you make in series and equation interchanges are purely due to mental math under timer stress.",
      realTimeExecutionRule:
        "Write out sign substitutions on physical scratch paper and solve family tree problems with direct symbols (+ male, - female). This pushes your score from 34 to 42+ net marks, which anchors your total score above 150.",
      expectedMarkJump: "+8 Net Marks",
    },
  ];
}

function getHeuristic10DayRoadmap() {
  return [
    {
      phase: "Next 3 Days (Sept 5 - 7)",
      focus: "Quant 2-Pass Drill & GA Elimination Discipline",
      tasks: [
        "Practice 50 Quant questions using the 2-pass timer: 25 mins for easy items, 25 mins for formula items",
        "Review all 61 wrong answers from Mock #4 and Mock #5 with solution explanations",
        "Revise Top 100 Static GK Facts (Constitution Articles, National Parks, Classical Dances)",
      ],
    },
    {
      phase: "Mock in 3 Days (Sept 8)",
      focus: "Full Mock #6 with Strict 60-Minute Quant Cap",
      tasks: [
        "Take NBE Full Mock #6 enforcing strict time caps: Reasoning 40m, GA 15m, Quant 60m, English 30m",
        "Enforce zero wild guessing in GA to achieve >80% accuracy",
        "Target Net Score: 125+ marks",
      ],
    },
    {
      phase: "The Final Sprint (Sept 12 - 15)",
      focus: "3 Consecutive Mocks (Sept 12, 13, 14) & Exam Day (Sept 15)",
      tasks: [
        "Sept 12: Mock #7 (9:00 AM - 12:00 PM simulation) — Target: 135+ marks",
        "Sept 13: Mock #8 (9:00 AM - 12:00 PM simulation) — Target: 145+ marks",
        "Sept 14: Mock #9 (Light confidence mock) — Target: 150+ Qualifying Cleared",
        "Sept 15: NBEMS Junior Assistant Official Examination Day!",
      ],
    },
  ];
}

function getHeuristic10DayCountdown() {
  return {
    daysRemaining: 10,
    examDate: "September 15, 2026",
    milestones: [
      {
        date: "Sept 5 - 7 (Next 3 Days)",
        title: "Remedial Sprint & Error Correction",
        objective: "Master the Quant 2-pass strategy and practice zero-guessing discipline in GA.",
        isMockDay: false,
      },
      {
        date: "Sept 8 (In 3 Days)",
        title: "Full Mock Test #6",
        objective: "Execute strict 60m Quant time cap. Goal: Break 125+ net marks with >75% accuracy.",
        isMockDay: true,
      },
      {
        date: "Sept 9 - 11",
        title: "Post-Mock Analysis & Formula Retention",
        objective: "Review Mock #6 mistakes; memorize arithmetic fraction tables and grammar rules.",
        isMockDay: false,
      },
      {
        date: "Sept 12",
        title: "Full Mock Test #7 (Exam Hall Simulation)",
        objective: "Simulate real exam slot (9:00 AM - 12:00 PM). Target: 135+ net marks.",
        isMockDay: true,
      },
      {
        date: "Sept 13",
        title: "Full Mock Test #8",
        objective: "Lock in Reasoning 42+ net marks. Target: 145+ net marks.",
        isMockDay: true,
      },
      {
        date: "Sept 14",
        title: "Full Mock Test #9 (Confidence Booster)",
        objective: "Final rehearsal before exam day. Verify 150+ qualifying benchmark.",
        isMockDay: true,
      },
      {
        date: "Sept 15",
        title: "NBEMS Official Paper Examination",
        objective: "Official Exam Day: Execute the trained pacing and qualify comfortably!",
        isMockDay: false,
      },
    ],
  };
}

function getHeuristicMasterPlan() {
  return [
    {
      weekOrDay: "Phase 1: In 3 Days (Mock #6 on Sept 8)",
      goal: "Raise accuracy from 64% to 75%+ by enforcing strict 60-minute Quant cap and zero blind guessing",
      dailyActionItems: [
        "Practice 25 questions of Quant Simplification & DI tables in 25 minutes",
        "Revise Indian Polity and National Parks for General Awareness",
        "Take Mock #6 on Sept 8 adhering to 40m/15m/60m/30m time blocks",
      ],
    },
    {
      weekOrDay: "Phase 2: Error Correction (Sept 9 - 11)",
      goal: "Eliminate reasoning sign errors and reinforce arithmetic formulas",
      dailyActionItems: [
        "Audit Mock #6: Categorize every mistake into calculation vs formula vs rushed",
        "Write out sign substitutions on paper for 30 equation problems",
        "Practice 2 reading comprehension passages and 2 cloze tests daily",
      ],
    },
    {
      weekOrDay: "Phase 3: Triple-Mock Simulation (Sept 12, 13, 14)",
      goal: "Simulate official CBT test conditions on 3 consecutive days to clear 150+ qualifying benchmark",
      dailyActionItems: [
        "Sept 12: Mock #7 (9 AM - 12 PM) - Target: 135+ Net Marks",
        "Sept 13: Mock #8 (9 AM - 12 PM) - Target: 145+ Net Marks",
        "Sept 14: Mock #9 (9 AM - 12 PM) - Target: 150+ Benchmark Cleared",
        "Sept 15: Rest, stay confident, and conquer the official NBEMS exam!",
      ],
    },
  ];
}

function generateHeuristicSingleAnalysis(attempt: Attempt, mockTitle?: string): DeepAIAnalysis {
  const score = attempt.score!;
  const sec = score.bySection;
  const gap = Number(Math.max(0, 150 - score.netScore).toFixed(2));
  const quantMinutes = Math.floor(sec.QUANT.timeSpentSeconds / 60);

  return {
    generatedAt: new Date().toISOString(),
    provider: "NBE Arena Heuristic Diagnostic Engine",
    model: "NBEMS CBT Syllabus Rules Engine v2.0",
    executiveSummary: `Current net score of ${score.netScore}/200 leaves a gap of ${gap} marks to the 150-mark qualifying target with 10 days until the September 15 exam. Your primary score drain is negative marking (-${score.negativePenalty} marks from ${score.wrongCount} incorrect answers) and a major time sink in Quantitative Aptitude (${quantMinutes} mins).`,
    overallScoreDiagnostic: {
      currentStatus: score.netScore >= 150 ? "Benchmark Cleared" : "Below 150 Benchmark",
      gapTo150Target: gap,
      scoreLeakCauses: [
        `Negative penalties consumed ${score.negativePenalty} net marks (-0.25 per wrong answer)`,
        `Over-allocated ${quantMinutes} minutes to Quant, compressing time available for GA and English`,
        `Attempting low-confidence questions in General Awareness and Math`,
      ],
    },
    sectionWiseAnalysis: {
      reasoning: {
        strengthAreas: ["Strongest scoring section (34 marks)", "Fast execution compared to Quant"],
        mistakePatterns: [
          "Careless errors in mathematical operation interchange (+/-/*)",
          "Subtle rotational orientation errors in non-verbal series",
        ],
        actionPlan: [
          "Always write substituted equation on scratch paper before calculating",
          "Double-check paper folding and mirror images before locking answer",
        ],
      },
      quant: {
        strengthAreas: ["Good understanding of basic percentage concepts"],
        mistakePatterns: [
          `Excessive time spent (${quantMinutes} mins) for only ${sec.QUANT.netScore} marks`,
          `High blunder rate: ${sec.QUANT.wrong} wrong answers (-${(sec.QUANT.wrong * 0.25).toFixed(2)} marks lost)`,
        ],
        actionPlan: [
          "Implement 2-pass strategy: solve direct arithmetic in Round 1, skip all 4-line word problems",
          "Hard stop at 60 minutes to protect time for GA and English",
        ],
      },
      ga: {
        strengthAreas: ["Fast completion time (17 mins)"],
        mistakePatterns: [
          `Blind guessing: ${sec.GA.wrong} wrong answers penalized -${(sec.GA.wrong * 0.25).toFixed(2)} marks`,
        ],
        actionPlan: [
          "Follow 5-second rule: Skip immediately if unable to eliminate 2 options",
          "Revise high-frequency topics: Constitution Articles, National Parks, Classical Dances",
        ],
      },
      english: {
        strengthAreas: ["Steady baseline (29.25 marks)"],
        mistakePatterns: ["Grammar rule exceptions in Error Spotting"],
        actionPlan: [
          "Review Subject-Verb agreement and Preposition rules",
          "Practice context clue elimination in Cloze Test passages",
        ],
      },
    },
    howItWorksForYou: getHeuristicHowItWorks(attempt),
    timeManagementReview: {
      timeTraps: [
        `Spent ${quantMinutes} minutes in Quantitative Aptitude (ideal: 55-60 minutes max)`,
        "Spending excessive continuous time on single math questions without banking easy marks across all 4 sections",
      ],
      recommendedTimeAllocation:
        "Reasoning: 40 mins | General Awareness: 15 mins | Quantitative Aptitude: 60 mins | English: 30 mins | Buffer/Review: 35 mins",
    },
    negativeMarkingStrategy: {
      marksLostToWildGuesses: score.negativePenalty,
      accuracyTargetAdvice: `Cutting your ${score.wrongCount} mistakes down by half immediately saves +${(score.negativePenalty / 2).toFixed(2)} marks, lifting your net score to ${(score.netScore + score.negativePenalty / 2).toFixed(2)}.`,
    },
    actionableStudyRoadmap: getHeuristic10DayRoadmap(),
  };
}

function generateHeuristicMultiMockAnalysis(
  candidateName: string,
  attempts: Attempt[]
): MultiMockAIAnalysis {
  const scores = attempts.map((a) => a.score!.netScore);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const avgScore = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
  const avgAccuracy = Number(
    (attempts.reduce((a, b) => a + (b.score?.accuracyPercentage || 0), 0) / attempts.length).toFixed(1)
  );

  const progression = attempts.map((a, idx) => ({
    mockTitle: a.mockTitle || `Full Mock #${idx + 1}`,
    netScore: a.score!.netScore,
    accuracy: a.score!.accuracyPercentage,
    penalty: a.score!.negativePenalty,
  }));

  return {
    generatedAt: new Date().toISOString(),
    provider: "NBE Arena Heuristic Diagnostic Engine",
    model: "Multi-Mock Longitudinal Pattern Engine v2.0",
    candidateName,
    totalMocksAnalyzed: attempts.length,
    scoreTrajectorySummary: `${candidateName} has completed ${attempts.length} full CBT mocks. Net scores fluctuate between ${minScore} and ${maxScore} (average: ${avgScore}/200, average accuracy: ${avgAccuracy}%). With 10 days remaining until the September 15 exam, scores are plateauing around 95-97 marks due to persistent negative penalties (-12 to -15 marks per mock) and heavy time consumption in Quantitative Aptitude (90-97 mins).`,
    netScoreProgression: progression,
    longitudinalStrengths: [
      "Consistent stamina: Completes all 200 questions across 180 minutes without fatigue collapse",
      "Reasoning Net Score reaches 33-34 marks, showing strong potential to anchor 42+ marks",
      "English Comprehension provides a solid foundation (26-34 marks)",
    ],
    chronicWeaknesses: [
      {
        section: "QUANT",
        pattern: "Low Net Score Plateau (16-25 marks) with heavy time consumption (90-97 minutes)",
        severity: "CRITICAL",
        remedy: "Enforce strict question-selection triage. Do not get emotionally attached to stubborn math problems.",
      },
      {
        section: "GA",
        pattern: "High negative penalty drain with 12 to 18 wrong answers in almost every session",
        severity: "HIGH",
        remedy: "Stop guessing unfamiliar static GK facts. An unattempted question gives 0; a wrong guess costs -0.25 marks.",
      },
      {
        section: "REASONING",
        pattern: "Avoidable calculation mistakes in sign interchanges",
        severity: "MEDIUM",
        remedy: "Target 42+ net marks in Reasoning by writing transformations on scratch paper.",
      },
    ],
    reasoningDeepDive: {
      status: "Strongest section (34 marks), but 8 avoidable errors prevent 42+",
      observedErrors: [
        "Silly errors in equation sign interchanges under timer adrenaline",
        "Overlooking subtle rotation in non-verbal figure series",
      ],
      stepByStepImprovement: [
        "Step 1: Write family tree symbols (+ for male, - for female, = for couple) immediately",
        "Step 2: Solve 50 non-verbal pattern questions to make mirror and paper-folding recognition instantaneous",
        "Step 3: Target 42+ net marks in Reasoning to carry the aggregate score to 150+",
      ],
    },
    mathematicsDeepDive: {
      status: "Severe bottleneck: 90+ minutes invested for only 16-25 net marks",
      observedErrors: [
        "Getting trapped in lengthy calculation questions early in the section",
        "High blunder rate: Up to 20-21 incorrect answers per mock test in Quant",
      ],
      stepByStepImprovement: [
        "Step 1: Divide Quant into 2 rounds. Round 1 (25 mins): Solve only direct arithmetic and DI tables.",
        "Step 2: Round 2 (25 mins): Tackle Time/Work and Profit/Loss with clear formulas.",
        "Step 3: Hard-stop at 55-60 minutes to protect time for General Awareness and English.",
      ],
    },
    howItWorksForYou: getHeuristicMultiHowItWorks(),
    timeAllocationCritique: {
      detectedImbalance:
        "Spending over 50% of the entire 3-hour exam (90-97 minutes) on Mathematics alone, leaving insufficient cognitive energy and time for General Awareness and English.",
      idealStrategy:
        "Cap Quant at exactly 60 minutes. Allocate: Reasoning 40 mins, GA 15 mins, English 30 mins, Quant 60 mins, Review buffer 35 mins.",
    },
    examCountdownSchedule: getHeuristic10DayCountdown(),
    personalizedMasterPlan: getHeuristicMasterPlan(),
  };
}

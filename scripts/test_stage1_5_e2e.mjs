const BASE_URL = "http://localhost:3000";

async function runE2ETest() {
  console.log("=== STAGE 1.5 E2E INTEGRATION TEST (MONGODB ATLAS & PRE-EXAM FLOW) ===");

  // 1. Bank Stats (MongoDB Atlas)
  console.log("\n1. Testing GET /api/bank-stats...");
  const statsRes = await fetch(`${BASE_URL}/api/bank-stats`);
  if (!statsRes.ok) {
    throw new Error(`GET /api/bank-stats failed with status ${statsRes.status}`);
  }
  const stats = await statsRes.json();
  console.log("Bank Stats response:", {
    total: stats.total,
    bySection: stats.bySection,
  });

  if (stats.total < 200) {
    throw new Error(`Expected at least 200 questions in MongoDB Atlas, got ${stats.total}`);
  }
  if (
    stats.bySection.REASONING < 50 ||
    stats.bySection.GA < 50 ||
    stats.bySection.QUANT < 50 ||
    stats.bySection.ENGLISH < 50
  ) {
    throw new Error("Missing 50 questions per section in MongoDB Atlas");
  }
  console.log("✓ Bank Stats verified in MongoDB Atlas (200 questions: 50x4).");

  // 2. Generate 200-question Mock in MongoDB Atlas
  console.log("\n2. Testing POST /api/generate-mock...");
  const genRes = await fetch(`${BASE_URL}/api/generate-mock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "NBE Junior Assistant Stage 1.5 Cloud Mock" }),
  });
  if (!genRes.ok) {
    const err = await genRes.text();
    throw new Error(`POST /api/generate-mock failed: ${err}`);
  }
  const genData = await genRes.json();
  console.log("Generated Mock:", {
    mockId: genData.mockId,
    title: genData.title,
    questionCounts: genData.questionCounts,
  });

  if (
    genData.questionCounts.REASONING !== 50 ||
    genData.questionCounts.GA !== 50 ||
    genData.questionCounts.QUANT !== 50 ||
    genData.questionCounts.ENGLISH !== 50
  ) {
    throw new Error("Mock does not have exactly 50 questions per section");
  }
  console.log("✓ Mock created in MongoDB with exact 200 questions (50x4).");

  // 3. Hydrate Mock (Cheating Protection)
  console.log("\n3. Testing GET /api/mock/[mockId] (Hidden answers during CBT)...");
  const mockRes = await fetch(`${BASE_URL}/api/mock/${genData.mockId}`);
  if (!mockRes.ok) {
    throw new Error(`GET /api/mock/${genData.mockId} failed with ${mockRes.status}`);
  }
  const mockData = await mockRes.json();
  const qIds = Object.keys(mockData.questions);
  console.log(`Retrieved ${qIds.length} hydrated questions for live test.`);

  const hasExposedAnswer = Object.values(mockData.questions).some(
    (q) => q.correctOption !== undefined
  );
  if (hasExposedAnswer) {
    throw new Error("SECURITY FAILURE: correctOption exposed in live test payload!");
  }
  console.log("✓ Security verified: correctOption is securely hidden for candidate.");

  // 4. Simulate Pre-Exam Instructions Flow & Attempt Submission
  console.log("\n4. Simulating Pre-Exam Instructions Read & Test Submission...");
  // Answer first 20 Reasoning questions (16 correct, 4 wrong) + leave 180 unanswered
  const answers = [];
  const reasoningIds = mockData.sections.REASONING;

  // We craft 20 answers
  for (let i = 0; i < 20; i++) {
    const qId = reasoningIds[i];
    answers.push({
      questionId: qId,
      selectedOption: i % 5 === 0 ? "b" : "a", // 16 option a, 4 option b
      status: "answered",
      timeSpentSeconds: 45,
    });
  }

  const submitPayload = {
    mockId: genData.mockId,
    attemptId: `att_stage1_5_test_${Date.now()}`,
    timeTakenSeconds: 3600, // 1 hour taken
    answers,
  };

  const submitRes = await fetch(`${BASE_URL}/api/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submitPayload),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`POST /api/submit failed: ${err}`);
  }
  const submitResult = await submitRes.json();
  console.log("Submit Response Scorecard:", submitResult.score);

  const score = submitResult.score;
  const expectedNet = Number((score.correctCount - score.wrongCount * 0.25).toFixed(2));
  if (score.netScore !== expectedNet) {
    throw new Error(
      `Negative marking math mismatch: expected ${expectedNet}, got ${score.netScore}`
    );
  }
  console.log(`✓ Negative Marking Math verified: Correct=${score.correctCount} (+${score.rawScore}), Wrong=${score.wrongCount} (-${score.negativePenalty}), Net=${score.netScore}`);

  // 5. Fetch Full Scorecard & Answer Keys Review
  console.log("\n5. Testing GET /api/results/[attemptId]...");
  const resultRes = await fetch(`${BASE_URL}/api/results/${submitPayload.attemptId}`);
  if (!resultRes.ok) {
    throw new Error(`GET /api/results failed: ${resultRes.status}`);
  }
  const resultData = await resultRes.json();
  console.log("Result Review details:", {
    attemptId: resultData.attempt.id,
    netScore: resultData.attempt.score.netScore,
    qualifyingCleared: resultData.attempt.score.qualifyingCleared,
    questionsReviewed: resultData.questionsWithReview.length,
  });

  if (resultData.questionsWithReview.length !== 200) {
    throw new Error(`Expected 200 reviewed questions, got ${resultData.questionsWithReview.length}`);
  }

  const firstRevQ = resultData.questionsWithReview[0];
  if (!firstRevQ.question || !firstRevQ.question.correctOption) {
    throw new Error("Answer key missing in post-submission review!");
  }
  console.log("✓ Post-submission solution review verified with revealed answer keys.");

  console.log("\n========================================================");
  console.log("🎉 ALL STAGE 1.5 INTEGRATION TESTS PASSED WITH 100% SUCCESS!");
  console.log("========================================================\n");
}

runE2ETest().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});

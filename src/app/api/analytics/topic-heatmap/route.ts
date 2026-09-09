import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAttempts, getQuestions } from "@/lib/db";
import {
  OFFICIAL_SYLLABUS_TOPICS,
  classifyQuestionToSyllabus,
  SyllabusTopicMetric,
} from "@/lib/syllabus-taxonomy";
import { SectionType } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const queryUserId = url.searchParams.get("userId");

    const userId = session?.user
      ? (session.user as unknown as { id: string }).id
      : queryUserId || undefined;

    // Load candidate attempts & full question pool
    const [attempts, questions] = await Promise.all([
      getAttempts(userId),
      getQuestions(),
    ]);

    const scoredAttempts = attempts.filter((a) => a.score);
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Initialize metrics for all official syllabus topics
    const topicMetricMap = new Map<string, SyllabusTopicMetric>();

    for (const def of OFFICIAL_SYLLABUS_TOPICS) {
      topicMetricMap.set(def.id, {
        id: def.id,
        name: def.name,
        section: def.section,
        description: def.description,
        totalTested: 0,
        correctCount: 0,
        wrongCount: 0,
        unansweredCount: 0,
        accuracyPercentage: 0,
        status: "UNTESTED",
      });
    }

    // Process every candidate attempt's answers
    for (const att of scoredAttempts) {
      if (!att.answers || !Array.isArray(att.answers)) continue;

      for (const ans of att.answers) {
        const q = questionMap.get(ans.questionId);
        if (!q) continue;

        const classified = classifyQuestionToSyllabus(
          q.questionText,
          Object.values(q.options || {}).join(" "),
          q.section
        );

        const metric = topicMetricMap.get(classified.id);
        if (!metric) continue;

        metric.totalTested += 1;

        const isAnswered = Boolean(ans.selectedOption);
        const isCorrect = isAnswered && ans.selectedOption === q.correctOption;

        if (isCorrect) {
          metric.correctCount += 1;
        } else if (isAnswered) {
          metric.wrongCount += 1;
        } else {
          metric.unansweredCount += 1;
        }
      }
    }

    // Calculate accuracy % and status for each topic
    const topicList: SyllabusTopicMetric[] = Array.from(topicMetricMap.values()).map(
      (m) => {
        const attemptedCount = m.correctCount + m.wrongCount;
        const acc =
          attemptedCount > 0
            ? Math.round((m.correctCount / attemptedCount) * 100)
            : 0;

        let status: SyllabusTopicMetric["status"] = "UNTESTED";
        if (m.totalTested > 0) {
          if (acc >= 75) status = "STRONG";
          else if (acc >= 50) status = "MODERATE";
          else status = "NEEDS_WORK";
        }

        return {
          ...m,
          accuracyPercentage: acc,
          status,
        };
      }
    );

    const testedTopicsCount = topicList.filter((t) => t.totalTested > 0).length;
    const totalTopicsCount = topicList.length;
    const coveragePercentage = Math.round(
      (testedTopicsCount / totalTopicsCount) * 100
    );

    // Identify weak and strong chapters for diagnostic advice
    const testedTopics = topicList.filter((t) => t.totalTested > 0);
    const strongTopics = [...testedTopics]
      .filter((t) => t.status === "STRONG")
      .sort((a, b) => b.accuracyPercentage - a.accuracyPercentage)
      .slice(0, 3);
    const weakTopics = [...testedTopics]
      .filter((t) => t.status === "NEEDS_WORK" || t.status === "MODERATE")
      .sort((a, b) => a.accuracyPercentage - b.accuracyPercentage)
      .slice(0, 3);

    return NextResponse.json(
      {
        topics: topicList,
        coverage: {
          testedTopicsCount,
          totalTopicsCount,
          coveragePercentage,
        },
        diagnostics: {
          strongTopics: strongTopics.map((t) => t.name),
          weakTopics: weakTopics.map((t) => t.name),
          summary:
            testedTopicsCount > 0
              ? `Candidate has practiced ${testedTopicsCount} of ${totalTopicsCount} syllabus topics (${coveragePercentage}% coverage). Priority revision required in: ${weakTopics.map((t) => t.name).join(", ") || "None (All strong)"}.`
              : "Complete your first mock test to generate syllabus topic diagnostics.",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/analytics/topic-heatmap:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate syllabus topic heatmap",
      },
      { status: 500 }
    );
  }
}

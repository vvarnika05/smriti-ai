
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Average score per topic
    const averageScorePerTopic = await prisma.quizResult.groupBy({
      by: ["quizId"],
      where: {
        userId: userId,
      },
      _avg: {
        score: true,
      },
    });

    // Most frequently missed questions
    const missedQuestions = await prisma.userAnswer.findMany({
      where: {
        userId: userId,
        isCorrect: false,
      },
      include: {
        quizQA: true,
      },
    });

    // Performance trends (last 30 days)
    const performanceTrends = await prisma.quizResult.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Prepare data for the AI model
    const aiPrompt = `
      Based on the following user performance data, provide personalized recommendations for improvement:

      - Average score per topic: ${JSON.stringify(averageScorePerTopic)}
      - Most frequently missed questions: ${JSON.stringify(missedQuestions)}
      - Performance trends: ${JSON.stringify(performanceTrends)}
    `;

    // --- Call your AI model here with the prompt ---
    // Example: const aiInsights = await callAiModel(aiPrompt);

    // For now, we'll use a placeholder for the AI insights
    const aiInsights = "You're doing great! Keep up the good work.";

    // Return the aggregated data and AI insights
    return NextResponse.json({
      averageScorePerTopic,
      missedQuestions,
      performanceTrends,
      aiInsights,
    });
  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

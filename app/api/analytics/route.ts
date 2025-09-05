
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper: ask Gemini
async function askGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

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
    const performanceTrends30Days = await prisma.quizResult.findMany({
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

    // Performance trends (last 7 days)
    const performanceTrends7Days = await prisma.quizResult.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
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
      - Performance trends (last 30 days): ${JSON.stringify(performanceTrends30Days)}
      - Performance trends (last 7 days): ${JSON.stringify(performanceTrends7Days)}
    `;

    const aiInsights = await askGemini(aiPrompt);

    // Return the aggregated data and AI insights
    return NextResponse.json({
      averageScorePerTopic,
      missedQuestions,
      performanceTrends30Days,
      performanceTrends7Days,
      aiInsights,
    });
  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

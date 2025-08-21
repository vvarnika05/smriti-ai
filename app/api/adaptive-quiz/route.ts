import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { getAdaptiveQuestion } from "@/lib/services/quizService"; 

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");
    const skillScore = parseInt(searchParams.get("skillScore") || "50", 10);
    const excludedIdsParam = searchParams.get("excludedIds") || "";
    const excludedIds = excludedIdsParam ? excludedIdsParam.split(',') : [];

    if (!quizId) {
      return new NextResponse("Quiz ID is required", { status: 400 });
    }

    const question = await getAdaptiveQuestion(quizId, skillScore, excludedIds);

    if (!question) {
      return NextResponse.json({ message: "No more questions available.", question: null });
    }

    return NextResponse.json({ question });

  } catch (error) {
    console.error("[GET_ADAPTIVE_QUESTION_API]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { questionId, userAnswer } = await req.json();
    if (!questionId || !userAnswer) {
      return new NextResponse("Question ID and user answer are required", { status: 400 });
    }

    const question = await db.quizQA.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return new NextResponse("Question not found", { status: 404 });
    }

    const isCorrect = question.correctAnswer === userAnswer;
    
    return NextResponse.json({
      isCorrect: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    });

  } catch (error) {
    console.error("[CHECK_ANSWER_API]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
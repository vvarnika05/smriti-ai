import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getLevelAndTtile } from "@/lib/levelUtils";
import { QuizQA } from "@prisma/client";

// Define a type for the data we expect from the frontend
type QuizSubmission = {
  quizId: string;
  answers: {
    quizQAId: string;
    selectedOption: string;
  }[];
};

// POST: Save quiz result
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { quizId, answers }: QuizSubmission = await req.json();

    if (!quizId || !answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { message: "Invalid submission data" },
        { status: 400 }
      );
    }

    // Fetch quiz and questions to verify answers
    const quizWithQAs = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        quizQAs: true,
      },
    });

    if (!quizWithQAs) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    let correctAnswersCount = 0;
    const userAnswersToCreate = [];

    // Check each submitted answer against the correct answer from the database
    for (const submittedAnswer of answers) {
      const quizQA: QuizQA | undefined = quizWithQAs.quizQAs.find(
        (q: QuizQA) => q.id === submittedAnswer.quizQAId
      );

      if (quizQA) {
        const isCorrect = submittedAnswer.selectedOption === quizQA.correctAnswer;
        if (isCorrect) {
          correctAnswersCount++;
        }
        userAnswersToCreate.push({
          userId,
          quizId,
          quizQAId: submittedAnswer.quizQAId,
          selectedOption: submittedAnswer.selectedOption,
          isCorrect,
        });
      }
    }

    // Save all user answers in a single batch
    await prisma.userAnswer.createMany({
      data: userAnswersToCreate,
    });

    // Create a new overall QuizResult record
    const quizResult = await prisma.quizResult.create({
      data: {
        quizId,
        score: correctAnswersCount,
        totalQuestions: quizWithQAs.quizQAs.length,
      },
    });

    // Award XP based on the number of correct answers
    const xpGain = correctAnswersCount * 5; // Example: 5 XP per correct answer
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        experience: {
          increment: xpGain,
        },
      },
    });

    const { level } = getLevelAndTtile(user.experience);
    await prisma.user.update({
      where: { id: userId },
      data: {
        level,
      },
    });

    return NextResponse.json(
      {
        message: "Quiz result and answers saved successfully",
        quizResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving quiz result:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Retrieve quiz results for a specific quiz
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");

    if (!quizId) {
      return NextResponse.json(
        { message: "Missing quizId parameter" },
        { status: 400 }
      );
    }

    const quizResults = await prisma.quizResult.findMany({
      where: { quizId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ quizResults });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
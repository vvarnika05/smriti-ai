import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getLevelAndTtile } from "@/lib/levelUtils";

// POST: Save quiz result
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { quizId, score } = await req.json();

    if (!quizId || score === undefined || score === null) {
      return NextResponse.json(
        { message: "Missing required fields: quizId and score" },
        { status: 400 }
      );
    }

    // Verify that the quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    // Create the quiz result
    const quizResult = await prisma.quizResult.create({
      data: {
        quizId,
        score,
      },
    });

    let xpGain = 10;
    if(score === 100) xpGain += 20;

    const user = await prisma.user.update({
      where: {id: userId},
      data: {
        experience: {
          increment: xpGain
        }
      }
    })

    const {level} = getLevelAndTtile(user.experience);
    await prisma.user.update({
      where: {id: userId},
      data: {
        level
      }
    })

    return NextResponse.json(
      {
        message: "Quiz result saved successfully",
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

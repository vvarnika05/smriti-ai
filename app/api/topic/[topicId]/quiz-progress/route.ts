// app/api/topic/[topicId]/quiz-progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { topicId: string } }
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { topicId } = params;

  if (!topicId) {
    return NextResponse.json(
      { message: "Topic ID is required" },
      { status: 400 }
    );
  }

  try {
    // 1. Verify user is the topic owner
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: {
        userId: true,
      },
    });

    if (!topic || topic.userId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 2. Fetch all quiz results for the topic and user
    const topicQuizResults = await prisma.quiz.findMany({
      where: {
        resource: {
          topicId: topicId,
        },
      },
      select: {
        quizResults: {
          where: {
            quiz: {
              userAnswers: {
                some: {
                  userId: userId,
                },
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    // Flatten the results and filter out quizzes without user results
    const results = topicQuizResults
      .flatMap((quiz) => quiz.quizResults)
      .filter(Boolean);

    return NextResponse.json(
      {
        message: "Quiz progress data fetched successfully",
        data: results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching quiz progress data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
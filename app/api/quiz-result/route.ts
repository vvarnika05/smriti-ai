import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { quizId, score } = await req.json();
    if (!quizId || score === undefined) {
      return new NextResponse("Quiz ID and score are required", { status: 400 });
    }
    
    const result = await db.quizResult.create({
      data: {
        quizId: quizId,
        score: score,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[SAVE_QUIZ_RESULT_API]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
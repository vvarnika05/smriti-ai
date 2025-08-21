import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { getLevelAndTtile } from "@/lib/levelUtils"; // Dependency from main branch

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
    
  
    const quizResult = await db.quizResult.create({
      data: {
        quizId: quizId,
        score: score,
      },
    });

    
    let xpGain = 10;
    if(score === 100) xpGain += 20;

    const user = await db.user.update({
      where: {id: userId},
      data: {
        experience: {
          increment: xpGain
        }
      }
    });

    const {level} = getLevelAndTtile(user.experience);
    await db.user.update({
      where: {id: userId},
      data: {
        level
      }
    });

    return NextResponse.json(
      {
        message: "Quiz result saved successfully",
        quizResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[SAVE_QUIZ_RESULT_API]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
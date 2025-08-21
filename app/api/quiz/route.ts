import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";
import { QUIZ_PROMPT } from "@/lib/prompts";
import { askGemini, extractJSON } from "@/lib/gemini"; 


const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  answer: z.string(),
  explanation: z.string(),
  difficulty: z.number().int().min(1).max(100),
});
const QuizSchema = z.array(QuizQuestionSchema);

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { resourceId } = await req.json();
    if (!resourceId) {
      return new NextResponse("Resource ID is required", { status: 400 });
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource || !resource.summary) {
      return new NextResponse("Resource or summary not found", { status: 404 });
    }

   
    const existingQuiz = await prisma.quiz.findUnique({
      where: { resourceId: resource.id },
    });

    if (existingQuiz) {
      return NextResponse.json({
        message: "Quiz already exists for this resource",
        quiz: { id: existingQuiz.id, resourceId: existingQuiz.resourceId },
      });
    }

    const mcqText = await askGemini(QUIZ_PROMPT(resource.summary));
    const mcqsJson = extractJSON(mcqText);
    const validatedMcqs = QuizSchema.parse(mcqsJson);

    const quizRecord = await prisma.quiz.create({
      data: { resourceId: resource.id },
    });

    await Promise.all(
      validatedMcqs.map(q =>
        prisma.quizQA.create({
          data: {
            quizId: quizRecord.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.answer,
            explanation: q.explanation,
            difficulty: q.difficulty,
          },
        })
      )
    );
    
    return NextResponse.json({
      message: "Quiz created",
      quiz: { id: quizRecord.id, resourceId: quizRecord.resourceId },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod validation error:", error.issues);
      return NextResponse.json({ message: "AI returned invalid data.", errors: error.issues }, { status: 500 });
    }
    console.error("Error creating quiz:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
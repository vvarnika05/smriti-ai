// app/api/resource-ai/route.ts
import {
  FALLBACK_PROMPT,
  SUMMARY_PROMPT,
  QA_PROMPT,
  MINDMAP_PROMPT,
  ROADMAP_PROMPT,
  QUIZ_PROMPT,
} from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getYoutubeTranscript } from "@/utils/youtube";
import { QuizQA as PrismaQuizQA } from "@prisma/client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper: ask Gemini
async function askGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

function extractJSON(text: string): any {
  const match = text.match(/\[.*\]/s); // non-greedy multiline match
  if (!match) throw new Error("No JSON found in Gemini response.");
  return JSON.parse(match[0]);
}

// Main handler
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { resourceId, task, question } = body;

  if (!resourceId || !task) {
    return NextResponse.json(
      { message: "resourceId and task are required" },
      { status: 400 }
    );
  }

  try {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      );
    }

    let summary = resource.summary;
    if (!summary || summary.length === 0) {
      if (resource.type === "VIDEO") {
        try {
          const transcript = await getYoutubeTranscript(resource.url);
          const prompt = SUMMARY_PROMPT(transcript);
          summary = await askGemini(prompt);
        } catch (err) {
          console.error(
            "Transcript fetch failed. Falling back to title-based summary.",
            err
          );
          const fallbackPrompt = FALLBACK_PROMPT(resource.title);
          summary = await askGemini(fallbackPrompt);
        }
      } else {
        const fallbackPrompt = FALLBACK_PROMPT(resource.title);
        summary = await askGemini(fallbackPrompt);
      }
      
      await prisma.resource.update({
        where: { id: resourceId },
        data: { summary },
      });
    }

    if (task === "summary") {
      return NextResponse.json({
        message: "Summary generated",
        summary,
      });
    }

    if (task === "roadmap") {
      const prompt = ROADMAP_PROMPT(summary);
      const answer = await askGemini(prompt);
      return NextResponse.json({ message: "Roadmap generated", answer });
    }

    if (task === "qa") {
      if (!question) {
        return NextResponse.json(
          { message: "Question is required for Q&A" },
          { status: 400 }
        );
      }
      const prompt = QA_PROMPT(summary, question);
      const answer = await askGemini(prompt);
      return NextResponse.json({ message: "Answer generated", answer });
    }

    if (task === "mindmap") {
      const prompt = MINDMAP_PROMPT(summary);
      const mindmap = await askGemini(prompt);
      return NextResponse.json({ message: "Mindmap code generated", mindmap });
    }

    if (task === "quiz") {
      let existingQuizzes = await prisma.quiz.findMany({
        where: { resourceId: resource.id },
        include: {
          quizQAs: true,
        },
        orderBy: { createdAt: 'desc' }
      });

      // Find a quiz that the user hasn't completed twice
      let quizToServe = null;
      for (const quiz of existingQuizzes) {
        if (quiz.quizQAs.length > 0) {
          const quizQAIds = quiz.quizQAs.map(q => q.id);
          const userAnswersCount = await prisma.userAnswer.count({
            where: {
              userId: userId,
              quizQAId: { in: quizQAIds }
            }
          });
          if (userAnswersCount < quiz.quizQAs.length * 2) {
            quizToServe = quiz;
            break;
          }
        }
      }

      if (quizToServe) {
        return NextResponse.json({
          message: "Existing quiz found",
          quiz: quizToServe,
          quizQAs: quizToServe.quizQAs,
        });
      } else {
        // If no suitable quiz is found, generate a new one
        let mcqText, mcqs;
        try {
          const prompt = QUIZ_PROMPT(summary);
          mcqText = await askGemini(prompt);
          mcqs = extractJSON(mcqText);
        } catch (genError) {
          console.error("AI quiz generation failed:", genError);
          return NextResponse.json(
            { message: "Failed to generate a quiz from this resource. The content may be too short." },
            { status: 400 }
          );
        }

        interface QuizQuestion {
          question: string;
          options: string[];
          correctAnswer: string;
          explanation: string;
          difficulty: string;
        }

        if (!Array.isArray(mcqs) || mcqs.length === 0) {
          return NextResponse.json(
            { message: "AI failed to generate quiz questions. The content was likely too short or could not be formatted correctly." },
            { status: 400 }
          );
        }

        const [quizRecord, quizQAs] = await prisma.$transaction(async (tx) => {
          const newQuizRecord = await tx.quiz.create({
            data: {
              resourceId: resource.id,
            },
          });

          const newQuizQAs = await Promise.all(
            mcqs.map((q: QuizQuestion) =>
              tx.quizQA.create({
                data: {
                  quizId: newQuizRecord.id,
                  question: q.question,
                  options: q.options,
                  correctAnswer: q.correctAnswer,
                  explanation: q.explanation,
                  difficulty: q.difficulty,
                },
              })
            )
          );

          return [newQuizRecord, newQuizQAs];
        });

        return NextResponse.json({
          message: "New quiz created with questions",
          quiz: quizRecord,
          quizQAs,
        });
      }
    }
  } catch (error) {
    console.error("Error in resource AI task:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
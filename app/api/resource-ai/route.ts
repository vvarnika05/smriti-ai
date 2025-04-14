import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper: fetch transcript
async function getYoutubeTranscript(url: string): Promise<string> {
  const transcript = await YoutubeTranscript.fetchTranscript(url);
  return transcript.map((item) => item.text).join(" ");
}

// Helper: ask Gemini
async function askGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
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

    if (!resource || resource.type !== "VIDEO") {
      return NextResponse.json(
        { message: "Invalid or unsupported resource" },
        { status: 400 }
      );
    }

    let summary = resource.summary;

    if (!summary || summary.length === 0) {
      if (resource.type === "VIDEO") {
        const transcript = await getYoutubeTranscript(resource.url);
        const prompt = `Summarize this YouTube transcript. Provide:
        1. A short summary
        2. Key bullet points

        Transcript:
        ${transcript}`;

        summary = await askGemini(prompt);

        await prisma.resource.update({
          where: { id: resourceId },
          data: { summary },
        });
      }
    }

    if (task === "summary") {
      return NextResponse.json({
        message: "Summary generated",
        summary,
      });
    }

    if (task === "qa") {
      if (!question) {
        return NextResponse.json(
          { message: "Question is required for Q&A" },
          { status: 400 }
        );
      }

      const prompt = `Answer the following question based on this summary of a YouTube transcript:
      Summary:
      ${summary}

      Question: ${question}`;

      const answer = await askGemini(prompt);
      return NextResponse.json({ message: "Answer generated", answer });
    }

    if (task === "mindmap") {
      const prompt = `Generate a mind map using mermaid.js syntax based on the following summary of a YouTube transcript.
      The mind map should highlight the key concepts, ideas, and their relationships, organized in a simplified 
      and easy-to-understand structure. Limit the number of nodes to ensure clarity and avoid overwhelming the user with too much detail.
      Summary:
      ${summary}`;

      const mindmap = await askGemini(prompt);
      return NextResponse.json({ message: "Mindmap code generated", mindmap });
    }

    if (task === "quiz") {
      // Step 1: Check if a quiz already exists for this resourceId
      const existingQuiz = await prisma.quiz.findUnique({
        where: { resourceId: resource.id },
        include: {
          quizQAs: true, // Include related questions and answers
        },
      });

      if (existingQuiz) {
        return NextResponse.json({
          message: "Quiz already exists for this resource",
          quiz: existingQuiz,
          quizQAs: existingQuiz.quizQAs,
        });
      } else {
        // Step 2: Generate new quiz questions
        const prompt = `Create exactly 5 multiple choice questions (MCQs) in JSON format based on the following summary of a YouTube transcript.
        Each question should include:
        - question (string)
        - options (array of 4 strings)
        - answer (string: the correct option)
        - explanation (string: a brief explanation)

        Respond ONLY with a single JSON array and nothing else.

        Example:
        [
          {
            "question": "What is 2 + 2?",
            "options": ["1", "2", "3", "4"],
            "answer": "4",
            "explanation": "2 + 2 equals 4."
          },
          ...
        ]

        Summary:
        ${summary}`;

        const mcqText = await askGemini(prompt);
        const mcqs = extractJSON(mcqText);

        interface QuizQuestion {
          question: string;
          options: string[];
          answer: string;
          explanation: string;
        }

        // Step 3: Create a new quiz record
        const quizRecord = await prisma.quiz.create({
          data: {
            resourceId: resource.id,
          },
        });

        // Step 4: Add the questions and answers to the QuizQA model
        const quizQAs = await Promise.all(
          mcqs.map((q: QuizQuestion) =>
            prisma.quizQA.create({
              data: {
                quizId: quizRecord.id,
                question: q.question,
                options: q.options,
                correctAnswer: q.answer,
                explanation: q.explanation,
              },
            })
          )
        );

        return NextResponse.json({
          message: "Quiz created with questions",
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

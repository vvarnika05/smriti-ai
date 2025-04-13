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

// Helper: parse MCQs
function parseMCQs(raw: string) {
  const mcqs = [];
  const questionBlocks = raw.split(/\n\n+/).filter(Boolean);

  for (const block of questionBlocks) {
    const [qLine, ...rest] = block.split("\n").filter(Boolean);
    const question = qLine.replace(/^\d+[\).]?\s*/, "").trim();

    const options: string[] = [];
    let correctAnswer = "";
    let explanation = "";

    for (const line of rest) {
      if (line.toLowerCase().startsWith("correct answer:")) {
        correctAnswer = line.split(":")[1]?.trim() || "";
      } else if (line.toLowerCase().startsWith("explanation:")) {
        explanation = line.split(":")[1]?.trim() || "";
      } else {
        options.push(line.replace(/^[-*]?\s*/, "").trim());
      }
    }

    if (question && options.length >= 2 && correctAnswer) {
      mcqs.push({ question, options, correctAnswer, explanation });
    }
  }

  return mcqs;
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

    const transcript = await getYoutubeTranscript(resource.url);

    if (task === "summary") {
      if (resource.summary?.length > 0) {
        return NextResponse.json({
          message: "Summary already exists",
          summary: resource.summary,
        });
      }

      const prompt = `Summarize this YouTube transcript. Provide:
      1. A short summary
      2. Key bullet points

      Transcript:
      ${transcript}`;

      const summary = await askGemini(prompt);
      const updated = await prisma.resource.update({
        where: { id: resourceId },
        data: { summary },
      });

      return NextResponse.json({
        message: "Summary generated",
        summary: updated.summary,
      });
    }

    if (task === "qa") {
      if (!question) {
        return NextResponse.json(
          { message: "Question is required for Q&A" },
          { status: 400 }
        );
      }

      const prompt = `Answer the following question based on this YouTube transcript:
      Transcript:
      ${transcript}

      Question: ${question}`;

      const answer = await askGemini(prompt);
      return NextResponse.json({ message: "Answer generated", answer });
    }

    if (task === "mindmap") {
      const prompt = `Generate a mind map using mermaid.js syntax based on the following YouTube transcript.
      The mind map should highlight the key concepts, ideas, and their relationships, organized in a simplified 
      and easy-to-understand structure. Limit the number of nodes to ensure clarity and avoid overwhelming the user with too much detail.
      Transcript:
      ${transcript}`;

      const mindmap = await askGemini(prompt);
      return NextResponse.json({ message: "Mindmap code generated", mindmap });
    }

    if (task === "quiz") {
      const prompt = `Create 5 multiple choice questions (MCQs) based on this YouTube transcript. Each question should have 4 options, specify the correct answer, and give a short explanation.

      Transcript:
      ${transcript}`;

      const mcqText = await askGemini(prompt);
      const mcqs = parseMCQs(mcqText);

      const quizRecords = await Promise.all(
        mcqs.map((q) =>
          prisma.quiz.create({
            data: {
              topicId: resource.topicId,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            },
          })
        )
      );

      return NextResponse.json({ message: "Quiz created", quiz: quizRecords });
    }

    return NextResponse.json({ message: "Invalid task type" }, { status: 400 });
  } catch (error) {
    console.error("Error in resource AI task:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

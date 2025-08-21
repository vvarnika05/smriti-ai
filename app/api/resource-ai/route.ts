import {
  FALLBACK_PROMPT,
  SUMMARY_PROMPT,
  QA_PROMPT,
  MINDMAP_PROMPT,
  ROADMAP_PROMPT,
} from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { getYoutubeTranscript } from "@/utils/youtube";
import { askGemini } from "@/lib/gemini"; // new helper

export async function POST(req: NextRequest) {
  try {
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
        try {
          const transcript = await getYoutubeTranscript(resource.url);
          summary = await askGemini(SUMMARY_PROMPT(transcript));
        } catch (err) {
          console.error("Transcript fetch failed, falling back.", err);
          summary = await askGemini(FALLBACK_PROMPT(resource.title));
        }
        await prisma.resource.update({ where: { id: resourceId }, data: { summary } });
      }
    }

  
    if (task === "summary") return NextResponse.json({ summary });
    if (task === "roadmap") return NextResponse.json({ answer: await askGemini(ROADMAP_PROMPT(summary)) });
    if (task === "qa") {
      if (!question) return NextResponse.json({ message: "Question is required" }, { status: 400 });
      return NextResponse.json({ answer: await askGemini(QA_PROMPT(summary, question)) });
    }
    if (task === "mindmap") return NextResponse.json({ mindmap: await askGemini(MINDMAP_PROMPT(summary)) });


    return NextResponse.json({ message: `Unknown task: ${task}` }, { status: 400 });

  } catch (error) {
    console.error("Error in resource AI task:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
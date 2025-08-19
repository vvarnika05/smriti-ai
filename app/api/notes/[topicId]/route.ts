// app/api/notes/[topicId]/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import db from "@/lib/prisma";

// Helper function to get topicId from the URL
function getTopicIdFromUrl(url: string): string | null {
  try {
    const parts = new URL(url).pathname.split('/');
    // The topicId will be the last part of the URL, e.g., /api/notes/[topicId]
    return parts[parts.length - 1];
  } catch (error) {
    return null;
  }
}

export async function GET(
  req: Request,
  // We no longer need the 'params' argument here
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // FIX: Get topicId directly from the request URL
    const topicId = getTopicIdFromUrl(req.url);
    if (!topicId) {
        return new NextResponse("Invalid topic ID in URL", { status: 400 });
    }

    const topicOwner = await db.topic.findUnique({
      where: { id: topicId, userId: userId },
    });

    if (!topicOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const note = await db.note.findUnique({
      where: { topicId: topicId },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[GET_NOTE_API]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
   // We no longer need the 'params' argument here
) {
  try {
    const { userId } = await auth();
    const { content } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // FIX: Get topicId directly from the request URL
    const topicId = getTopicIdFromUrl(req.url);
    if (!topicId) {
        return new NextResponse("Invalid topic ID in URL", { status: 400 });
    }

    const topicOwner = await db.topic.findUnique({
      where: { id: topicId, userId: userId },
    });

    if (!topicOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const note = await db.note.upsert({
      where: { topicId: topicId },
      update: { content: content },
      create: {
        topicId: topicId,
        userId: userId,
        content: content,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[UPDATE_NOTE_API]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
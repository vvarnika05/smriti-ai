import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

// GET: Get topic by ID or list all topics for the user
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    // THE FIX: Re-introduced the logic to handle fetching a single topic by ID.
    if (id) {
      const topic = await prisma.topic.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!topic) {
        return NextResponse.json(
          { message: "Topic not found" },
          { status: 404 }
        );
      }
      // This now returns the expected { topic: { ... } } structure.
      return NextResponse.json({ topic });
    } else {
      // This is the new logic for fetching all topics with their progress.
      const topics = await prisma.topic.findMany({
        where: { userId },
        include: {
          resources: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const allResourceIds = topics.flatMap(t => t.resources.map(r => r.id));
      const latestQuizResults = await prisma.quizResult.findMany({
        where: {
          userId,
          quiz: {
            resourceId: { in: allResourceIds },
          },
        },
        orderBy: { createdAt: 'desc' },
        distinct: ['quizId'],
        select: {
          score: true,
          totalQuestions: true,
          quiz: {
            select: { resourceId: true },
          },
        },
      });

      const resultsMap = new Map<string, { score: number; total: number }>();
      latestQuizResults.forEach(r => {
        if (r.quiz.resourceId) {
          resultsMap.set(r.quiz.resourceId, { score: r.score, total: r.totalQuestions });
        }
      });

      const topicsWithProgress = topics.map(topic => {
        const totalResources = topic.resources.length;
        if (totalResources === 0) {
          return { ...topic, completionPercentage: 0, averageScore: 0 };
        }

        let attemptedResourcesCount = 0;
        let totalScorePercentage = 0;

        topic.resources.forEach(resource => {
          if (resultsMap.has(resource.id)) {
            attemptedResourcesCount++;
            const result = resultsMap.get(resource.id)!;
            if (result.total > 0) {
              totalScorePercentage += (result.score / result.total) * 100;
            }
          }
        });

        const completionPercentage = (attemptedResourcesCount / totalResources) * 100;
        const averageScore = attemptedResourcesCount > 0 ? totalScorePercentage / attemptedResourcesCount : 0;
        
        return {
          id: topic.id,
          title: topic.title,
          createdAt: topic.createdAt,
          completionPercentage,
          averageScore,
        };
      });

      return NextResponse.json({ topics: topicsWithProgress });
    }
  } catch (error) {
    console.error("Error fetching topic(s):", error);
    return NextResponse.json({ message: "Fetch failed" }, { status: 500 });
  }
}

// ... (POST, PUT, DELETE functions remain unchanged)
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { title } = body;
  if (!title) {
    return NextResponse.json({ message: "Title is required" }, { status: 400 });
  }
  try {
    const topic = await prisma.topic.create({
      data: {
        userId,
        title,
      },
    });
    return NextResponse.json({ message: "Topic created", topic }, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { id, title } = body;
  if (!id || !title) {
    return NextResponse.json({ message: "ID and new title are required" }, { status: 400 });
  }
  try {
    const updated = await prisma.topic.update({
      where: { id },
      data: { title },
    });
    return NextResponse.json({ message: "Topic updated", topic: updated });
  } catch (error) {
    console.error("Error updating topic:", error);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ message: "Topic ID is required" }, { status: 400 });
  }
  try {
    await prisma.topic.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Topic deleted" });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}
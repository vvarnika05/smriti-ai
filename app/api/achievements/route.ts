import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const allAchievements = await prisma.achievement.findMany();
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });

    const unlockedIds = new Set(userAchievements.map(a => a.achievementId));
    const result = allAchievements.map(ach => ({
      ...ach,
      unlocked: unlockedIds.has(ach.id),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ACHIEVEMENTS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

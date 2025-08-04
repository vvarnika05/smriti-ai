import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST: Log daily user login
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    // Check if user already logged in today
    const existingLogin = await prisma.userLogin.findUnique({
      where: {
        userId_loginDate: {
          userId,
          loginDate: today,
        },
      },
    });

    if (existingLogin) {
      return NextResponse.json({
        message: "Login already recorded for today",
        alreadyLogged: true,
      });
    }

    // Create new login record for today
    const userLogin = await prisma.userLogin.create({
      data: {
        userId,
        loginDate: today,
      },
    });

    return NextResponse.json({
      message: "Daily login recorded successfully",
      userLogin,
      alreadyLogged: false,
    });
  } catch (error) {
    console.error("Error logging daily login:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Retrieve user login history for consistency tracking
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "90"); // Default to 90 days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const userLogins = await prisma.userLogin.findMany({
      where: {
        userId,
        loginDate: {
          gte: startDate,
        },
      },
      orderBy: {
        loginDate: "asc",
      },
    });

    // Calculate consistency stats
    const totalDays = days;
    const loginDays = userLogins.length;
    const consistencyPercentage = Math.round((loginDays / totalDays) * 100);

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasLogin = userLogins.some(
        login => login.loginDate.getTime() === checkDate.getTime()
      );
      
      if (hasLogin) {
        currentStreak++;
      } else {
        break;
      }
    }

    return NextResponse.json({
      userLogins,
      stats: {
        totalDays,
        loginDays,
        consistencyPercentage,
        currentStreak,
      },
    });
  } catch (error) {
    console.error("Error fetching login history:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
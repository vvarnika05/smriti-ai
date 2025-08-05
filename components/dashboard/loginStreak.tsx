"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, Flame } from "lucide-react";

interface ApiResponse {
  currentStreak: number;
}

interface LoginStreakProps {
  days?: number;
}

export default function LoginStreak({ days = 90 }: LoginStreakProps) {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const response = await axios.get<ApiResponse>(
          `/api/user-login?days=${days}`
        );
        setCurrentStreak(response.data.currentStreak);
      } catch (error) {
        console.error("Error fetching streak:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreak();
  }, [days]);

  if (isLoading) {
    return (
      <Card className="pt-3 pb-0 gap-3">
        <div className="flex items-center gap-4 px-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <CalendarCheck className="text-primary h-5 w-5" />
          </div>
          <div className="space-y-1 w-full">
            <div className="flex items-center justify-between">
              <p className="text-sm">Study Consistency</p>
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                Loading...
              </span>
            </div>
          </div>
        </div>
        <CardContent className="px-2">
          <div className="flex items-center justify-center h-[80px]">
            <div className="text-center">
              <div className="text-4xl font-bold text-muted-foreground mb-1">
                --
              </div>
              <div className="text-sm text-muted-foreground">days streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-3 pb-0 gap-3">
      <div className="flex items-center gap-4 px-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <CalendarCheck className="text-primary h-5 w-5" />
        </div>
        <div className="space-y-1 w-full">
          <div className="flex items-center justify-between">
            <p className="text-sm">Study Consistency</p>
            <span className="text-xs font-medium text-[#adff2f] bg-[#adff2f]/10 px-3 py-1 rounded-full flex items-center gap-1 border border-[#adff2f]/20">
              <Flame className="h-3 w-3" />
              {currentStreak} day streak
            </span>
          </div>
        </div>
      </div>
      <CardContent className="px-2">
        <div className="flex items-center justify-center h-[80px]">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#adff2f] mb-1">
              {currentStreak}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentStreak === 1 ? "day" : "days"} streak
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

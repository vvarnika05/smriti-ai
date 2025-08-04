"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";

interface LoginData {
  loginDate: string;
}

interface LoginStats {
  totalDays: number;
  loginDays: number;
  consistencyPercentage: number;
  currentStreak: number;
}

interface LoginHeatmapProps {
  days?: number;
}

export default function LoginHeatmap({ days = 90 }: LoginHeatmapProps) {
  const [loginData, setLoginData] = useState<LoginData[]>([]);
  const [stats, setStats] = useState<LoginStats>({
    totalDays: 0,
    loginDays: 0,
    consistencyPercentage: 0,
    currentStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLoginData = async () => {
      try {
        const response = await axios.get(`/api/user-login?days=${days}`);
        setLoginData(response.data.userLogins);
        setStats(response.data.stats);
      } catch (error) {
        console.error("Error fetching login data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoginData();
  }, [days]);

  // Generate array of dates for the last N days
  const generateDateGrid = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    
    return dates;
  };

  // Check if a date has a login
  const hasLoginOnDate = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return loginData.some(login => {
      const loginDate = new Date(login.loginDate).toISOString().split('T')[0];
      return loginDate === dateStr;
    });
  };

  // Get the intensity level for styling (0-4)
  const getIntensityLevel = (date: Date): number => {
    return hasLoginOnDate(date) ? 3 : 0;
  };

  // Get CSS class for the intensity
  const getIntensityClass = (level: number): string => {
    const classes = [
      "bg-muted", // No activity
      "bg-primary/20", // Low activity
      "bg-primary/40", // Medium activity  
      "bg-primary/60", // High activity
      "bg-primary", // Very high activity
    ];
    return classes[level] || classes[0];
  };

  const dates = generateDateGrid();

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm hover:shadow-md transition-all">
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <CalendarCheck className="text-primary h-5 w-5" />
            </div>
            <div className="space-y-1 w-full">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Study Consistency</p>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  Loading...
                </span>
              </div>
              <p className="text-xl font-bold">--</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500 w-0" />
            </div>
            <p className="text-right text-xs text-muted-foreground mt-1">-- achieved</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-sm hover:shadow-md transition-all">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <CalendarCheck className="text-primary h-5 w-5" />
          </div>
          <div className="space-y-1 w-full">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Study Consistency</p>
              <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                {stats.currentStreak} day streak
              </span>
            </div>
            <p className="text-xl font-bold">{stats.consistencyPercentage}%</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${stats.consistencyPercentage}%` }}
            />
          </div>
          <p className="text-right text-xs text-muted-foreground mt-1">
            {stats.consistencyPercentage}% achieved
          </p>
        </div>

        {/* Heatmap Grid */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">
            {stats.loginDays} logins in the last {days} days
          </p>
          <div className="grid grid-cols-10 gap-1">
            {dates.map((date, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-sm ${getIntensityClass(
                  getIntensityLevel(date)
                )} transition-colors`}
                title={`${date.toDateString()}${
                  hasLoginOnDate(date) ? " - Visited" : " - No visit"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-2 h-2 rounded-sm ${getIntensityClass(level)}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
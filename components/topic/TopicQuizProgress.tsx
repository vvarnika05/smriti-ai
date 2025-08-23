"use client";

import { use } from "react";
import { LoaderCircle } from "lucide-react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Simple fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TopicQuizProgress({ topicId }: { topicId: string }) {
  const { data, error, isLoading } = useSWR(
    `/api/topic/${topicId}/quiz-progress`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-40 text-destructive">
        Failed to load quiz progress data.
      </div>
    );
  }

  const quizResults = data?.data || [];
  const totalQuizzes = quizResults.length;
  const totalScore = quizResults.reduce((sum: number, result: any) => sum + result.score, 0);
  const totalQuestions = quizResults.reduce((sum: number, result: any) => sum + result.totalQuestions, 0);
  const averageScore = totalQuizzes > 0 ? (totalScore / totalQuizzes).toFixed(2) : "N/A";

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Quizzes Taken</CardTitle>
          <CardDescription>Number of quizzes completed for this topic.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{totalQuizzes}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Score</CardTitle>
          <CardDescription>Average correct answers per quiz.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{averageScore}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Correct Answers</CardTitle>
          <CardDescription>Overall correct answers across all quizzes.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{totalScore} / {totalQuestions}</p>
        </CardContent>
      </Card>
    </div>
  );
}
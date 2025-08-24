"use client";

import { use, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizFinalResult from "@/components/quiz/QuizResult";
import QuizReview from "@/components/quiz/QuizReview";
import axios from "axios";

// Define the expected types for the API responses
type ResourceResponse = {
  resource?: {
    id: string;
    title: string;
  };
};

type QuizResponse = {
  message: string;
  quiz: {
    id: string;
    resourceId: string;
  };
  quizQAs: any[]; // Use 'any[]' for simplicity, but defining the full type is better.
};

export default function QuizPage() {
  const pathname = usePathname();
  const id = pathname.split("/").pop();

  const [isLoading, setIsLoading] = useState(true);
  const [resourceTopic, setResourceTopic] = useState("");
  const [quizData, setQuizData] = useState<any[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);

  // Quiz state
  const [quizState, setQuizState] = useState<"quiz" | "results" | "review">(
    "quiz"
  );
  const [userAnswers, setUserAnswers] = useState<
    { quizQAId: string; selectedOption: string; isCorrect: boolean }[]
  >([]);

  useEffect(() => {
    async function Datafetcher() {
      if (!id) return;
      setIsLoading(true);

      try {
        const res = await axios.get<ResourceResponse>(`/api/resource`, {
          params: { id },
        });
        if (res.data.resource) {
          setResourceTopic(res.data.resource.title);
        } else {
          console.error("Resource not found");
        }

        const payload = {
          resourceId: id,
          task: "quiz",
        };
        const resQuiz = await axios.post<QuizResponse>(`/api/resource-ai`, payload);
        
        setQuizData(resQuiz.data.quizQAs);
        setQuizId(resQuiz.data.quiz.id);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast.error("Failed to load quiz. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    Datafetcher();
  }, [id]);

  const handleQuizEnd = async (
    finalAnswers: { quizQAId: string; selectedOption: string; isCorrect: boolean }[]
  ) => {
    setUserAnswers(finalAnswers);
    setQuizState("results");
    
    if (quizId) {
      try {
        await axios.post("/api/quiz-result", {
          quizId,
          answers: finalAnswers.map(answer => ({
            quizQAId: answer.quizQAId,
            selectedOption: answer.selectedOption,
          })),
        });
        console.log("Quiz result saved successfully");
      } catch (error) {
        console.error("Error saving quiz result:", error);
      }
    }
  };

  const resetQuiz = () => {
    setUserAnswers([]);
    setQuizState("quiz");
  };

  const startReview = () => {
    setQuizState("review");
  };

  const returnToResults = () => {
    setQuizState("results");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Generating your quiz...</p>
      </div>
    );
  }

  if (!quizData || quizData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-xl font-semibold mt-4">No quiz available for this resource.</p>
        <p className="mt-2 text-muted-foreground">Please try again later or add more detailed resources.</p>
      </div>
    );
  }
  
  return (
    <div className="mt-10 min-h-[90vh] h-full px-6 max-w-3xl mx-auto flex flex-col items-center justify-center">
      {quizState !== "results" && (
        <div className="py-8 space-y-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-lime-400">
            Quiz On
          </h1>
          <h2 className="text-xl sm:text-xl font-medium text-white px-4">
            {resourceTopic}
          </h2>
        </div>
      )}

      <div className="bg-zinc-900 rounded-xl p-6 shadow-xl w-full">
        {quizState === "quiz" && (
          <QuizQuestion
            quizData={quizData}
            onQuizEnd={handleQuizEnd}
          />
        )}

        {quizState === "results" && (
          <QuizFinalResult
            userAnswers={userAnswers}
            quizData={quizData}
            resetQuiz={resetQuiz}
            startReview={startReview}
          />
        )}

        {quizState === "review" && (
          <QuizReview
            quizData={quizData}
            userAnswers={userAnswers}
            returnToResults={returnToResults}
          />
        )}
      </div>
    </div>
  );
}
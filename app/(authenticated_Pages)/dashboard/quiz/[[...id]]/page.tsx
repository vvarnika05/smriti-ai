"use client";

import { useState, useEffect, use } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle, CheckCircle, XCircle } from "lucide-react";
import { QuizQA, Resource } from "@prisma/client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr"; 
import {
  QuizGenerationResponse,
  CheckAnswerResponse,
} from "@/types/quiz";

const QUIZ_LENGTH = 7;

type QuizParams = {
  id: string | string[];
};

type QuestionWithTopic = QuizQA & {
  quiz: {
    resource: Resource;
  };
};

type AdaptiveQuestionResponse = {
    question: QuestionWithTopic | null;
}

export default function AdaptiveQuizPage({ params }: { params: any }) {
  const resolvedParams = use(params) as QuizParams;
  const id = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;
  const router = useRouter();
  const { mutate } = useSWRConfig(); 

  const [skillScore, setSkillScore] = useState(50);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionWithTopic | null>(null);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<CheckAnswerResponse | null>(null);
  const [status, setStatus] = useState<"generating" | "loading" | "answering" | "answered" | "finished">("generating");
  const [correctCount, setCorrectCount] = useState(0);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);

  useEffect(() => {
    const generateQuizPool = async () => {
      try {
        const response = await axios.post<QuizGenerationResponse>('/api/resource-ai', { resourceId: id, task: 'quiz' });
        setQuizId(response.data.quiz.id);
      } catch (error) {
        console.error("Failed to generate quiz pool:", error);
        setStatus("finished");
      }
    };
    generateQuizPool();
  }, [id]);

  useEffect(() => {
    if (!quizId || answeredIds.length >= QUIZ_LENGTH) {
      if (quizId && answeredIds.length >= QUIZ_LENGTH) {
        endQuiz();
      }
      return;
    }

    const fetchQuestion = async () => {
      setStatus("loading");
      try {
        const response = await axios.get<AdaptiveQuestionResponse>(`/api/adaptive-quiz`, {
          params: { quizId, skillScore, excludedIds: answeredIds.join(',') },
        });

        if (response.data.question) {
          setCurrentQuestion(response.data.question);
          if (!topicId && response.data.question.quiz.resource.topicId) {
            setTopicId(response.data.question.quiz.resource.topicId);
          }
          setStatus("answering");
        } else {
          endQuiz();
        }
      } catch (error) {
        console.error("Failed to fetch question:", error);
        endQuiz();
      }
    };
    
    fetchQuestion();
  }, [quizId, answeredIds]);

  const endQuiz = async () => {
    if (status === "finished") return;
    setStatus("finished");
    const finalScore = Math.round((correctCount / Math.max(1, answeredIds.length)) * 100);
    try {
      if (quizId) {
        await axios.post('/api/quiz-result', { quizId, score: finalScore });

        mutate('/api/performance-data');
      }
    } catch (error) {
      console.error("Failed to save quiz result:", error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !currentQuestion) return;
    setStatus("loading");
    try {
      const response = await axios.post<CheckAnswerResponse>(`/api/adaptive-quiz`, {
        questionId: currentQuestion.id,
        userAnswer: selectedOption,
      });
      setResult(response.data);
      if (response.data.isCorrect) {
        setCorrectCount(prev => prev + 1);
      }
      setStatus("answered");
    } catch (error) {
      console.error("Failed to check answer:", error);
      setStatus("answering");
    }
  };

  const handleNextQuestion = () => {
    const scoreChange = result?.isCorrect ? 10 : -10;
    setSkillScore(prev => Math.max(1, Math.min(100, prev + scoreChange)));
    setAnsweredIds(prev => [...prev, currentQuestion!.id]);
    setSelectedOption(null);
    setResult(null);
  };

  const getDynamicMessage = () => {
    if (skillScore >= 75) return "Excellent! You've demonstrated a deep understanding of the advanced concepts in this topic.";
    if (skillScore >= 40) return "Great job! You have a solid grasp of the core material. A little review on the tougher questions will make you an expert.";
    return "Good start! You're building a solid foundation. Revisiting the material will help solidify the key ideas.";
  };

  if (status === "generating") {
    return <div className="min-h-screen flex flex-col gap-4 justify-center items-center"><LoaderCircle className="w-12 h-12 animate-spin" /><p className="text-muted-foreground">Preparing your assessment...</p></div>;
  }
  
  if (status === "finished") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl mx-auto text-center">
          <CardHeader><CardTitle>Assessment Complete!</CardTitle></CardHeader>
          <CardContent>
            <p className="text-4xl font-bold mb-4">{Math.round((correctCount / QUIZ_LENGTH) * 100)}%</p>
            <p className="text-lg text-muted-foreground mb-2">Final Skill Score: {skillScore}</p>
            <p className="mt-4 p-4 bg-muted rounded-md">{getDynamicMessage()}</p>
            <Button className="mt-6" onClick={() => router.push(`/dashboard/topic/${topicId || ''}`)}>Back to Topic</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion || status === "loading") {
    return <div className="min-h-screen flex justify-center items-center"><LoaderCircle className="w-12 h-12 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Question {answeredIds.length + 1} of {QUIZ_LENGTH}</CardTitle>
          <p className="pt-4 text-lg">{currentQuestion.question}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className={cn("justify-start text-left h-auto whitespace-normal py-3", selectedOption === option && "ring-2 ring-primary", status === "answered" && result?.correctAnswer === option && "bg-green-500/20 border-green-500 hover:bg-green-500/30", status === "answered" && selectedOption === option && !result?.isCorrect && "bg-red-500/20 border-red-500 hover:bg-red-500/30")}
              onClick={() => setSelectedOption(option)}
              disabled={status === "answered"}
            >{option}</Button>
          ))}
          {status === "answering" && <Button onClick={handleSubmitAnswer} disabled={!selectedOption} className="mt-4">Submit</Button>}
          {status === "answered" && result && (
            <div className={cn("mt-4 p-4 rounded-md", result.isCorrect ? "bg-green-500/10 text-green-800 dark:text-green-300" : "bg-red-500/10 text-red-800 dark:text-red-300")}>
              <div className="flex items-center gap-2"><p className="font-semibold text-lg">{result.isCorrect ? "Correct!" : `Incorrect. The right answer is "${result.correctAnswer}"`}</p></div>
              <p className="text-sm mt-2 ml-8">{result.explanation}</p>
              <Button onClick={handleNextQuestion} className="mt-4 w-full">Next Question</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
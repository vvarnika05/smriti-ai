// components/quiz/QuizQuestion.tsx

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";

export type QuizQA = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
};

type Props = {
  quizData: QuizQA[];
  onQuizEnd: (userAnswers: { quizQAId: string; selectedOption: string; isCorrect: boolean }[]) => void;
};

const QuizQuestion = ({ quizData, onQuizEnd }: Props) => {
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<
    { quizQAId: string; selectedOption: string; isCorrect: boolean }[]
  >([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const totalQuestionsToAsk = 7;

  const currentQuestion = useMemo(() => {
    // Return the current question based on the last item in the askedQuestions list
    if (askedQuestions.length === 0) return null;
    return quizData.find(q => q.id === askedQuestions[askedQuestions.length - 1]);
  }, [askedQuestions, quizData]);


  useEffect(() => {
    if (quizData.length > 0 && askedQuestions.length === 0) {
      // Start the quiz with a random 'Medium' question
      const mediumQuestions = quizData.filter(q => q.difficulty === "Medium");
      if (mediumQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * mediumQuestions.length);
        setAskedQuestions([mediumQuestions[randomIndex].id]);
      } else {
        // Fallback if no medium questions are found
        const firstQuestion = quizData[Math.floor(Math.random() * quizData.length)];
        setAskedQuestions([firstQuestion.id]);
      }
    }
  }, [quizData, askedQuestions.length]);


  const getNextQuestion = (isCorrect: boolean) => {
    let nextDifficulty = currentQuestion?.difficulty;
    let nextQuestionId: string | undefined;

    if (isCorrect) {
      if (nextDifficulty === "Easy") nextDifficulty = "Medium";
      else if (nextDifficulty === "Medium") nextDifficulty = "Hard";
    } else {
      if (nextDifficulty === "Hard") nextDifficulty = "Medium";
      else if (nextDifficulty === "Medium") nextDifficulty = "Easy";
    }

    // Filter out already asked questions and find one with the target difficulty
    const availableQuestions = quizData.filter(q => !askedQuestions.includes(q.id));
    const nextQuestionPool = availableQuestions.filter(q => q.difficulty === nextDifficulty);

    if (nextQuestionPool.length > 0) {
      nextQuestionId = nextQuestionPool[Math.floor(Math.random() * nextQuestionPool.length)].id;
    } else if (availableQuestions.length > 0) {
      // Fallback: if no questions of that difficulty are left, choose a random one from the remaining pool
      nextQuestionId = availableQuestions[Math.floor(Math.random() * availableQuestions.length)].id;
    }

    return nextQuestionId;
  };

  const handleNext = () => {
    if (!selectedOption || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newUserAnswers = [
      ...userAnswers,
      {
        quizQAId: currentQuestion.id,
        selectedOption: selectedOption,
        isCorrect: isCorrect,
      },
    ];
    setUserAnswers(newUserAnswers);

    if (newUserAnswers.length >= totalQuestionsToAsk) {
      // Quiz ends after 7 questions
      onQuizEnd(newUserAnswers);
    } else {
      const nextQuestionId = getNextQuestion(isCorrect);
      if (nextQuestionId) {
        setAskedQuestions([...askedQuestions, nextQuestionId]);
      } else {
        // Fallback if no more questions can be found
        onQuizEnd(newUserAnswers);
      }
      setSelectedOption(null);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center text-red-500">
        Error: Quiz data is not available.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
      <div className="space-y-3">
        {currentQuestion.options.map((opt) => (
          <div
            key={opt}
            onClick={() => setSelectedOption(opt)}
            className={`p-3 rounded cursor-pointer border ${
              selectedOption === opt
                ? "bg-lime-400 text-black font-bold"
                : "border-white/10 bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            {opt}
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between">
        <span className="text-sm text-gray-400">
          Question {userAnswers.length + 1} of {totalQuestionsToAsk}
        </span>
        <Button onClick={handleNext} disabled={!selectedOption}>
          {userAnswers.length + 1 === totalQuestionsToAsk ? "Finish Quiz" : "Next Question"}
        </Button>
      </div>
    </div>
  );
};

export default QuizQuestion;
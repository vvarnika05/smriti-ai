// components/quiz/QuizQuestion.tsx

import { useState } from "react";
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<
    { quizQAId: string; selectedOption: string; isCorrect: boolean }[]
  >([]);

  // Adaptive logic
  const getNextQuestion = (isCorrect: boolean): number => {
    let nextIndex = currentQuestionIndex + 1;
    let nextDifficulty = quizData[currentQuestionIndex].difficulty;

    if (isCorrect) {
      if (nextDifficulty === "Easy") nextDifficulty = "Medium";
      else if (nextDifficulty === "Medium") nextDifficulty = "Hard";
    } else {
      if (nextDifficulty === "Hard") nextDifficulty = "Medium";
      else if (nextDifficulty === "Medium") nextDifficulty = "Easy";
    }

    // Find the next available question with the target difficulty
    while (nextIndex < quizData.length) {
      if (quizData[nextIndex].difficulty === nextDifficulty) {
        return nextIndex;
      }
      nextIndex++;
    }

    // If no questions of the target difficulty are left, just move to the next one
    return currentQuestionIndex + 1;
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === quizData[currentQuestionIndex].correctAnswer;
    const newUserAnswers = [
      ...userAnswers,
      {
        quizQAId: quizData[currentQuestionIndex].id,
        selectedOption: selectedOption,
        isCorrect: isCorrect,
      },
    ];
    setUserAnswers(newUserAnswers);

    if (currentQuestionIndex + 1 >= quizData.length) {
      // Quiz ends here
      onQuizEnd(newUserAnswers);
    } else {
      const nextIndex = getNextQuestion(isCorrect);
      setCurrentQuestionIndex(nextIndex);
      setSelectedOption(null);
    }
  };

  const currentQuestion = quizData[currentQuestionIndex];

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
      <div className="mt-6 flex justify-end">
        <Button onClick={handleNext} disabled={!selectedOption}>
          Next Question
        </Button>
      </div>
    </div>
  );
};

export default QuizQuestion;
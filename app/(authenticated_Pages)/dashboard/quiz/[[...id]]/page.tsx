"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizFinalResult from "@/components/quiz/QuizResult";
import QuizReview from "@/components/quiz/QuizReview";
import { AccessibleProgressBar } from "@/components/accessibility/AccessibleProgressBar";
import { AriaLiveRegion } from "@/components/accessibility/AriaLiveRegion";
import axios from "axios";

// Type definitions remain the same
type QuizQA = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
};

type ResourceResponse = {
  resource?: {
    id: string;
    title: string;
  };
};

type QuizResponse = {
  message: string;
  quiz: {
    id:string;
    resourceId: string;
  };
  quizQAs: QuizQA[];
};

// This type will be used for the final result submission
type FinalAnswer = {
  quizQAId: string;
  selectedOption: string;
  isCorrect: boolean;
};

export default function QuizPage({ params }: { params: { id: string | string[] } }) {
  // CHANGE 4: Using Next.js 'params' for cleaner route handling
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const hasFetched = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [resourceTopic, setResourceTopic] = useState("");
  const [quizData, setQuizData] = useState<QuizQA[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);

  // Your adaptive logic state
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  
  // CHANGE 2: State management updated to support "Previous" button
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userSelections, setUserSelections] = useState<(string | null)[]>([]);

  const [quizState, setQuizState] = useState<"quiz" | "results" | "review">("quiz");
  const [ariaMessage, setAriaMessage] = useState("");
  const totalQuestionsToAsk = 7;

  const currentQuestion = useMemo(() => {
    if (askedQuestions.length === 0 || currentQIndex >= askedQuestions.length) return null;
    const currentQuestionId = askedQuestions[currentQIndex];
    return quizData.find(q => q.id === currentQuestionId);
  }, [currentQIndex, askedQuestions, quizData]);

  useEffect(() => {
    // CHANGE 3: useRef flag to prevent double-fetching
    if (hasFetched.current || !id) return;
    hasFetched.current = true;

    async function Datafetcher() {
      setIsLoading(true);
      try {
        const res = await axios.get<ResourceResponse>(`/api/resource`, { params: { id } });
        if (res.data.resource) setResourceTopic(res.data.resource.title);

        const payload = { resourceId: id, task: "quiz" };
        const resQuiz = await axios.post<QuizResponse>(`/api/resource-ai`, payload);

        setQuizData(resQuiz.data.quizQAs);
        setQuizId(resQuiz.data.quiz.id);

        if (resQuiz.data.quizQAs.length > 0) {
          const mediumQuestions = resQuiz.data.quizQAs.filter(q => q.difficulty === "Medium");
          const firstQuestion = mediumQuestions.length > 0 
            ? mediumQuestions[Math.floor(Math.random() * mediumQuestions.length)]
            : resQuiz.data.quizQAs[Math.floor(Math.random() * resQuiz.data.quizQAs.length)];
          
          setAskedQuestions([firstQuestion.id]);
          setUserSelections(Array(totalQuestionsToAsk).fill(null)); // Initialize selections array
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast.error("Failed to load quiz. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    Datafetcher();
  }, [id]);
  
  // Your core adaptive logic function remains unchanged
  const getNextQuestion = (isCorrect: boolean) => {
    // ... (Your getNextQuestion logic is perfect, no changes needed here)
    if (!currentQuestion) return;

    let nextDifficulty = currentQuestion.difficulty;
    if (isCorrect) {
      if (nextDifficulty === "Easy") nextDifficulty = "Medium";
      else if (nextDifficulty === "Medium") nextDifficulty = "Hard";
    } else {
      if (nextDifficulty === "Hard") nextDifficulty = "Medium";
      else if (nextDifficulty === "Medium") nextDifficulty = "Easy";
    }

    const availableQuestions = quizData.filter(q => !askedQuestions.includes(q.id));
    let nextQuestionPool = availableQuestions.filter(q => q.difficulty === nextDifficulty);

    if (nextQuestionPool.length === 0 && availableQuestions.length > 0) {
      nextQuestionPool = availableQuestions; // Fallback
    }

    if (nextQuestionPool.length > 0) {
      return nextQuestionPool[Math.floor(Math.random() * nextQuestionPool.length)].id;
    }
    return undefined;
  };

  // CHANGE 5: handleNext updated for new state and adaptive flow
  const handleNext = async () => {
    if (!selectedOption || !currentQuestion) return;

    const newSelections = [...userSelections];
    newSelections[currentQIndex] = selectedOption;
    setUserSelections(newSelections);

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setAriaMessage(isCorrect ? "Correct answer!" : "Incorrect answer.");

    // If we are on the last question, end the quiz
    if (currentQIndex === totalQuestionsToAsk - 1) {
        setQuizState("results");
        setAriaMessage(`Quiz completed!`);
        // Finalize answers and submit
        const finalAnswers: FinalAnswer[] = askedQuestions.map((qaId, index) => {
          const question = quizData.find(q => q.id === qaId)!;
          const selection = newSelections[index];
          return {
            quizQAId: qaId,
            selectedOption: selection!,
            isCorrect: selection === question.correctAnswer,
          };
        });

        if (quizId) {
            try {
                await axios.post("/api/quiz-result", { quizId, answers: finalAnswers.map(a => ({ quizQAId: a.quizQAId, selectedOption: a.selectedOption })) });
            } catch (error) { console.error("Error saving quiz result:", error); }
        }
    } else {
        // If we haven't asked this question before, find the next one
        if (currentQIndex === askedQuestions.length - 1) {
            const nextQuestionId = getNextQuestion(isCorrect);
            if (nextQuestionId) {
                setAskedQuestions([...askedQuestions, nextQuestionId]);
            }
        }
        setCurrentQIndex(currentQIndex + 1);
        setSelectedOption(newSelections[currentQIndex + 1]); // Set selected for next question if it exists
        setAriaMessage(`Moving to question ${currentQIndex + 2}`);
    }
  };
  
  // CHANGE 1: "Previous" button handler re-introduced
  const handlePrevious = () => {
    setCurrentQIndex(currentQIndex - 1);
    setSelectedOption(userSelections[currentQIndex - 1]);
    setAriaMessage(`Going back to question ${currentQIndex}`);
  };

  const resetQuiz = () => {
    // ... (resetQuiz logic would be updated similarly if needed, this is a good start)
    window.location.reload(); // Simple way to fully reset the quiz state
  };

  const startReview = () => setQuizState("review");
  const returnToResults = () => setQuizState("results");
  
  if (isLoading || askedQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Generating your quiz...</p>
      </div>
    );
  }

  if (!currentQuestion) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-xl font-semibold mt-4">Could not load the current question.</p>
      </div>
    );
  }

  return (
    <div className="mt-10 min-h-[90vh] h-full px-6 max-w-3xl mx-auto flex flex-col items-center justify-center">
      <AriaLiveRegion message={ariaMessage} priority="polite" clearAfter={3000} />
      {quizState !== "results" && (
        <header className="py-8 space-y-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-lime-400">Quiz On</h1>
          <h2 className="text-xl sm:text-xl font-medium text-white px-4">{resourceTopic}</h2>
        </header>
      )}

      <main className="bg-zinc-900 rounded-xl p-6 shadow-xl w-full" id="main-content">
        {quizState === "quiz" && (
          <>
            <AccessibleProgressBar current={currentQIndex + 1} total={totalQuestionsToAsk} label="Quiz Progress" className="mb-6" />
            <QuizQuestion
              question={currentQuestion.question}
              options={currentQuestion.options}
              selected={selectedOption}
              setSelected={setSelectedOption}
              questionNumber={currentQIndex + 1}
              totalQuestions={totalQuestionsToAsk}
            />
            <nav className="flex items-center justify-between mt-6" aria-label="Quiz navigation">
              {/* CHANGE 1: "Previous" button is back */}
              <div>
                {currentQIndex > 0 && (
                  <button onClick={handlePrevious} className="flex items-center gap-2 bg-zinc-700 text-white px-4 py-2 rounded hover:bg-zinc-600 transition-colors">
                    <ArrowLeft size={16} aria-hidden="true" /> Previous
                  </button>
                )}
              </div>
              <button onClick={handleNext} disabled={!selectedOption} className="bg-primary text-black px-6 py-2 rounded hover:bg-lime-300 flex items-center gap-2 transition-colors disabled:opacity-50">
                {currentQIndex === totalQuestionsToAsk - 1 ? "Finish Quiz" : "Next"}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </nav>
          </>
        )}

        {quizState === "results" && (
           <QuizFinalResult
            userAnswers={askedQuestions.map((qaId, index) => { // Construct final answers for results page
              const question = quizData.find(q => q.id === qaId)!;
              const selection = userSelections[index];
              return {
                quizQAId: qaId,
                selectedOption: selection!,
                isCorrect: selection === question.correctAnswer,
              };
            })}
            quizData={quizData}
            resetQuiz={resetQuiz}
            startReview={startReview}
          />
        )}
        
        {quizState === "review" && (
          <QuizReview
            userAnswers={askedQuestions.map((qaId, index) => { // Construct final answers for review page
              const question = quizData.find(q => q.id === qaId)!;
              const selection = userSelections[index];
              return {
                quizQAId: qaId,
                selectedOption: selection!,
                isCorrect: selection === question.correctAnswer,
              };
            })}
            quizData={quizData}
            returnToResults={returnToResults}
          />
        )}
      </main>
    </div>
  );
}
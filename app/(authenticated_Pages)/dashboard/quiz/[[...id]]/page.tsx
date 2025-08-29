"use client";

import { useState, useEffect, useMemo, useRef, use } from "react";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizFinalResult from "@/components/quiz/QuizResult";
import QuizReview from "@/components/quiz/QuizReview";
import { AccessibleProgressBar } from "@/components/accessibility/AccessibleProgressBar";
import { AriaLiveRegion } from "@/components/accessibility/AriaLiveRegion";
import axios from "axios";

// Define the shape of the resolved params object
type QuizPageParams = {
  id: string | string[];
};

// Define the props for the Page component
type QuizPageProps = {
  params: Promise<QuizPageParams>; // CHANGE: Typed 'params' as a Promise
};

type QuizQA = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
};

type ResourceResponse = {
  resource?: { id: string; title: string };
};

type QuizResponse = {
  message: string;
  quiz: { id:string; resourceId: string };
  quizQAs: QuizQA[];
};

type FinalAnswer = {
  quizQAId: string;
  selectedOption: string;
  isCorrect: boolean;
};

export default function QuizPage({ params }: QuizPageProps) {
  // Unwrapping the promise and asserting the type of the result
  const resolvedParams = use(params);
  const id = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;
  const hasFetched = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [resourceTopic, setResourceTopic] = useState("");
  // ... rest of the component code remains the same
  const [quizData, setQuizData] = useState<QuizQA[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userSelections, setUserSelections] = useState<(string | null)[]>([]);

  const [quizState, setQuizState] = useState<"quiz" | "results" | "review">("quiz");
  const [ariaMessage, setAriaMessage] = useState("");
  const totalQuestionsToAsk = 7;

  const currentQuestion = useMemo(() => {
    if (askedQuestions.length === 0 || currentQIndex >= askedQuestions.length) return null;
    return quizData.find(q => q.id === askedQuestions[currentQIndex]);
  }, [currentQIndex, askedQuestions, quizData]);

  const initializeQuiz = (questions: QuizQA[]) => {
    if (questions.length > 0) {
      const mediumQuestions = questions.filter(q => q.difficulty === "Medium");
      const firstQuestion = mediumQuestions.length > 0 
        ? mediumQuestions[Math.floor(Math.random() * mediumQuestions.length)]
        : questions[Math.floor(Math.random() * questions.length)];
      
      setAskedQuestions([firstQuestion.id]);
      setUserSelections(Array(totalQuestionsToAsk).fill(null));
      setCurrentQIndex(0);
      setSelectedOption(null);
      setQuizState("quiz");
    }
  };

  useEffect(() => {
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
        initializeQuiz(resQuiz.data.quizQAs);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast.error("Failed to load quiz. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    Datafetcher();
  }, [id]);
  
  const getNextQuestion = (isCorrect: boolean) => {
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
      nextQuestionPool = availableQuestions;
    }
    if (nextQuestionPool.length > 0) {
      return nextQuestionPool[Math.floor(Math.random() * nextQuestionPool.length)].id;
    }
    return undefined;
  };

  const handleNext = async () => {
    if (!selectedOption || !currentQuestion) return;

    const newSelections = [...userSelections];
    newSelections[currentQIndex] = selectedOption;
    setUserSelections(newSelections);

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setAriaMessage(isCorrect ? "Correct answer!" : "Incorrect answer.");

    if (currentQIndex === totalQuestionsToAsk - 1) {
        setQuizState("results");
        setAriaMessage(`Quiz completed!`);
        const finalAnswers: FinalAnswer[] = askedQuestions.map((qaId, index) => {
          const question = quizData.find(q => q.id === qaId)!;
          return {
            quizQAId: qaId,
            selectedOption: newSelections[index]!,
            isCorrect: newSelections[index] === question.correctAnswer,
          };
        });

        if (quizId) {
            try {
                await axios.post("/api/quiz-result", { quizId, answers: finalAnswers.map(a => ({ quizQAId: a.quizQAId, selectedOption: a.selectedOption })) });
            } catch (error) { console.error("Error saving quiz result:", error); }
        }
    } else {
        if (currentQIndex === askedQuestions.length - 1) {
            const nextQuestionId = getNextQuestion(isCorrect);
            if (nextQuestionId) {
                setAskedQuestions([...askedQuestions, nextQuestionId]);
            }
        }
        setCurrentQIndex(currentQIndex + 1);
        setSelectedOption(newSelections[currentQIndex + 1] || null);
        setAriaMessage(`Moving to question ${currentQIndex + 2}`);
    }
  };
  
  const handlePrevious = () => {
    setCurrentQIndex(currentQIndex - 1);
    setSelectedOption(userSelections[currentQIndex - 1]);
    setAriaMessage(`Going back to question ${currentQIndex}`);
  };

  const resetQuiz = () => {
    initializeQuiz(quizData);
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
            userAnswers={askedQuestions.map((qaId, index) => {
              const question = quizData.find(q => q.id === qaId)!;
              return {
                quizQAId: qaId,
                selectedOption: userSelections[index]!,
                isCorrect: userSelections[index] === question.correctAnswer,
              };
            })}
            quizData={quizData}
            resetQuiz={resetQuiz}
            startReview={startReview}
          />
        )}
        
        {quizState === "review" && (
          <QuizReview
            userAnswers={askedQuestions.map((qaId, index) => {
              const question = quizData.find(q => q.id === qaId)!;
              return {
                quizQAId: qaId,
                selectedOption: userSelections[index]!,
                isCorrect: userSelections[index] === question.correctAnswer,
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
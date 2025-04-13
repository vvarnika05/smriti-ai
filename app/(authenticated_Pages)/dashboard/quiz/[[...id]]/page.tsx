"use client";
import { useRef, use, useState, useEffect } from "react";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizFinalResult from "@/components/quiz/QuizResult";
import { ArrowLeft, ArrowRight } from "lucide-react";
import axios from "axios";

export default function QuizPage({ params }: { params: any }) {
  const rawId = (use(params) as { id: string | string[] }).id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [isLoading, setIsLoading] = useState(true);
  const [resourceTopic, setResourceTopic] = useState("");
  const [quizData, setQuizData] = useState<
    {
      question: string;
      options: string[];
      answer: string;
    }[]
  >([]);

  const resourceAPI = "/api/resource";

  type QuizQA = {
    id: string;
    quizId: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  };

  type QuizResponse = {
    message: string;
    quiz: { id: string; resourceId: string };
    quizQAs: QuizQA[];
  };

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function Datafetcher() {
      // Fetch resource title
      const res = await axios.get<{ resource?: { title: string } }>(
        resourceAPI,
        {
          params: { id },
        }
      );
      if (res.data.resource) {
        setResourceTopic(res.data.resource.title);
      } else {
        console.error("Resource not found");
      }

      // Call quiz API
      const payload = {
        resourceId: id,
        task: "quiz",
      };

      try {
        const resQuiz = await axios.post<QuizResponse>(
          "/api/resource-ai",
          payload
        );
        console.log("Quiz response:", resQuiz.data);

        const quizItems = resQuiz.data.quizQAs.map((qa) => ({
          question: qa.question,
          options: qa.options,
          answer: qa.correctAnswer,
          explanation: qa.explanation,
        }));

        setQuizData(quizItems);
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setIsLoading(false);
      }
    }

    Datafetcher();
  }, [id]);

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const total = quizData.length;

  const handleSubmit = () => {
    console.log("Selected answer:", selected);
    console.log("Correct answer:", quizData[currentQ].answer);

    if (selected === quizData[currentQ].answer) {
      setScore((prev) => prev + 1);
    }

    // Move to next or end
    if (currentQ < total - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
    } else {
      setCurrentQ((prev) => prev + 1); // move beyond last question to show final screen
    }
  };

  return (
    <div className="min-h-screen mt-14 bg-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="py-10 space-y-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-lime-400">
            Quiz for Resource:
          </h1>
          <h2 className="text-xl sm:text-xl font-medium text-white px-4">
            {resourceTopic}
          </h2>
        </div>

        {isLoading ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-white text-lg gap-4">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-xl p-6 shadow-xl">
            {/* Progress Bar */}
            <div className="w-full mb-6">
              <div className="w-full h-2 bg-zinc-700 rounded-full">
                <div
                  className="h-2 bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(currentQ / total) * 100}%` }}
                />
              </div>
              {currentQ < total && (
                <p className="text-sm text-right mt-1 text-gray-400">
                  Question {currentQ + 1} of {total}
                </p>
              )}
            </div>

            {/* Show quiz or result */}
            {currentQ < total ? (
              <>
                <QuizQuestion
                  question={quizData[currentQ].question}
                  options={quizData[currentQ].options}
                  selected={selected}
                  setSelected={setSelected}
                />
                <div className="flex items-center justify-between">
                  <div className="mt-6 flex justify-between items-center">
                    {currentQ > 0 ? (
                      <button
                        onClick={() => setCurrentQ((prev) => prev - 1)}
                        className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded hover:bg-lime-300"
                      >
                        <ArrowLeft size={16} />
                        Previous
                      </button>
                    ) : (
                      <div />
                    )}{" "}
                    {/* placeholder to align with next btn */}
                  </div>

                  <div className="mt-6 text-right">
                    <button
                      onClick={handleSubmit}
                      // disabled={!selected}
                      className="bg-primary text-black px-4 py-2 rounded hover:bg-lime-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentQ === total - 1 ? "Finish Quiz" : "Next"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <QuizFinalResult score={score} total={total} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

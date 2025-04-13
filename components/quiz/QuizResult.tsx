"use client";
import { useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import confetti from "canvas-confetti";

export type QuizFinalResultProps = {
  score: number;
  total: number;
};

const QuizFinalResult = ({ score, total }: QuizFinalResultProps) => {
  const percentage = Math.round((score / total) * 100);

  // Determine dynamic color
  let color = "#dc2626"; // red
  if (percentage > 30 && percentage <= 70) color = "#eab308"; // yellow
  if (percentage > 70) color = "#84cc16"; // lime green

  useEffect(() => {
    if (percentage > 70) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [percentage]);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <h2 className="text-3xl font-bold text-primary">Your Quiz Summary</h2>

      <div className="w-45 h-45 rounded-full p-4 ">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          strokeWidth={10}
          styles={buildStyles({
            textColor: "#fff",
            pathColor: color,
            trailColor: "#1e1e2f",
            textSize: "16px",
          })}
        />
      </div>

      <p className="text-white text-lg">
        You answered <span className="font-bold text-primary">{score}</span> out
        of <span className="font-bold text-primary">{total}</span> questions
        correctly.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-primary text-black px-6 py-2 rounded hover:bg-lime-300"
      >
        Retry Quiz
      </button>
    </div>
  );
};

export default QuizFinalResult;

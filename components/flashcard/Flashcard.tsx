"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Eye, Check, X } from "lucide-react";

interface FlashcardProps {
  id: string;
  term: string;
  definition: string;
  onDifficultyRate: (difficulty: number) => void;
  isReview?: boolean;
}

export default function Flashcard({
  id,
  term,
  definition,
  onDifficultyRate,
  isReview = false,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleDifficultyRate = (difficulty: number) => {
    onDifficultyRate(difficulty);
    setShowDifficulty(false);
    setIsFlipped(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flashcard-container h-64">
        <Card className={`flashcard h-full cursor-pointer ${isFlipped ? "flipped" : ""}`} onClick={handleFlip}>
          <div className="flashcard-front">
            <CardContent className="p-6 flex flex-col justify-center items-center text-center">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Term</div>
                <h3 className="text-xl font-semibold">{term}</h3>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>Click to reveal definition</span>
                </div>
              </div>
            </CardContent>
          </div>
          <div className="flashcard-back">
            <CardContent className="p-6 flex flex-col justify-center items-center text-center">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Definition</div>
                <p className="text-lg">{definition}</p>
                {isReview && !showDifficulty && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDifficulty(true);
                    }}
                    className="mt-4"
                  >
                    Rate Difficulty
                  </Button>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {showDifficulty && (
        <div className="mt-6 space-y-4">
          <h4 className="text-center font-medium">How difficult was this card?</h4>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((difficulty) => (
              <Button
                key={difficulty}
                variant={difficulty <= 2 ? "default" : difficulty <= 4 ? "secondary" : "destructive"}
                size="sm"
                onClick={() => handleDifficultyRate(difficulty)}
                className="flex items-center space-x-1"
              >
                {difficulty <= 2 ? (
                  <Check className="w-4 h-4" />
                ) : difficulty >= 4 ? (
                  <X className="w-4 h-4" />
                ) : null}
                <span>{difficulty}</span>
              </Button>
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            1 = Easy, 5 = Hard
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFlip}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Flip Card</span>
        </Button>
      </div>
    </div>
  );
}

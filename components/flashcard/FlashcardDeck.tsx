"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import Flashcard from "./Flashcard";
import axios from "axios";

interface FlashcardData {
  id: string;
  term: string;
  definition: string;
}

interface FlashcardDeckProps {
  resourceId: string;
  title: string;
  cards: FlashcardData[];
  onExport?: () => void;
  isExporting: boolean;
}

export default function FlashcardDeck({
  resourceId,
  title,
  cards,
  onExport,
  isExporting,
}: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDifficultyRate = async (difficulty: number) => {
    if (!currentCard) return;

    try {
      // Save review data to database
      await axios.post("/api/flashcard-review", {
        cardId: currentCard.id,
        difficulty,
      });

      // Mark card as reviewed
      setReviewedCards((prev) => new Set([...prev, currentCard.id]));

      // Move to next card if in review mode
      if (isReviewMode && currentIndex < cards.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving review:", error);
    }
  };

  const toggleReviewMode = () => {
    setIsReviewMode(!isReviewMode);
    setCurrentIndex(0);
    setReviewedCards(new Set());
  };

  const resetDeck = () => {
    setCurrentIndex(0);
    setReviewedCards(new Set());
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay && !isReviewMode) {
      const interval = setInterval(() => {
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setIsAutoPlay(false);
        }
      }, 3000); // 3 seconds per card

      return () => clearInterval(interval);
    }
  }, [isAutoPlay, currentIndex, cards.length, isReviewMode]);

  if (!currentCard) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p>No flashcards available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            {/* Title */}
            <span className="text-lg font-medium">{title}</span>

            {/* Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleReviewMode}
                className={
                  isReviewMode ? "bg-primary text-primary-foreground" : ""
                }
              >
                {isReviewMode ? "Study Mode" : "Review Mode"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoPlay}
                className={
                  isAutoPlay ? "bg-primary text-primary-foreground" : ""
                }
              >
                {isAutoPlay ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              <Button variant="outline" size="sm" onClick={resetDeck}>
                <RotateCcw className="w-4 h-4" />
              </Button>

              {onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                  disabled={isExporting}
                >
                  {isExporting ? <>Exporting...</> : <>Export</>}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Card {currentIndex + 1} of {cards.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
            {isReviewMode && (
              <div className="text-sm text-muted-foreground">
                Reviewed: {reviewedCards.size} / {cards.length}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Flashcard */}
      <Flashcard
        id={currentCard.id}
        term={currentCard.term}
        definition={currentCard.definition}
        onDifficultyRate={handleDifficultyRate}
        isReview={isReviewMode}
      />

      {/* Navigation */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

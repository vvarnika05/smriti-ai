import { Quiz, QuizQA } from "@prisma/client";

// The shape of the data when we first generate the quiz pool
export type QuizGenerationResponse = {
  quiz: Quiz;
  quizQAs: QuizQA[];
};

// The shape of the data when we fetch a single adaptive question
export type AdaptiveQuestionResponse = {
  question: QuizQA & { quiz: { topicId: string } };
};

// The shape of the data when we check an answer
export type CheckAnswerResponse = {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
};
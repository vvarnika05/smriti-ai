import db from "@/lib/prisma";

/**
 * Fetches the next suitable question for an adaptive quiz.
 * @param quizId The ID of the current quiz.
 * @param skillScore The user's current skill score.
 * @param excludedIds An array of question IDs to exclude.
 * @returns The next question or null if none are found.
 */
export async function getAdaptiveQuestion(
  quizId: string,
  skillScore: number,
  excludedIds: string[]
) {
  const difficultyRange = 15;
  const minDifficulty = Math.max(1, skillScore - difficultyRange);
  const maxDifficulty = Math.min(100, skillScore + difficultyRange);

  const question = await db.quizQA.findFirst({
    where: {
      quizId: quizId,
      id: { notIn: excludedIds },
      difficulty: { gte: minDifficulty, lte: maxDifficulty },
    },
    include: {
      quiz: {
        include: {
          resource: {
            select: {
              topicId: true,
            },
          },
        },
      },
    },
    orderBy: { difficulty: 'asc' },
  });

  return question;
}
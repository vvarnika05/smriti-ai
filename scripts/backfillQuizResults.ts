// scripts/backfillQuizResults.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting backfill process...');

  // 1. Find all QuizResults that are missing a userId
  const resultsToUpdate = await prisma.quizResult.findMany({
    where: {
      userId: null,
    },
    include: {
      quiz: {
        include: {
          resource: {
            include: {
              topic: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (resultsToUpdate.length === 0) {
    console.log('No QuizResults to update. All records have a userId.');
    return;
  }

  console.log(`Found ${resultsToUpdate.length} QuizResult(s) to update.`);

  // 2. Create a transaction to update all of them
  const updatePromises = resultsToUpdate.map(result => {
    const userId = result.quiz?.resource?.topic?.userId;
    if (userId) {
      console.log(`Updating QuizResult ID: ${result.id} with User ID: ${userId}`);
      return prisma.quizResult.update({
        where: { id: result.id },
        data: { userId: userId },
      });
    } else {
      console.warn(`Could not find a userId for QuizResult ID: ${result.id}. Skipping.`);
      return Promise.resolve(null); // Return a resolved promise to not break Promise.all
    }
  });

  await Promise.all(updatePromises);

  console.log('Backfill process completed successfully!');
}

main()
  .catch((e) => {
    console.error('An error occurred during the backfill process:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
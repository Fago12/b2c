import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Review model access...');
  try {
    const reviews = await prisma.review.findMany({
      take: 1,
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
      },
    });
    console.log('Successfully fetched reviews:', reviews);
    
    const stats = await prisma.review.aggregate({ _avg: { rating: true } });
    console.log('Successfully fetched stats:', stats);

  } catch (error) {
    console.error('Error accessing Review model:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

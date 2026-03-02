import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Attempting to findMany orders with items...');
  try {
    const orders = await prisma.order.findMany({
      where: {}, 
      include: { 
        items: { include: { product: true } }, 
        user: true 
      },
      orderBy: { createdAt: 'desc' },
      skip: 0,
    });
    console.log(`Successfully fetched ${orders.length} orders.`);
  } catch (error) {
    console.error('Error in findMany:', error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

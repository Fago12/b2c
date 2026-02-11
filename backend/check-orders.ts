
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting check-orders.ts...');
  try {
    const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: true, items: true }
  });

  console.log('Latest 5 orders:');
  orders.forEach(o => {
    console.log(`ID: ${o.id}, Status: ${o.status}, User: ${o.user?.email || 'Guest'}, Total: ${o.total}, CreatedAt: ${o.createdAt}`);
  });
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

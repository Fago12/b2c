
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.marqueeItem.findMany({
    orderBy: { order: 'asc' }
  });
  console.log('CURRENT_ITEMS:', JSON.stringify(items));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

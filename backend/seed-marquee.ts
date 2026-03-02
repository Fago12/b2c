
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing marquee items...');
  await prisma.marqueeItem.deleteMany({});

  const items = [
    { text: 'Fast Shipping Worldwide', order: 0, isActive: true },
    { text: 'Hassle-Free Returns', order: 1, isActive: true },
    { text: 'Quality Assurance', order: 2, isActive: true },
  ];

  console.log('Seeding new marquee items...');
  for (const item of items) {
    await prisma.marqueeItem.create({ data: item });
  }

  const final = await prisma.marqueeItem.findMany({ orderBy: { order: 'asc' } });
  console.log('FINAL_ITEMS:', JSON.stringify(final));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

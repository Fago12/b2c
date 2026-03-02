import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Homepage Sections ---');
  const sections = await prisma.homepageSection.findMany();
  console.log(JSON.stringify(sections, null, 2));

  console.log('--- Hero Sections ---');
  const heroes = await prisma.heroSection.findMany();
  console.log(JSON.stringify(heroes, null, 2));

  console.log('--- Marquee Items ---');
  const marquees = await prisma.marqueeItem.findMany();
  console.log(JSON.stringify(marquees, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

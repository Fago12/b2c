import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Deep Data Verification ---');
  const sections = await prisma.homepageSection.findMany({ where: { isActive: true } });
  console.log(`Found ${sections.length} active sections.`);

  for (const section of sections) {
    console.log(`\nSection Type: ${section.type}, ReferenceId: ${section.referenceId}`);
    if (section.type === 'HERO' && section.referenceId) {
      const hero = await prisma.heroSection.findUnique({ where: { id: section.referenceId } });
      console.log('Hero Data:', hero ? 'FOUND' : 'NOT FOUND', hero ? `(Title: ${hero.title})` : '');
    }
    if (section.type === 'MARQUEE' && section.referenceId) {
        const marquee = await prisma.marqueeItem.findUnique({ where: { id: section.referenceId } });
        console.log('Marquee Data:', marquee ? 'FOUND' : 'NOT FOUND');
    }
  }

  const productsWithBasePrice = await (prisma as any).product.findMany({ where: { basePrice: { not: null } }, take: 5 });
  console.log(`\nProducts with basePrice: ${productsWithBasePrice.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

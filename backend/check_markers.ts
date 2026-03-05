import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMarkers() {
  const variants = await prisma.variant.findMany({
    where: {
      OR: [
        { imageUrl: { contains: '__' } },
        { pattern: { is: { previewImageUrl: { contains: '__' } } } }
      ]
    },
    include: {
        pattern: true
    }
  });

  console.log(`Found ${variants.length} variants with markers:`);
  variants.forEach(v => {
    console.log(`SKU: ${v.sku}, Image: ${v.imageUrl}, Pattern: ${v.pattern?.name}, PatternURL: ${v.pattern?.previewImageUrl}`);
  });

  const patterns = await prisma.pattern.findMany({
    where: {
        previewImageUrl: { contains: '__' }
    }
  });

  console.log(`\nFound ${patterns.length} patterns with markers:`);
  patterns.forEach(p => {
    console.log(`Pattern: ${p.name}, URL: ${p.previewImageUrl}`);
  });

  await prisma.$disconnect();
}

checkMarkers();

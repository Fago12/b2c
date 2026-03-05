import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnostic() {
  const product = await prisma.product.findFirst({
    where: { name: { contains: 'Napkin', mode: 'insensitive' } },
    include: {
      variants: {
        include: {
          pattern: true,
          color: true
        }
      }
    }
  });

  if (!product) {
    console.log("Product not found");
    return;
  }

  console.log(`Product: ${product.name} (${product.id})`);
  product.variants.forEach(v => {
    console.log(`\nSKU: ${v.sku}`);
    console.log(`Variant ImageUrl: "${v.imageUrl}"`);
    console.log(`Pattern Name: ${v.pattern?.name}, Pattern URL: "${v.pattern?.previewImageUrl}"`);
    console.log(`Options JSON: ${JSON.stringify(v.options)}`);
  });

  const allPatterns = await prisma.pattern.findMany();
  console.log("\n--- All Patterns in DB ---");
  allPatterns.forEach(p => {
    console.log(`Pattern: ${p.name}, URL: "${p.previewImageUrl}"`);
  });

  await prisma.$disconnect();
}

diagnostic();

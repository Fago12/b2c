const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
  const p = await prisma.product.findFirst({
    where: { slug: 'brand-patterned-napkin-1770834041040' }
  });

  if (!p) {
    console.log('Product not found');
    return;
  }

  console.log('--- PRODUCT INFO ---');
  console.log('Name:', p.name);
  console.log('Base Price USD:', p.basePriceUSD);
  console.log('Sale Price USD:', p.salePriceUSD);
  console.log('Options:', JSON.stringify(p.options, null, 2));
  console.log('Variants:', JSON.stringify(p.variants, null, 2));

  // Check categories as well
  const categories = await prisma.category.findMany();
  console.log('Categories Count:', categories.length);
}

debug()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

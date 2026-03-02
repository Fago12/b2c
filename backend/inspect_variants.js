const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      variants: { not: [] }
    },
    take: 5
  });

  console.log('--- PRODUCTS WITH VARIANTS ---');
  products.forEach(p => {
    console.log(`Product: ${p.name} (${p.id})`);
    console.log(`Options: ${JSON.stringify(p.options)}`);
    console.log(`Variants: ${JSON.stringify(p.variants, null, 2)}`);
    console.log('---------------------------');
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

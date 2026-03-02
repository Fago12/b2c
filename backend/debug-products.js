const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.findMany({
    include: {
        category: true
    }
  });
  console.log('PRODUCTS_DEBUG_START');
  console.log(JSON.stringify(products, null, 2));
  console.log('PRODUCTS_DEBUG_END');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.update({
    where: { id: '698cc87915ef1179c3a9ba10' },
    data: {
      basePriceUSD: 500,
      salePriceUSD: 435
    }
  });
  console.log('Fixed Product:', product.name, 'Base:', product.basePriceUSD, 'Sale:', product.salePriceUSD);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  const regions = await prisma.region.findMany();
  console.log('--- Regions ---');
  console.log(JSON.stringify(regions, null, 2));

  const rates = await prisma.exchangeRate.findMany();
  console.log('\n--- Exchange Rates ---');
  console.log(JSON.stringify(rates, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const products = await prisma.product.findMany({
    take: 5,
    include: { category: true }
  }) as any[];
  
  console.log('--- PRODUCT DATA PREVIEW ---');
  products.forEach(p => {
    console.log(`ID: ${p.id}`);
    console.log(`Name: ${p.name}`);
    console.log(`basePriceUSD: ${p.basePriceUSD}`);
    console.log(`salePriceUSD: ${p.salePriceUSD}`);
    console.log(`Raw Object: ${JSON.stringify({
        basePriceUSD: p.basePriceUSD,
        salePriceUSD: p.salePriceUSD,
        basePrice: p.basePrice,
        price: p.price
    })}`);
    console.log('---------------------------');
  });

  const regions = await prisma.region.findMany();
  console.log('--- REGIONS ---');
  console.log(JSON.stringify(regions, null, 2));

  const rates = await prisma.exchangeRate.findMany();
  console.log('--- RATES ---');
  console.log(JSON.stringify(rates, null, 2));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

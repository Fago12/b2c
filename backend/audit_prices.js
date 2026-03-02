const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
  const products = await prisma.product.findMany();
  console.log('--- PRODUCTS AUDIT ---');
  for (const p of products) {
    console.log(`[${p.slug}] Base: ${p.basePriceUSD} | Sale: ${p.salePriceUSD}`);
    if (p.variants && Array.isArray(p.variants)) {
       p.variants.forEach(v => {
         console.log(`  -> Variant ${v.sku}: priceUSD=${v.priceUSD}`);
       });
    }
  }

  const rates = await prisma.exchangeRate.findMany();
  console.log('\n--- EXCHANGE RATES ---');
  rates.forEach(r => {
    console.log(`${r.currency}: ${r.rate}`);
  });
}

audit()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

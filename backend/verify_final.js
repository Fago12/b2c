const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const p = await prisma.product.findFirst({
    where: { slug: 'brand-patterned-napkin-1770834041040' }
  });
  const rate = await prisma.exchangeRate.findFirst({
    where: { currency: 'NGN' }
  });

  console.log('--- FINAL VERIFICATION ---');
  console.log('NGN RATE:', rate.rate);
  console.log('Product ID:', p.id);
  console.log('Base Price USD (cents):', p.basePriceUSD);
  console.log('Sale Price USD (cents):', p.salePriceUSD);
  
  console.log('\nVariants:');
  p.variants.forEach(v => {
    console.log(`  - SKU: ${v.sku} | priceUSD: ${v.priceUSD} | Stock: ${v.stock}`);
    console.log(`    Options:`, JSON.stringify(v.options));
  });

  const conversionBase = Math.round(p.basePriceUSD * parseFloat(rate.rate));
  const conversionSale = Math.round(p.salePriceUSD * parseFloat(rate.rate));
  
  console.log('\nExpected Regional Conversion:');
  console.log(`  Base ($5): ${p.basePriceUSD} * ${rate.rate} = ${conversionBase} (~${(conversionBase/100).toFixed(0)} ₦)`);
  console.log(`  Sale ($4.35): ${p.salePriceUSD} * ${rate.rate} = ${conversionSale} (~${(conversionSale/100).toFixed(0)} ₦)`);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

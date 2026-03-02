const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditPrices() {
  console.log('--- Detailed Price Audit ---');
  
  try {
    const products = await prisma.product.findMany();
    
    for (const product of products) {
      console.log(`Product: ${product.name}`);
      console.log(`  BasePriceUSD: ${product.basePriceUSD}`);
      console.log(`  SalePriceUSD: ${product.salePriceUSD}`);
      if (product.customizationOptions?.embroidery) {
          console.log(`  Embroidery Price: ${product.customizationOptions.embroidery.price}`);
      }
      if (product.variants && Array.isArray(product.variants)) {
          product.variants.forEach(v => {
              console.log(`  Variant ${v.sku}: Price=${v.priceUSD}, Sale=${v.salePriceUSD}`);
          });
      }
      console.log('---------------------------');
    }
  } catch (error) {
    console.error('❌ Audit Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

auditPrices();

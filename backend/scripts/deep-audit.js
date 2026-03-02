const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deepAudit() {
  console.log('--- Deep Price Audit ---');
  
  try {
    const products = await prisma.product.findMany();
    
    for (const product of products) {
      console.log(`Product: ${product.name}`);
      console.log(`  basePriceUSD: ${product.basePriceUSD}`);
      console.log(`  salePriceUSD: ${product.salePriceUSD}`);
      console.log(`  embroideryPriceUSD (top-level): ${product['embroideryPriceUSD']}`);
      console.log(`  customizationOptions: ${JSON.stringify(product.customizationOptions)}`);
      console.log('---------------------------');
    }
  } catch (error) {
    console.error('❌ Audit Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deepAudit();

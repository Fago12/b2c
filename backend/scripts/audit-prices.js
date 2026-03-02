const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditPrices() {
  console.log('--- Price Audit Script ---');
  
  try {
    const products = await prisma.product.findMany();
    
    for (const product of products) {
      if (product.customizationOptions?.embroidery?.enabled) {
        console.log(`Product: ${product.name} | Embroidery Price: ${product.customizationOptions.embroidery.price}`);
      }
    }
  } catch (error) {
    console.error('❌ Audit Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

auditPrices();

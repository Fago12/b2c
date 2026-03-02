const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function targetedAudit() {
  console.log('--- Targeted Product Audit ---');
  
  try {
    const product = await prisma.product.findUnique({
      where: { slug: 'brand-patterned-napkin-1770834041040' }
    });
    
    if (product) {
      console.log(`Product: ${product.name}`);
      console.log(`JSON: ${JSON.stringify(product.customizationOptions, null, 2)}`);
    } else {
      console.log('Product not found');
    }
  } catch (error) {
    console.error('❌ Audit Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

targetedAudit();

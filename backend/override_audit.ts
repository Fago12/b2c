
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('--- REGIONAL PRICE AUDIT ---');
    const overrides = await prisma.productRegionalPrice.findMany();
    console.log(`Found ${overrides.length} regional overrides.`);
    
    for (const o of overrides) {
        console.log(`Product: ${o.productId}, Region: ${o.regionCode}, Price: ${o.price}`);
    }

  } catch (error) {
    console.error('Error during audit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

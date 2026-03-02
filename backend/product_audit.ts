
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('--- PRODUCT PRICING AUDIT ---');
    const hoodie = await prisma.product.findFirst({
        where: { name: { contains: 'Classic Black Hoodie', mode: 'insensitive' } }
    });
    
    if (hoodie) {
      console.log('Product ID:', hoodie.id);
      console.log('BasePriceUSD:', hoodie.basePriceUSD, typeof hoodie.basePriceUSD);
      console.log('SalePriceUSD:', hoodie.salePriceUSD);
      
      const regionOverride = await (prisma as any).productPriceOverride.findFirst({
          where: { productId: hoodie.id }
      });
      console.log('Region Override:', regionOverride);
    } else {
      console.log('Classic Black Hoodie not found.');
    }

  } catch (error) {
    console.error('Error during audit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

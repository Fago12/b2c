const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function healInflatedPrices() {
  console.log('--- Targeted Inflation Healing Script ---');
  
  try {
    const products = await prisma.product.findMany();
    let fixedCount = 0;

    for (const product of products) {
      if (product.customizationOptions?.embroidery?.price > 1000) {
        const currentPrice = product.customizationOptions.embroidery.price;
        // If it's a multiple of 100 and very large, it's almost certainly inflated
        if (currentPrice % 100 === 0) {
          const newPrice = currentPrice / 100;
          console.log(`Healing Product: ${product.name} | ${currentPrice} -> ${newPrice}`);
          
          await prisma.product.update({
            where: { id: product.id },
            data: {
              customizationOptions: {
                ...product.customizationOptions,
                embroidery: {
                  ...product.customizationOptions.embroidery,
                  price: newPrice
                }
              }
            }
          });
          fixedCount++;
        }
      }
    }
    
    console.log(`\n--- Healing Complete. Fixed ${fixedCount} products. ---`);
  } catch (error) {
    console.error('❌ Healing Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

healInflatedPrices();

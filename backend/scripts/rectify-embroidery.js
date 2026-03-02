const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function healEmbroideryCents() {
  console.log('--- Rectifying Embroidery Cent Values (DEBUG) ---');
  
  try {
    const products = await prisma.product.findMany();
    let fixedCount = 0;

    for (const product of products) {
      console.log(`Checking ${product.name}...`);
      const co = product.customizationOptions;
      if (co && typeof co === 'object') {
          console.log(`  JSON: ${JSON.stringify(co)}`);
          if (co.embroidery) {
              const price = co.embroidery.price;
              console.log(`  Price: ${price} (Type: ${typeof price})`);
              
              if (price != null && Number(price) > 0 && Number(price) < 100) {
                const currentPrice = Number(price);
                const newPrice = Math.round(currentPrice * 100);
                
                console.log(`  Healing! ${currentPrice} -> ${newPrice}`);
                
                await prisma.product.update({
                  where: { id: product.id },
                  data: {
                    customizationOptions: {
                      ...co,
                      embroidery: {
                        ...co.embroidery,
                        price: newPrice
                      }
                    }
                  }
                });
                fixedCount++;
              }
          }
      }
    }
    
    console.log(`\n--- Healing Complete. Rectified ${fixedCount} products. ---`);
  } catch (error) {
    console.error('❌ Healing Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

healEmbroideryCents();

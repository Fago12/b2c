
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const NGN_RATE = 1500;

async function fixOrderItems() {
  console.log('Migrating OrderItem fields...');
  
  const items = await prisma.orderItem.findMany({
    include: { order: true }
  });

  console.log(`Processing ${items.length} items...`);
  
  for (const item of items) {
    const updates: any = {};
    
    // Check if unitPriceUSD is missing or zero but price exists
    if (!item.unitPriceUSD || item.unitPriceUSD === 0) {
      let usd = 0;
      if (item.price > 500) {
        // Assume NGN
        usd = Math.round(item.price / NGN_RATE / item.quantity);
      } else {
        // Assume already USD or small value
        usd = Math.round(item.price / item.quantity);
      }
      updates.unitPriceUSD = usd;
    }

    if (!item.unitPriceFinal || item.unitPriceFinal === 0) {
      updates.unitPriceFinal = updates.unitPriceUSD || item.unitPriceUSD;
    }

    if (!item.exchangeRateUsed || item.exchangeRateUsed === 0) {
      updates.exchangeRateUsed = 1.0;
    }

    if (Object.keys(updates).length > 0) {
      console.log(`Updating Item ${item.id}:`, updates);
      await prisma.orderItem.update({
        where: { id: item.id },
        data: updates
      });
    }
  }

  console.log('Migration complete.');
}

fixOrderItems()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const NGN_RATE = 1500;

async function migrateRaw() {
  console.log('Starting raw MongoDB migration...');

  // 1. Fix Orders
  console.log('Migrating Order collection...');
  const ordersRaw = await (prisma as any).$runCommandRaw({
    find: "order",
    filter: {}
  });

  const orders = ordersRaw.cursor.firstBatch as any[];
  for (const order of orders) {
    const id = order._id;
    const updates: any = {};
    if (!order.regionCode) updates.regionCode = "US";
    if (!order.currency) updates.currency = "USD";
    if (!order.exchangeRateUsed) updates.exchangeRateUsed = 1.0;
    if (order.shippingCost === undefined) updates.shippingCost = 0;

    if (Object.keys(updates).length > 0) {
      console.log(`Updating Order ${id.$oid}:`, updates);
      await (prisma as any).$runCommandRaw({
        update: "order",
        updates: [{
          q: { _id: id },
          u: { $set: updates }
        }]
      });
    }
  }

  // 2. Fix OrderItems
  console.log('Migrating OrderItem collection...');
  const itemsRaw = await (prisma as any).$runCommandRaw({
    find: "order_item",
    filter: {}
  });

  const items = itemsRaw.cursor.firstBatch as any[];
  for (const item of items) {
    const id = item._id;
    const updates: any = {};
    
    if (!item.unitPriceUSD || item.unitPriceUSD === 0) {
      let usd = 0;
      if (item.price > 500) {
        usd = Math.round(item.price / NGN_RATE / item.quantity);
      } else {
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
      console.log(`Updating Item ${id.$oid}:`, updates);
      await (prisma as any).$runCommandRaw({
        update: "order_item",
        updates: [{
          q: { _id: id },
          u: { $set: updates }
        }]
      });
    }
  }

  console.log('Raw migration complete.');
}

migrateRaw()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

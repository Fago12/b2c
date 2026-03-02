
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectOrderItems() {
  console.log('Inspecting raw order items in MongoDB...');
  
  const itemsRaw = await (prisma as any).$runCommandRaw({
    find: "order_item",
    filter: {}
  });

  const batch = itemsRaw.cursor.firstBatch as any[];
  console.log(`Found ${batch.length} order items in raw collection.`);
  
  if (batch.length > 0) {
    console.log('Fields in first item:', Object.keys(batch[0]));
    console.log('First item sample:', JSON.stringify(batch[0], null, 2));
  }

  const missingUSD = batch.filter(item => item.unitPriceUSD === undefined || item.unitPriceUSD === null);
  console.log(`Items missing unitPriceUSD: ${missingUSD.length}`);
}

inspectOrderItems()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectOrders() {
  console.log('Inspecting raw orders in MongoDB...');
  
  const ordersRaw = await (prisma as any).$runCommandRaw({
    find: "order",
    filter: {}
  });

  const batch = ordersRaw.cursor.firstBatch as any[];
  console.log(`Found ${batch.length} orders in raw collection.`);
  
  const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
  let invalidCount = 0;

  for (const order of batch) {
    const id = order._id?.$oid || order.id;
    
    // Check Status
    if (!order.status || !validStatuses.includes(order.status)) {
      console.warn(`!!! INVALID OR MISSING STATUS: Order ID: ${id}, Status: "${order.status}"`);
      invalidCount++;
    }

    // Check User Reference
    if (order.userId) {
      const user = await prisma.user.findUnique({ where: { id: order.userId } });
      if (!user) {
        console.warn(`!!! ORPHANED USER ID in Order ${id}: User ${order.userId} not found.`);
        invalidCount++;
      }
    }

    // NEW: Check if unitPriceUSD exists on Order model itself (should not be there)
    if (order.unitPriceUSD !== undefined) {
      console.warn(`!!! UNEXPECTED FIELD 'unitPriceUSD' found on Order ${id}: value is ${order.unitPriceUSD}`);
    }
  }
  
  if (invalidCount === 0) {
    console.log('All order statuses are valid according to the enum.');
  } else {
    console.log(`Summary: Found ${invalidCount} orders with invalid statuses.`);
  }
}

inspectOrders()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

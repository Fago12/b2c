const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditOrders() {
  console.log('--- Order Customization Audit ---');
  
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    for (const order of orders) {
      console.log(`Order: ${order.id} | Total: ${order.totalAmount} ${order.currency}`);
      if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
              console.log(`  Item: ${item.name} | UnitPrice: ${item.unitPriceFinal}`);
              if (item.customization) {
                  console.log(`    Customization: ${JSON.stringify(item.customization)}`);
              }
          });
      }
      console.log('---------------------------');
    }
  } catch (error) {
    console.error('❌ Audit Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

auditOrders();

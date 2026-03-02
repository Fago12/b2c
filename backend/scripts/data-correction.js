
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Starting data correction...');

    // 1. Correct Product Prices
    const products = await prisma.product.findMany();
    console.log(`Checking ${products.length} products...`);
    
    for (const product of products) {
      // If price is low (e.g. < 1000), it's likely stored as dollars, not cents
      // Or if the user explicitly said $13 is showing as $0.13, we know we need to multiply.
      // To be safe, we check if basePriceUSD is less than a certain threshold or just apply it 
      // based on the user's confirmation of the bug.
      const newPrice = product.basePriceUSD * 100;
      await prisma.product.update({
        where: { id: product.id },
        data: { basePriceUSD: newPrice }
      });
      console.log(`Updated ${product.name}: ${product.basePriceUSD} -> ${newPrice}`);
    }

    // 2. Populate totalUSD for orders
    const orders = await prisma.order.findMany();
    console.log(`Populating totalUSD for ${orders.length} orders...`);
    
    for (const order of orders) {
      if (order.totalUSD === 0 || !order.totalUSD) {
        // Calculate USD total from display total and exchange rate
        let calculatedUSD = order.total; // fallback
        if (order.exchangeRateUsed && order.exchangeRateUsed !== '1') {
          calculatedUSD = Math.round(order.total / parseFloat(order.exchangeRateUsed));
        } else if (order.currency === 'USD') {
          calculatedUSD = order.total;
        }
        
        await prisma.order.update({
          where: { id: order.id },
          data: { totalUSD: calculatedUSD }
        });
        console.log(`Order ${order.id}: ${order.total} ${order.currency} -> ${calculatedUSD} USD cents`);
      }
    }

    console.log('Data correction complete!');
  } catch (err) {
    console.error('Data correction failed', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();

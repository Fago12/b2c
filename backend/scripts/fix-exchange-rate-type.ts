import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration for exchangeRateUsed field...');
  console.log('Database URL presence:', !!process.env.DATABASE_URL);
  
  try {
    await prisma.$connect();
    console.log('Successfully connected to database.');
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }

  // 1. Fix Order model
  console.log('Checking Orders...');
  const orders = await (prisma as any).order.findRaw({
    filter: {
      exchangeRateUsed: { $not: { $type: 'string' } },
    },
  });

  console.log(`Found ${orders.length} orders with non-string exchangeRateUsed.`);

  for (const order of orders) {
    const stringRate = String(order.exchangeRateUsed);
    await (prisma as any).order.update({
      where: { id: order._id.$oid },
      data: { exchangeRateUsed: stringRate },
    });
    console.log(`Updated Order ${order._id.$oid} with rate: ${stringRate}`);
  }

  // 2. Fix OrderItem model
  console.log('Checking OrderItems...');
  const orderItems = await (prisma as any).orderItem.findRaw({
    filter: {
      exchangeRateUsed: { $not: { $type: 'string' } },
    },
  });

  console.log(`Found ${orderItems.length} order items with non-string exchangeRateUsed.`);

  for (const item of orderItems) {
    const stringRate = String(item.exchangeRateUsed);
    await (prisma as any).orderItem.update({
      where: { id: item._id.$oid },
      data: { exchangeRateUsed: stringRate },
    });
    console.log(`Updated OrderItem ${item._id.$oid} with rate: ${stringRate}`);
  }

  // 3. Fix Cart model
  console.log('Checking Carts...');
  const carts = await (prisma as any).cart.findRaw({
    filter: {
      exchangeRateUsed: { $not: { $type: 'string' } },
    },
  });

  console.log(`Found ${carts.length} carts with non-string exchangeRateUsed.`);

  for (const cart of carts) {
    const stringRate = String(cart.exchangeRateUsed);
    await (prisma as any).cart.update({
      where: { id: cart._id.$oid },
      data: { exchangeRateUsed: stringRate },
    });
    console.log(`Updated Cart ${cart._id.$oid} with rate: ${stringRate}`);
  }

  console.log('Migration completed.');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

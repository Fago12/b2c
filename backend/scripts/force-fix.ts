import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Force migrating Order.exchangeRateUsed to String...');
  try {
    const res1 = await (prisma as any).$runCommandRaw({
      update: 'order',
      updates: [
        {
          q: {},
          u: [
            { $set: { exchangeRateUsed: { $toString: "$exchangeRateUsed" } } }
          ],
          multi: true
        }
      ]
    });
    console.log('Order update result:', JSON.stringify(res1, null, 2));
  } catch (e) {
    console.error('Order update failed:', e);
  }

  console.log('Force migrating OrderItem.exchangeRateUsed to String...');
  try {
    const res2 = await (prisma as any).$runCommandRaw({
      update: 'order_item',
      updates: [
        {
          q: {},
          u: [
            { $set: { exchangeRateUsed: { $toString: "$exchangeRateUsed" } } }
          ],
          multi: true
        }
      ]
    });
    console.log('OrderItem update result:', JSON.stringify(res2, null, 2));
  } catch (e) {
    console.error('OrderItem update failed:', e);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

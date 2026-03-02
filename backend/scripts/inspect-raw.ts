import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  const collections = ['order', 'order_item', 'cart'];
  
  for (const coll of collections) {
    console.log(`--- Checking ${coll} for MISSING exchangeRateUsed ---`);
    const result = await (prisma as any).$runCommandRaw({
      aggregate: coll,
      pipeline: [
        { $match: { exchangeRateUsed: { $exists: false } } }
      ],
      cursor: {}
    });

    const docs = result.cursor.firstBatch;
    console.log(`Found ${docs.length} documents in ${coll} missing exchangeRateUsed.`);
    for (const d of docs) {
      console.log(`ID: ${d._id.$oid}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

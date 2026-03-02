
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTypes() {
  console.log('Checking raw field types in Product collection...');
  
  const products = await (prisma as any).$runCommandRaw({
    find: "product",
    filter: {}
  });

  const batch = products.cursor.firstBatch as any[];
  
  for (const product of batch) {
    console.log(`Product: ${product.name}`);
    console.log(`  basePriceUSD: ${product.basePriceUSD} (Type: ${typeof product.basePriceUSD})`);
    if (product.salePriceUSD !== undefined) {
      console.log(`  salePriceUSD: ${product.salePriceUSD} (Type: ${typeof product.salePriceUSD})`);
    }
  }
}

checkTypes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

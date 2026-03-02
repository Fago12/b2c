
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRaw() {
  const result = await (prisma as any).$runCommandRaw({
    find: "product",
    filter: {},
    limit: 5
  });

  console.log('--- RAW MONGODB DOCUMENTS ---');
  console.log(JSON.stringify(result, null, 2));
}

checkRaw()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

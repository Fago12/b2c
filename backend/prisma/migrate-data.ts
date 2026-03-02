import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating product prices via raw MongoDB command...');

  const result = await (prisma as any).$runCommandRaw({
    update: "product",
    updates: [
      {
        q: { basePrice: { $exists: false } },
        u: [ { $set: { basePrice: "$price" } } ],
        multi: true
      }
    ]
  });

  console.log('Migration result:', JSON.stringify(result));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

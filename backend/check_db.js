const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const heroes = await prisma.heroSection.findMany({ orderBy: { updatedAt: 'desc' } });
  const promos = await prisma.promoBanner.findMany({ orderBy: { updatedAt: 'desc' } });
  
  console.log('--- Latest Heroes ---');
  console.log(JSON.stringify(heroes, null, 2));
  
  console.log('\n--- Latest Promos ---');
  console.log(JSON.stringify(promos, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

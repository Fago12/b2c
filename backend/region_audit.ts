
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('--- REGION DATA AUDIT ---');
    const regions = await prisma.region.findMany();
    console.log(`Found ${regions.length} regions.`);
    for (const r of regions) {
        console.log(`Code: ${r.code}, Name: ${r.name}, Currency: ${r.currency}`);
    }

  } catch (error) {
    console.error('Error during audit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();


import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('--- EXCHANGE RATE DATA AUDIT ---');
    const rates = await prisma.exchangeRate.findMany();
    console.log(`Found ${rates.length} rates.`);
    
    for (const r of rates) {
        console.log(`Currency: ${r.currency}, Rate: ${r.rate}, Type: ${typeof r.rate}`);
    }

  } catch (error) {
    console.error('Error during diagnostic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

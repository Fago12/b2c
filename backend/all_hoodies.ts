
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('--- ALL HOODIE PRODUCTS ---');
    const products = await prisma.product.findMany({
        where: { name: { contains: 'Hoodie', mode: 'insensitive' } }
    });
    
    for (const p of products) {
        console.log(`ID: ${p.id}, Name: ${p.name}, BasePriceUSD: ${p.basePriceUSD}`);
    }

  } catch (error) {
    console.error('Error during audit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

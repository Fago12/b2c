const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listSlugs() {
  console.log('--- Product Slug List ---');
  
  try {
    const products = await prisma.product.findMany({
        select: { name: true, slug: true, id: true }
    });
    
    products.forEach(p => {
        console.log(`[${p.id}] ${p.name} -> ${p.slug}`);
    });
  } catch (error) {
    console.error('❌ List Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listSlugs();

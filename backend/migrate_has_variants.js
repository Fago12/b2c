const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting migration to set hasVariants...');
  
  const products = await prisma.product.findMany();
  let updatedCount = 0;

  for (const product of products) {
    const variants = product.variants || [];
    const hasVariants = Array.isArray(variants) && variants.length > 0;
    
    // Use raw update to bypass Prisma client's old type definition if needed,
    // though findMany already returned the object.
    await prisma.product.update({
      where: { id: product.id },
      data: { hasVariants }
    });
    
    updatedCount++;
    if (updatedCount % 10 === 0) console.log(`Processed ${updatedCount} products...`);
  }

  console.log(`Migration complete. Updated ${updatedCount} products.`);
}

migrate()
  .catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

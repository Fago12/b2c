const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function healStock() {
  console.log('--- Inventory Synchronization (Data Healing) ---');
  
  try {
    const products = await prisma.product.findMany();
    console.log(`Auditing ${products.length} products...`);
    
    let healed = 0;
    
    for (const product of products) {
      const variants = Array.isArray(product.variants) ? product.variants : [];
      const actuallyHasVariants = variants.length > 0;
      
      // RULE: If product has variants, base stock MUST be 0.
      if (actuallyHasVariants || product.hasVariants) {
        if (product.stock !== 0 || !product.hasVariants) {
          console.log(`[VARIANT PRODUCT] Healing: ${product.name}`);
          console.log(`  Current: stock=${product.stock}, hasVariants=${product.hasVariants}`);
          
          await prisma.product.update({
            where: { id: product.id },
            data: { 
              stock: 0,
              hasVariants: true
            }
          });
          
          console.log(`  Fixed: stock=0, hasVariants=true`);
          healed++;
        }
      } else {
        // Simple product: ensure hasVariants is false
        if (product.hasVariants) {
          console.log(`[SIMPLE PRODUCT] Healing: ${product.name}`);
          await prisma.product.update({
            where: { id: product.id },
            data: { hasVariants: false }
          });
          healed++;
        }
      }
    }
    
    console.log(`---------------------------`);
    console.log(`Healing complete. ${healed} products updated.`);
  } catch (error) {
    console.error('❌ Healing Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

healStock();

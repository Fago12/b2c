const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('--- Final Inventory Verification ---');
  
  try {
    const products = await prisma.product.findMany();
    
    let allValid = true;
    for (const product of products) {
      const variants = Array.isArray(product.variants) ? product.variants : [];
      const hasVariants = product.hasVariants || variants.length > 0;
      
      console.log(`Product: ${product.name}`);
      console.log(`  hasVariants: ${product.hasVariants}`);
      console.log(`  stock: ${product.stock}`);
      console.log(`  variants count: ${variants.length}`);
      
      if (hasVariants && product.stock !== 0) {
        console.log(`  ❌ INVALID: Variant product has non-zero base stock.`);
        allValid = false;
      }
      if (!hasVariants && product.hasVariants) {
         console.log(`  ❌ INVALID: Simple product marked as having variants.`);
         allValid = false;
      }
    }
    
    if (allValid) {
      console.log('\n✅ VERIFICATION SUCCESS: All products follow the "One Inventory Owner" rule.');
    } else {
      console.log('\n❌ VERIFICATION FAILED: Inconsistencies found.');
    }
  } catch (error) {
    console.error('❌ Verification Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();

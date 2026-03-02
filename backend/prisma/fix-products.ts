
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Assume legacy prices were in NGN and we want to convert to USD base
// Current NGN rate in system is 1500
const NGN_RATE = 1500;

async function migrate() {
  console.log('Starting FIXED migration: basePrice (NGN) -> basePriceUSD (USD)');
  
  // Use raw command to get all fields including legacy ones
  const products = await (prisma as any).$runCommandRaw({
    find: "product",
    filter: {}
  });

  const batch = products.cursor.firstBatch as any[];
  console.log(`Found ${batch.length} products to check.`);
  
  let updatedCount = 0;
  for (const product of batch) {
    const legacyBase = product.basePrice || product.price || 0;
    const legacySale = product.salePrice || 0;
    
    // Check if we need to update (if basePriceUSD is 0 or missing)
    if (!product.basePriceUSD || product.basePriceUSD === 0) {
      const id = product._id?.$oid || product.id;
      
      // Conversion logic: 
      // If legacy price is > 500, it's likely NGN. Divide by 1500.
      // Otherwise, assume it might already be USD or cents.
      let newBase = legacyBase;
      let newSale = legacySale > 0 ? legacySale : null;

      if (legacyBase > 500) {
        newBase = Math.round(legacyBase / NGN_RATE * 100) / 100; // Round to 2 decimals
        if (newSale) {
            newSale = Math.round(newSale / NGN_RATE * 100) / 100;
        }
      }

      console.log(`Updating ${product.name}: ${legacyBase} NGN -> $${newBase}`);

      await prisma.product.update({
        where: { id: id },
        data: {
          basePriceUSD: newBase,
          salePriceUSD: newSale > 0 ? newSale : null
        } as any
      });
      updatedCount++;
    }
  }
  
  console.log(`Migration completed. Updated ${updatedCount} products.`);
}

migrate()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

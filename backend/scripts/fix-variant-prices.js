const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function healData() {
  console.log('--- Canonical Price Healing Script ---');
  
  try {
    const products = await prisma.product.findMany();
    let healedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      const updateData = {};

      // 1. Heal Variant Sale Prices
      if (product.variants && Array.isArray(product.variants)) {
        const healedVariants = product.variants.map(v => {
          let variantChanged = false;
          const newV = { ...v };

          // If salePriceUSD is small (e.g. 4.35) and not null, it's likely corrupted
          // Prices > 0 and < 100 are targets (Assuming no canonical price is < $1.00 for target products)
          if (v.salePriceUSD != null && v.salePriceUSD > 0 && v.salePriceUSD < 100) {
            console.log(`[Variant] Healing salePriceUSD for SKU ${v.sku}: ${v.salePriceUSD} -> ${Math.round(v.salePriceUSD * 100)}`);
            newV.salePriceUSD = Math.round(v.salePriceUSD * 100);
            variantChanged = true;
          }

          if (variantChanged) needsUpdate = true;
          return newV;
        });

        if (needsUpdate) {
          updateData.variants = healedVariants;
        }
      }

      // 2. Heal Embroidery Price
      if (product.customizationOptions && typeof product.customizationOptions === 'object') {
        const co = { ...product.customizationOptions };
        if (co.embroidery && co.embroidery.price != null && co.embroidery.price > 0 && co.embroidery.price < 100) {
          console.log(`[Embroidery] Healing price for Product ${product.name}: ${co.embroidery.price} -> ${Math.round(co.embroidery.price * 100)}`);
          co.embroidery.price = Math.round(co.embroidery.price * 100);
          updateData.customizationOptions = co;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: updateData
        });
        healedCount++;
        console.log(`✅ Updated Product: ${product.name}`);
      }
    }

    console.log(`\n--- Healing Complete. Total Products Fixed: ${healedCount} ---`);
  } catch (error) {
    console.error('❌ Healing Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

healData();

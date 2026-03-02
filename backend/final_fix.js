const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  console.log('--- STARTING FINAL FIX ---');

  // 1. Set NGN Rate to "1500" (String)
  try {
    const rate = await prisma.exchangeRate.upsert({
      where: { currency: 'NGN' },
      update: { rate: "1500", updatedAt: new Date() },
      create: { currency: 'NGN', rate: "1500", isActive: true }
    });
    console.log('NGN Rate set to:', rate.rate);
  } catch (err) {
    console.error('Error setting NGN rate:', err.message);
  }

  // 2. Heal Variants for Better Inheritance
  const products = await prisma.product.findMany();
  let healedCount = 0;

  for (const p of products) {
    if (!p.variants || !Array.isArray(p.variants)) continue;

    let changed = false;
    const newVariants = p.variants.map(v => {
      // If variant has an explicit price that matches the base product's base price
      // AND a sale is active, we clear it to enable inheritance.
      // We also catch cases where price might be saved as a string or number.
      const vPrice = Number(v.priceUSD);
      const bPrice = Number(p.basePriceUSD);
      
      if (vPrice === bPrice && p.salePriceUSD != null) {
        console.log(`[HEAL] Product: ${p.slug} | Variant: ${v.sku} | ${vPrice} -> Inherit (Sale: ${p.salePriceUSD})`);
        changed = true;
        healedCount++;
        return { ...v, priceUSD: null }; // Set to null for inheritance
      }
      return v;
    });

    if (changed) {
      await prisma.product.update({
        where: { id: p.id },
        data: { variants: newVariants }
      });
    }
  }

  console.log(`\nHealed ${healedCount} variants for better inheritance.`);
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

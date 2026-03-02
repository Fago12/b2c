const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function heal() {
  const products = await prisma.product.findMany();
  let healedCount = 0;

  for (const p of products) {
    if (!p.variants || !Array.isArray(p.variants)) continue;

    let changed = false;
    const newVariants = p.variants.map(v => {
      // 1. Detect corrupted prices (cent variants that look like dollars, but saved too small)
      // If priceUSD is < 50 (e.g. 5 or 0.05), it's likely a cent value that was treated as dollars
      // and saved as cents (5) or double-normalized (0.05).
      if (v.priceUSD > 0 && v.priceUSD < 50) {
         const oldPrice = v.priceUSD;
         // Healer Rule: If it's small, multiply by 100
         // 5 -> 500 ($5)
         // 0.05 -> 5 (intermediate) -> 500 ($5)
         // We'll be conservative: if it's < 50, we multiply until its in a reasonable range or just assume it's cents
         // Most products in this store are $1-$100 (100-10000 cents).
         
         let healedPrice = oldPrice;
         if (healedPrice < 1) healedPrice *= 100; // 0.05 -> 5
         if (healedPrice < 50) healedPrice *= 100; // 5 -> 500
         
         console.log(`[HEAL] Product: ${p.slug} | Variant: ${v.sku} | ${oldPrice} -> ${healedPrice}`);
         changed = true;
         healedCount++;
         return { ...v, priceUSD: healedPrice };
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

  console.log(`\nHealed ${healedCount} variants.`);
}

heal()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

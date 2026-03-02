const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function heal() {
  const products = await prisma.product.findMany({
    where: {
      variants: { not: [] }
    }
  });

  console.log(`Checking ${products.length} products for low variant prices...`);

  for (const p of products) {
    let updated = false;
    const variants = (p.variants || []).map(v => {
      // If priceUSD is less than 100 but greater than 0, it's almost certainly cents-mistreated-as-dollars
      // e.g. "5" intended as $5, but should be "500"
      if (v.priceUSD != null && v.priceUSD < 100 && v.priceUSD > 0) {
        console.log(`[HEAL] Product "${p.name}" - Variant ${v.sku}: ${v.priceUSD} -> ${v.priceUSD * 100}`);
        v.priceUSD = v.priceUSD * 100;
        updated = true;
      }
      return v;
    });

    if (updated) {
      await prisma.product.update({
        where: { id: p.id },
        data: { variants }
      });
      console.log(`[SUCCESS] Updated product "${p.name}"`);
    }
  }
}

heal()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

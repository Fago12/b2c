const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
  const products = await prisma.product.findMany({
    where: {
      variants: { not: [] }
    }
  });

  console.log(`Auditing ${products.length} products with variants...`);

  products.forEach(p => {
    const variants = p.variants || [];
    const options = p.options || {};
    const optionKeys = Object.keys(options);

    if (optionKeys.length === 0 && variants.length > 0) {
      console.warn(`[WARNING] Product "${p.name}" (${p.id}) has variants but NO level options defined.`);
    }

    variants.forEach((v, i) => {
      if (!v.sku && !v.id) {
        console.error(`[ERROR] Product "${p.name}" variant ${i} has NO SKU or ID.`);
      }

      if (v.priceUSD && v.priceUSD < 100 && v.priceUSD > 0) {
         console.warn(`[WARNING] Product "${p.name}" variant ${v.sku || i} has low priceUSD: ${v.priceUSD}. (Possibly cents instead of dollars, or missing conversion)`);
      }

      const variantOptionKeys = Object.keys(v.options || {});
      const missingKeys = optionKeys.filter(k => !variantOptionKeys.includes(k));
      if (missingKeys.length > 0) {
         console.error(`[ERROR] Product "${p.name}" variant ${v.sku || i} is missing options: ${missingKeys.join(', ')}`);
      }
    });
  });
}

audit()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

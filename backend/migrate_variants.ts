import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      hasVariants: true,
      variants: { none: {} } // Products with no new-style variants
    }
  });

  console.log(`Found ${products.length} products to migrate.`);

  for (const product of products) {
    const legacyVariants = (product as any).legacyVariants;
    if (!Array.isArray(legacyVariants) || legacyVariants.length === 0) continue;

    console.log(`Migrating ${product.name}...`);

    for (const lv of legacyVariants) {
      // Find or create Color/Pattern if they exist in legacy options
      let colorId: string | undefined;
      let patternId: string | undefined;

      if (lv.options?.Color) {
        let color = await prisma.color.findFirst({ where: { name: lv.options.Color } });
        if (!color) {
          color = await prisma.color.create({ data: { name: lv.options.Color, hexCode: '#000000' } });
        }
        colorId = color.id;
      }

      if (lv.options?.Pattern) {
        let pattern = await prisma.pattern.findFirst({ where: { name: lv.options.Pattern } });
        if (!pattern) {
          pattern = await prisma.pattern.create({ data: { name: lv.options.Pattern, previewImageUrl: '' } });
        }
        patternId = pattern.id;
      }

      await (prisma.variant as any).create({
        data: {
          productId: product.id,
          sku: lv.sku || `${product.name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
          stock: lv.stock || 0,
          priceUSD_cents: lv.priceUSD ? Math.round(lv.priceUSD * 100) : null,
          salePriceUSD_cents: lv.salePriceUSD ? Math.round(lv.salePriceUSD * 100) : null,
          size: lv.options?.Size,
          colorId,
          patternId,
        }
      });
    }
    console.log(`Migrated ${product.name}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

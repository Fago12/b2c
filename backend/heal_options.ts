import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function healOptions() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          include: {
            color: true,
            pattern: true
          }
        }
      }
    });

    console.log(`Checking ${products.length} products...`);

    for (const product of products) {
      for (const variant of product.variants) {
        // If options is missing or empty, heal it
        const currentOptions = (variant.options as any) || {};
        if (Object.keys(currentOptions).length === 0) {
          const newOptions: Record<string, string> = {};
          
          if (variant.color) newOptions["Color"] = variant.color.name;
          if (variant.pattern) newOptions["Pattern"] = variant.pattern.name;
          if (variant.size) newOptions["Size"] = variant.size;

          if (Object.keys(newOptions).length > 0) {
            console.log(`Healing Variant ${variant.sku}: Options -> ${JSON.stringify(newOptions)}`);
            await prisma.variant.update({
              where: { id: variant.id },
              data: { options: newOptions }
            });
          }
        }
      }
    }
    console.log("Healing complete!");
  } catch (e) {
    console.error("Healing failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

healOptions();

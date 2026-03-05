import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function healMarkers() {
  try {
    console.log("Starting marker cleanup...");

    // 1. Clean up Patterns
    const patterns = await prisma.pattern.findMany({
      where: {
        previewImageUrl: { contains: '__' }
      }
    });

    console.log(`Found ${patterns.length} patterns with markers. Cleaning...`);
    for (const p of patterns) {
      console.log(`Cleaning Pattern: ${p.name}`);
      await prisma.pattern.update({
        where: { id: p.id },
        data: { previewImageUrl: "" } // Reset to empty string
      });
    }

    // 2. Clean up Variants (which might have cached markers in their metadata)
    const products = await prisma.product.findMany({
        include: {
            variants: true
        }
    });

    console.log(`Checking ${products.length} products for variants with cached markers...`);
    for (const prod of products) {
        for (const v of prod.variants) {
            let changed = false;
            const patternMeta = (v as any).pattern;
            
            if (patternMeta && patternMeta.previewImageUrl && patternMeta.previewImageUrl.includes('__')) {
                console.log(`Cleaning Variant Marker: ${v.sku}`);
                (v as any).pattern.previewImageUrl = "";
                changed = true;
            }

            if (v.imageUrl && v.imageUrl.includes('__')) {
                console.log(`Cleaning Variant Main Image Marker: ${v.sku}`);
                (v as any).imageUrl = "";
                changed = true;
            }

            // Also check the 'options' JSON if it's being used as source of truth for some code
            const options = (v as any).options;
            if (options && typeof options === 'object') {
                // Potential marker in options? Usually not as it stores { Color: "Red" }, 
                // but let's be safe if any code puts URLs there.
            }

            if (changed) {
                await prisma.variant.update({
                    where: { id: v.id },
                    data: {
                        imageUrl: (v as any).imageUrl,
                        // Update the embedded pattern object if exists
                        // Note: Variant model in schema.prisma has patternId, 
                        // but sometimes we store snapshots in a field called 'pattern'.
                        // Looking at the schema, it's just patternId. 
                        // However, the healing script needs to match the structure used in updateProduct.
                    } as any
                });
            }
        }
    }

    console.log("Cleanup complete!");
  } catch (err) {
    console.error("Cleanup failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

healMarkers();

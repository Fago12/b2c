import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductColors() {
  const product = await prisma.product.findFirst({
    where: { name: { contains: 'Napkin', mode: 'insensitive' } },
    include: {
      variants: {
        include: {
          color: true,
          pattern: true
        }
      }
    }
  });

  if (!product) {
    console.log("Product not found");
    return;
  }

  console.log("Product:", product.name);
  console.log("Variants count:", product.variants.length);
  
  product.variants.forEach((v, i) => {
    console.log(`Variant ${i}: SKU=${v.sku}, Color=${v.color?.name}, Hex=${v.color?.hexCode}, ID=${v.colorId}`);
  });
  
  await prisma.$disconnect();
}

checkProductColors();

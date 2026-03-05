import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deepCheck() {
  const product = await prisma.product.findFirst({
    where: { name: { contains: 'Napkin', mode: 'insensitive' } },
    include: {
      variants: {
        include: {
          color: true
        }
      }
    }
  });

  if (!product) {
    console.log("Product not found");
    return;
  }

  console.log("Product:", product.name);
  console.log("Has Variants:", product.hasVariants);
  
  for (const v of product.variants) {
    console.log(`Variant ID=${v.id} SKU=${v.sku}`);
    console.log(`  Color ID linked in Variant: ${v.colorId}`);
    if (v.color) {
        console.log(`  Linked Color Record: ID=${v.color.id}, Name=${v.color.name}, Hex=${v.color.hexCode}`);
    } else {
        console.log(`  Linked Color Record: NONE`);
    }
  }

  await prisma.$disconnect();
}

deepCheck();

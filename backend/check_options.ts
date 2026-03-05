import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOptions() {
  const product = await prisma.product.findFirst({
    where: { name: { contains: 'Napkin', mode: 'insensitive' } },
    include: {
      variants: true
    }
  });

  if (!product) {
    console.log("Product not found");
    return;
  }

  console.log("Product:", product.name);
  
  product.variants.forEach((v, i) => {
    console.log(`Variant ${i}: SKU=${v.sku}, Options=${JSON.stringify(v.options)}`);
  });
  
  await prisma.$disconnect();
}

checkOptions();

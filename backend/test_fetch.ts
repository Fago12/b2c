import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFetch() {
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

  console.log("FETCH RESULT:");
  product.variants.forEach((v, i) => {
    console.log(`Variant ${i}: Color=${v.color?.name}, Hex=${v.color?.hexCode}`);
  });
  
  await prisma.$disconnect();
}

testFetch();

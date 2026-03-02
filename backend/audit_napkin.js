const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const p = await prisma.product.findFirst({
      where: { slug: { contains: 'napkin' } },
      select: {
        id: true,
        name: true,
        slug: true,
        variants: true,
        options: true,
        isActive: true
      }
    });
    console.log('NAPKIN DATA:');
    console.log(JSON.stringify(p, null, 2));
    
    if (p && p.variants && Array.isArray(p.variants)) {
      console.log('\nVARIANTS COUNT:', p.variants.length);
      p.variants.forEach((v, i) => {
        console.log(`Variant ${i}:`, v.sku, 'ID:', v.id, 'Options Path:', JSON.stringify(v.options));
      });
    } else {
      console.log('\nNO VARIANTS ARRAY FOUND');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulate() {
  const product = await prisma.product.findFirst({
    where: { name: { contains: 'BRA' } }
  });

  if (!product) {
    console.error('Product not found');
    return;
  }

  const variants = product.variants || [];
  const variantId = 'BRA-RED-PLAIN'; // Using SKU as ID

  console.log(`Product: ${product.name}`);
  console.log(`Variants Count: ${variants.length}`);
  console.log(`Target variantId: ${variantId}`);

  // Simulate CartService logic
  if (variantId && variants.length > 0) {
    const variant = variants.find(v => v.id === variantId || v.sku === variantId);
    if (variant) {
      console.log(`SUCCESS: Found variant ${variant.sku}`);
      console.log(`Variant PriceUSD: ${variant.priceUSD}`);
      console.log(`Variant Stock: ${variant.stock}`);
    } else {
      console.log('FAIL: Requested variant not found');
    }
  } else if (variants.length > 0) {
    console.log('FAIL: Please select a specific variant');
  } else {
    console.log('SUCCESS: No variants, using base product');
  }
}

simulate().finally(() => prisma.$disconnect());

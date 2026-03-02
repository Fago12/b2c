import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up homepage sections and related data...');
  
  // Clear all sections to avoid stale data conflicts
  await prisma.homepageSection.deleteMany({});
  await prisma.heroSection.deleteMany({});
  await prisma.marqueeItem.deleteMany({});
  await prisma.featuredCollection.deleteMany({});
  await prisma.announcement.deleteMany({});

  console.log('Creating fresh Hero Section...');
  const hero = await prisma.heroSection.create({
    data: {
      id: 'fresh-hero-id',
      title: 'Woven Kulture',
      subtitle: 'Redefining Elegance with Every Thread',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
      ctaText: 'Explore Collection',
      ctaLink: '/shop',
      isActive: true
    }
  });

  console.log('Creating fresh Marquee Items...');
  const marquee = await prisma.marqueeItem.create({
    data: {
      id: 'fresh-marquee-id',
      text: 'FREE SHIPPING ON ORDERS OVER $500 • WORLDWIDE DELIVERY • LUXURY PACKAGING INCLUDED • ',
      order: 0,
      isActive: true
    }
  });

  // 4. Create a Category and some Products if none exist
  let category = await prisma.category.findFirst();
  if (!category) {
    category = await (prisma as any).category.create({
      data: {
        name: 'Signature Collection',
        slug: 'signature',
        description: 'Our most iconic pieces.',
        isActive: true
      }
    });
  }

  if (!category) {
    throw new Error('Could not create or find category');
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await (prisma as any).product.createMany({
      data: [
        {
          name: 'The Artisan Caftan',
          slug: 'artisan-caftan',
          description: 'Hand-woven luxury caftan.',
          basePrice: 120000,
          stock: 10,
          images: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop'],
          categoryId: category.id,
          isActive: true
        },
        {
          name: 'Midnight Tunic',
          slug: 'midnight-tunic',
          description: 'Deep navy hand-tailored tunic.',
          basePrice: 85000,
          stock: 5,
          images: ['https://images.unsplash.com/photo-1550614000-4895a10e1bfd?q=80&w=1974&auto=format&fit=crop'],
          categoryId: category.id,
          isActive: true
        }
      ]
    });
  }

  const products = await prisma.product.findMany({ take: 2 });

  // 5. Create Featured Collection
  const collection = await prisma.featuredCollection.create({
    data: {
      title: 'The Signature Series',
      description: 'Discover our most coveted pieces.',
      productIds: products.map(p => p.id),
      isActive: true
    }
  });

  console.log('Linking to HomepageSection...');
  // HERO
  await prisma.homepageSection.create({
    data: { id: '65ccae9b7c11f4a000000010', type: 'HERO', referenceId: hero.id, order: 0, isActive: true }
  });

  // MARQUEE
  await prisma.homepageSection.create({
    data: { id: '65ccae9b7c11f4a000000011', type: 'MARQUEE', referenceId: marquee.id, order: 1, isActive: true }
  });

  // FEATURED
  await prisma.homepageSection.create({
    data: { id: '65ccae9b7c11f4a000000012', type: 'FEATURED', referenceId: collection.id, order: 2, isActive: true }
  });

  // NEW ARRIVALS (no referenceId needed)
  await prisma.homepageSection.create({
    data: { id: '65ccae9b7c11f4a000000013', type: 'NEW_ARRIVALS', order: 3, isActive: true }
  });

  // MOST POPULAR (no referenceId needed)
  await (prisma as any).homepageSection.create({
    data: { id: '65ccae9b7c11f4a000000014', type: 'MOST_POPULAR', order: 4, isActive: true }
  });

  // Add an announcement as well
  await prisma.announcement.create({
    data: {
      message: "LIMITED EDITION COLLECTION DROPPING SOON",
      ctaText: "NOTIFY ME",
      ctaLink: "/newsletter",
      backgroundColor: "#480100",
      textColor: "#E6DED3",
      isActive: true
    }
  });

  console.log('Clean re-seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Seeding Homepage Sections...');

  // 1. Hero Section
  const hero = await prisma.heroSection.create({
    data: {
      title: 'Heritage in Every Thread',
      subtitle: 'Discover our new collection of hand-woven masterpieces.',
      imageUrl: 'https://images.unsplash.com/photo-1590736962030-cf178f69f20e?q=80&w=2000&auto=format&fit=crop',
      ctaText: 'Shop Collection',
      ctaLink: '/shop',
    }
  });

  await prisma.homepageSection.create({
    data: {
      type: 'HERO',
      referenceId: hero.id,
      order: 1,
    }
  });

  // 2. Marquee
  const marquee1 = await prisma.marqueeItem.create({ data: { text: 'Traditional Craftsmanship', order: 1 } });
  const marquee2 = await prisma.marqueeItem.create({ data: { text: 'Sustainable Practices', order: 2 } });
  const marquee3 = await prisma.marqueeItem.create({ data: { text: 'Hand-Woven with Heart', order: 3 } });

  await prisma.homepageSection.create({
    data: {
      type: 'MARQUEE',
      order: 2,
    }
  });

  // 3. Featured Collection (using first category)
  const category = await prisma.category.findFirst();
  if (category) {
    const featured = await prisma.featuredCollection.create({
        data: {
            title: 'The Artisanal Series',
            description: 'A curated selection of our finest work.',
            productIds: [], // Will fetch from category anyway
        }
    });

    await prisma.homepageSection.create({
        data: {
            type: 'FEATURED',
            referenceId: featured.id,
            order: 3,
        }
    });
  }

  // 4. Products (New Arrivals)
  await prisma.homepageSection.create({
    data: {
      type: 'NEW_ARRIVALS',
      order: 4,
    }
  });

  console.log('Homepage seeding completed.');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

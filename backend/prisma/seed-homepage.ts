import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding homepage sections correctly with 24-char hex ObjectIds...');

  // 1. Create Hero Section data
  const hero = await prisma.heroSection.upsert({
    where: { id: 'default-hero-data' },
    update: {},
    create: {
      id: 'default-hero-data',
      title: 'Woven Kulture',
      subtitle: 'Redefining Elegance with Every Thread',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
      ctaText: 'Explore Collection',
      ctaLink: '/shop',
      isActive: true
    }
  });

  // 2. Create Marquee Item data
  const marquee = await prisma.marqueeItem.upsert({
    where: { id: 'default-marquee-data' },
    update: {},
    create: {
      id: 'default-marquee-data',
      text: 'FREE SHIPPING ON ORDERS OVER $500 • WORLDWIDE DELIVERY • LUXURY PACKAGING INCLUDED • ',
      order: 0,
      isActive: true
    }
  });

  // 3. Create HomepageSection links (IDs must be EXACTLY 24-char hex)
  // 65ccae9b7c11f4a000000001 (24 chars)
  await prisma.homepageSection.upsert({
    where: { id: '65ccae9b7c11f4a000000001' },
    update: { referenceId: hero.id },
    create: {
      id: '65ccae9b7c11f4a000000001',
      type: 'HERO',
      referenceId: hero.id,
      order: 0,
      isActive: true
    }
  });

  await prisma.homepageSection.upsert({
    where: { id: '65ccae9b7c11f4a000000002' },
    update: { referenceId: marquee.id },
    create: {
      id: '65ccae9b7c11f4a000000002',
      type: 'MARQUEE',
      referenceId: marquee.id,
      order: 1,
      isActive: true
    }
  });

  console.log('Homepage seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

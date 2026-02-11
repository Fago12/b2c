const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Manually load .env
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error('Failed to load .env', e);
}

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
});

async function main() {
  console.log('Checking and Seeding Homepage Content...');
  
  try {
    // 1. Create a Category if not exists
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Essence',
          slug: 'essence',
          description: 'Timeless essentials for every wardrobe.'
        }
      });
      console.log('Created Category');
    }

    // 2. Create some products if not exists
    let productsCount = await prisma.product.count();
    if (productsCount === 0) {
      const product1 = await prisma.product.create({
        data: {
          name: 'Classic White Tee',
          description: 'A premium cotton white t-shirt.',
          price: 25000,
          stock: 100,
          isActive: true,
          images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'],
          categoryId: category.id,
          slug: 'classic-white-tee',
          tags: ['essentials', 'men', 'women']
        }
      });
      const product2 = await prisma.product.create({
        data: {
          name: 'Signature Denim Jacket',
          description: 'Durable denim jacket with a vintage wash.',
          price: 85000,
          stock: 50,
          isActive: true,
          images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=800'],
          categoryId: category.id,
          slug: 'signature-denim-jacket',
          tags: ['outerwear', 'unisex']
        }
      });
      console.log('Created Products');
    }

    const allProducts = await prisma.product.findMany({ take: 4 });

    // 3. Create Hero Section
    let hero = await prisma.heroSection.findFirst();
    if (!hero) {
      hero = await prisma.heroSection.create({
        data: {
          title: 'The New Winter Collection',
          subtitle: 'Timeless pieces for the modern individual.',
          imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000',
          ctaText: 'Shop Now',
          ctaLink: '/shop',
          isActive: true
        }
      });
      console.log('Created Hero Section');
    }

    // 4. Create Marquee Items
    let marqueesCount = await prisma.marqueeItem.count();
    if (marqueesCount === 0) {
      await prisma.marqueeItem.createMany({
        data: [
          { text: 'FREE SHIPPING ON ORDERS OVER ₦100,000', order: 1 },
          { text: 'NEW ARRIVALS EVERY WEEK', order: 2 },
          { text: 'LIMITED EDITION RELEASES', order: 3 },
          { text: 'HANDCRAFTED IN LAGOS', order: 4 },
        ]
      });
      console.log('Created Marquee Items');
    }

    // 5. Create Featured Collection
    let featured = await prisma.featuredCollection.findFirst();
    if (!featured) {
      featured = await prisma.featuredCollection.create({
        data: {
          title: 'Most Popular',
          description: 'Our community favorites this month.',
          productIds: allProducts.map(p => p.id),
          isActive: true
        }
      });
      console.log('Created Featured Collection');
    }

    // 6. Create Promo Banners
    let promosCount = await prisma.promoBanner.count();
    if (promosCount === 0) {
      await prisma.promoBanner.createMany({
        data: [
          {
            title: 'Modern Minimalism',
            subtitle: 'Curated for the understated style.',
            imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200',
            ctaText: 'View Collection',
            ctaLink: '/modern-minimalism',
            targetAudience: 'ALL'
          },
          {
            title: 'The Female Form',
            subtitle: 'Elegant silhouettes for everyday wear.',
            imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200',
            ctaText: 'Shop Women',
            ctaLink: '/women',
            targetAudience: 'WOMEN'
          }
        ]
      });
      console.log('Created Promo Banners');
    }

    // 7. Create Announcement
    let announcement = await prisma.announcement.findFirst();
    if (!announcement) {
      announcement = await prisma.announcement.create({
        data: {
          message: 'JOIN THE CLUB FOR 10% OFF YOUR FIRST ORDER',
          ctaText: 'Sign Up',
          ctaLink: '/register',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          isActive: true,
          priority: 10
        }
      });
      console.log('Created Announcement');
    }

    // 8. Finally, Create Homepage Sections (The ordering)
    let sectionsCount = await prisma.homepageSection.count();
    if (sectionsCount === 0) {
      await prisma.homepageSection.createMany({
        data: [
          { type: 'ANNOUNCEMENT', order: 1, isActive: true },
          { type: 'HERO', order: 2, isActive: true, referenceId: hero.id },
          { type: 'MARQUEE', order: 3, isActive: true },
          { type: 'FEATURED', order: 4, isActive: true, referenceId: featured.id },
          { type: 'PROMO', order: 5, isActive: true },
          { type: 'NEW_ARRIVALS', order: 6, isActive: true },
        ]
      });
      console.log('Created Homepage Sections ordering');
    }

    console.log('Success: Seeding complete.');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

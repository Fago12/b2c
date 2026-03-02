const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pages = [
    {
      slug: 'about',
      title: 'About Woven Kulture',
      content: '<h2>Our Story</h2><p>Woven Kulture is a brand dedicated to bringing you the finest handmade goods from around the world. Our mission is to preserve traditional craftsmanship while supporting local artisans and communities.</p>',
      isActive: true,
    },
    {
      slug: 'our-story',
      title: 'Our Story',
      content: '<p>Woven Kulture began with a simple vision: to bridge the gap between ancient heritage and contemporary design. We believe that every thread holds a memory, and every pattern tells a story that deserves to be carried forward.</p><p>Our journey takes us deep into the heart of artisan communities, where we collaborate with master weavers who have preserved their techniques for generations. By combining their skill with modern silhouettes, we create pieces that are both timeless and relevant.</p>',
      isActive: true,
    },
    {
      slug: 'our-craft',
      title: 'Our Craft',
      content: '<p>The art of weaving is a slow, meditative process that requires patience, precision, and a deep respect for the materials. At Woven Kulture, we honor these principles in every step of our production.</p><p>From the careful selection of natural, sustainable fibers to the intricate setting of the loom, our craft is defined by an uncompromising commitment to quality. Each piece is a testament to the human hand—imperfect, unique, and filled with character.</p>',
      isActive: true,
    },
    {
      slug: 'shipping-returns',
      title: 'Shipping & Returns',
      content: '<h2>Shipping</h2><p>We take great care in packaging our artisan pieces to ensure they arrive in perfect condition. Orders are dispatched from our studio within 48 hours.</p><h3>Return Policy</h3><p>If your piece doesn\'t feel quite right, we offer a 30-day return window. Please contact our support team to initiate the process.</p>',
      isActive: true,
    },
    {
      slug: 'faq',
      title: 'Frequently Asked Questions',
      content: '<p>Find answers to common inquiries about our collections, shipping, and sustainable practices. If you can\'t find what you\'re looking for, feel free to reach out.</p>',
      isActive: true,
    },
  ];

  console.log('Seeding CMS pages...');
  for (const page of pages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
    console.log(`Upserted page: ${page.slug}`);
  }

  const galleryItems = [
    {
      type: 'IMAGE',
      url: 'https://images.unsplash.com/photo-1590736962030-cf178f69f20e?q=80&w=1000&auto=format&fit=crop',
      tag: 'CRAFT',
      displayOrder: 1,
    },
    {
      type: 'IMAGE',
      url: 'https://images.unsplash.com/photo-1487309078313-fe80c3e15805?q=80&w=1000&auto=format&fit=crop',
      tag: 'BTS',
      displayOrder: 2,
    },
    {
      type: 'IMAGE',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
      tag: 'CAMPAIGN',
      displayOrder: 3,
    },
    {
      type: 'IMAGE',
      url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1000&auto=format&fit=crop',
      tag: 'COLLECTION',
      displayOrder: 4,
    },
  ];

  console.log('Seeding Gallery items...');
  // Clear existing to avoid duplicates if needed, or just create
  // For brevity in seed, we just create
  for (const item of galleryItems) {
    const existing = await prisma.galleryItem.findFirst({ where: { url: item.url } });
    if (!existing) {
      await prisma.galleryItem.create({ data: item });
      console.log(`Created gallery item: ${item.tag}`);
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

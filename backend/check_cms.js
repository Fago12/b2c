const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.$connect();
    console.log('Connected to Database');
    
    // List collections
    const collections = await prisma.$runCommandRaw({ listCollections: 1 });
    console.log('Collections:', JSON.stringify(collections.cursor.firstBatch.map(c => c.name), null, 2));
    
    // Check if cms_page has data
    const cmsCount = await prisma.cmsPage.count();
    console.log('CMS Page Count:', cmsCount);
    
    if (cmsCount > 0) {
      const cmsPages = await prisma.cmsPage.findMany();
      console.log('CMS Pages:', JSON.stringify(cmsPages, null, 2));
    } else {
        // Try to find if there is ANY collection with "cms" in the name
        const allCollections = collections.cursor.firstBatch.map(c => c.name);
        const cmsLike = allCollections.filter(name => name.toLowerCase().includes('cms'));
        console.log('CMS-like collections:', cmsLike);
        
        for (const coll of cmsLike) {
            try {
                const count = await prisma.$runCommandRaw({ count: coll });
                console.log(`Count for ${coll}:`, count.n);
            } catch (e) {}
        }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();

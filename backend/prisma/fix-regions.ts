
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixRegions() {
  console.log('Populating symbols for regions...');
  
  await prisma.region.updateMany({
    where: { code: 'US' },
    data: { symbol: '$' } as any
  });
  
  await prisma.region.updateMany({
    where: { code: 'NG' },
    data: { symbol: '₦' } as any
  });
  
  await prisma.region.updateMany({
    where: { code: 'GH' },
    data: { symbol: '₵' } as any
  });

  console.log('Symbols updated.');
}

fixRegions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

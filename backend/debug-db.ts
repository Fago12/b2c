import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Debug (Deep Dive) ---');
  
  const now = new Date();
  const feb11 = new Date('2026-02-11T00:00:00Z');
  
  const recentOrders = await prisma.order.findMany({
    where: { createdAt: { gte: feb11 } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, userId: true, createdAt: true, total: true }
  });
  
  console.log(`Orders since Feb 11: ${recentOrders.length}`);
  recentOrders.forEach(o => {
    console.log(`Order ${o.id}: Email=${o.email}, UserID=${o.userId}, Created=${o.createdAt.toISOString()}`);
  });

  const specificUser = await prisma.user.findUnique({
    where: { email: 'ayoyemisola@gmail.com' }
  });
  
  if (specificUser) {
    console.log(`User found: ${specificUser.email}, ID: ${specificUser.id}, Role: ${specificUser.role}`);
    
    const userOrders = await prisma.order.findMany({
      where: { userId: specificUser.id },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Directly linked orders for UserID ${specificUser.id}: ${userOrders.length}`);
    userOrders.forEach(o => console.log(` - Order ${o.id}, Created: ${o.createdAt.toISOString()}`));

    const emailOrders = await prisma.order.findMany({
      where: { email: specificUser.email, userId: null },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Unlinked Guest orders for Email ${specificUser.email}: ${emailOrders.length}`);
    emailOrders.forEach(o => console.log(` - Order ${o.id}, Created: ${o.createdAt.toISOString()}`));
  } else {
    console.log('User ayoyemisola@gmail.com NOT FOUND');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

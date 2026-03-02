import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Email Variation Check ---');
  
  const emails = ['ayoyemisola@gmail.com', 'ayoyemishola@gmail.com'];
  
  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    console.log(`User [${email}]: ${user ? 'EXISTS (ID: ' + user.id + ', Role: ' + user.role + ')' : 'MISSING'}`);
    
    const orderCount = await prisma.order.count({ where: { email } });
    console.log(`Orders with Email [${email}]: ${orderCount}`);
    
    if (user) {
        const linkedOrders = await prisma.order.count({ where: { userId: user.id } });
        console.log(`Orders linked to UserID [${user.id}]: ${linkedOrders}`);
    }
  }

  const allRecent = await prisma.order.findMany({
    where: { createdAt: { gte: new Date('2026-02-11') } },
    select: { email: true, createdAt: true, userId: true }
  });
  console.log('Recent Orders (Email & UserID):');
  allRecent.forEach(o => console.log(` - ${o.email} (User: ${o.userId}) at ${o.createdAt.toISOString()}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

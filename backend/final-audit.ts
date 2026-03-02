import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Final Security & Integrity Audit ---');
  
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true }
  });
  console.log('Final User Table:');
  users.forEach(u => console.log(` - ${u.email} | Role: ${u.role} | ID: ${u.id}`));

  const targetEmail = 'ayoyemisola@gmail.com';
  const orders = await prisma.order.findMany({
    where: { email: targetEmail },
    select: { id: true, userId: true, createdAt: true }
  });
  
  console.log(`\nOrders for ${targetEmail}: ${orders.length}`);
  const userIds = new Set(orders.map(o => o.userId));
  console.log(`Linked to ${userIds.size} unique UserID(s): ${Array.from(userIds).join(', ')}`);
}

main().finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Order Relinking Service ---');
  
  const targetEmail = 'ayoyemisola@gmail.com';
  
  // 1. Identify the correct UserID (the one with 'user' role)
  const users = await prisma.user.findMany({
    where: { email: targetEmail },
    orderBy: { createdAt: 'desc' }
  });

  if (users.length === 0) {
    console.error(`Error: No user found with email ${targetEmail}`);
    return;
  }

  // PljscxJALYyaXfdfWt2u3LNszDKnraQM is the one we want to keep (role: user)
  const targetUser = users.find(u => u.role === 'user') || users[0];
  console.log(`Targeting User ID: ${targetUser.id} (${targetUser.email}, role: ${targetUser.role})`);

  // 2. Find all orders with this email that are NOT linked to this UserID
  const mislinkedOrders = await prisma.order.findMany({
    where: {
      email: targetEmail,
      userId: { not: targetUser.id }
    }
  });

  console.log(`Found ${mislinkedOrders.length} mis-linked orders.`);

  if (mislinkedOrders.length > 0) {
    const ids = mislinkedOrders.map(o => o.id);
    console.log(`Relinking Order IDs: ${ids.join(', ')}`);

    const result = await prisma.order.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        userId: targetUser.id
      }
    });

    console.log(`Successfully updated ${result.count} orders.`);
  }

  console.log('--- Verification ---');
  const finalCount = await prisma.order.count({
    where: { userId: targetUser.id }
  });
  console.log(`Total orders now linked to User ID ${targetUser.id}: ${finalCount}`);
  
  console.log('--- Relinking Service Complete ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

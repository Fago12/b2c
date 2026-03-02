import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- User Merger Strategy ---');
  
  const email = 'ayoyemisola@gmail.com';
  const users = await prisma.user.findMany({
    where: { email },
    orderBy: { createdAt: 'desc' } // Newest first (likely the one from Better Auth)
  });

  if (users.length < 2) {
    console.log(`Only ${users.length} user(s) found for ${email}. No merge needed.`);
    return;
  }

  const primaryUser = users[0]; // Newest
  const secondaryUsers = users.slice(1);

  console.log(`Merging into Primary User ID: ${primaryUser.id} (Created: ${primaryUser.createdAt.toISOString()})`);

  for (const user of secondaryUsers) {
    console.log(`Merging Secondary User ID: ${user.id} (Created: ${user.createdAt.toISOString()})`);
    
    // 1. Update Orders
    const ordersUpdated = await prisma.order.updateMany({
      where: { userId: user.id },
      data: { userId: primaryUser.id }
    });
    console.log(` - Updated ${ordersUpdated.count} orders`);

    // 2. Update Reviews
    const reviewsUpdated = await prisma.review.updateMany({
      where: { userId: user.id },
      data: { userId: primaryUser.id }
    });
    console.log(` - Updated ${reviewsUpdated.count} reviews`);
    
    // 3. Delete secondary User
    // Note: This might fail if there are other relations (Sessions, Accounts) not handled.
    // Better Auth might have Sessions/Accounts linked.
    
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.account.deleteMany({ where: { userId: user.id } });
    
    await prisma.user.delete({ where: { id: user.id } });
    console.log(` - Deleted User ID: ${user.id}`);
  }

  // Ensure role is correct for analytics ('user' is what Better Auth uses locally, but we might want to normalize)
  // Actually, 'user' is fine as long as AnalyticsService looks for it.
  
  console.log('--- Merge Complete ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

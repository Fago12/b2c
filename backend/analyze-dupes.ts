import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- User De-duplication Analysis ---');
  
  const allUsers = await prisma.user.findMany();
  const emailMap = new Map<string, any[]>();
  
  allUsers.forEach(u => {
    const list = emailMap.get(u.email) || [];
    list.push(u);
    emailMap.set(u.email, list);
  });
  
  for (const [email, users] of emailMap.entries()) {
    if (users.length > 1) {
      console.log(`Duplicate Email Found: [${email}] (${users.length} users)`);
      users.forEach(u => {
        console.log(` - ID: ${u.id}, Role: ${u.role}, CreatedAt: ${u.createdAt.toISOString()}`);
      });
    }
  }

  // Check role casing for analytics
  const roles = await prisma.user.groupBy({
    by: ['role'],
    _count: { _all: true }
  });
  console.log('Roles in DB:', JSON.stringify(roles));
}

main().finally(() => prisma.$disconnect());

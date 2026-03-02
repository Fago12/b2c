import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const u1 = await prisma.user.findUnique({ where: { id: 'PljscxJALYyaXfdfWt2u3LNszDKnraQM' } });
  const u2 = await prisma.user.findUnique({ where: { id: 'cmlgfxdc30000s0noefwcdvo0' } });
  
  console.log('User 1:', JSON.stringify(u1, null, 2));
  console.log('User 2:', JSON.stringify(u2, null, 2));

  const allUsers = await prisma.user.findMany();
  console.log('All User Emails:');
  allUsers.forEach(u => console.log(` - Email: [${u.email}], ID: ${u.id}`));
}

main().finally(() => prisma.$disconnect());

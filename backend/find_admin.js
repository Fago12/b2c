const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'SUPER_ADMIN'] }
    }
  });
  console.log('Admins found:', JSON.stringify(admins, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

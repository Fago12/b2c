import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
    }
  });

  const sessions = await prisma.session.findMany({
    include: {
      user: {
        select: {
          email: true,
          role: true,
        }
      }
    }
  });

  const output = {
    users,
    sessions: sessions.map(s => ({
      email: s.user.email,
      role: s.user.role,
      tokenPrefix: s.token.substring(0, 8),
      expiresAt: s.expiresAt
    }))
  };

  fs.writeFileSync('db-diag.json', JSON.stringify(output, null, 2));
  console.log('Diagnostic data written to db-diag.json');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  let log = 'USERS IN DB:\n';
  users.forEach(u => {
    log += `ID: ${u.id} | Email: [${u.email}] | Role: ${u.role}\n`;
  });

  const orders = await prisma.order.findMany({
    select: { id: true, userId: true, email: true, createdAt: true }
  });
  log += '\nORDERS IN DB:\n';
  orders.forEach(o => {
    log += `ID: ${o.id} | UserID: ${o.userId} | Email: [${o.email}] | Created: ${o.createdAt.toISOString()}\n`;
  });

  fs.writeFileSync('user_order_debug.txt', log);
}

main().finally(() => prisma.$disconnect());

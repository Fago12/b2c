import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  let output = '--- Deep Database Analysis ---\n';
  
  const emails = ['ayoyemisola@gmail.com', 'ayoyemishola@gmail.com'];
  
  for (const email of emails) {
    const user = await prisma.user.findFirst({ where: { email } });
    output += `User [${email}]: ${user ? 'EXISTS (ID: ' + user.id + ', Role: ' + user.role + ')' : 'MISSING'}\n`;
    
    const ordersByEmail = await prisma.order.findMany({ where: { email } });
    output += `Orders found with explicit email [${email}]: ${ordersByEmail.length}\n`;
    for (const o of ordersByEmail) {
        output += ` - Order ${o.id}: UserID=${o.userId}, Created=${o.createdAt.toISOString()}, Total=${o.total}, Status=${o.status}\n`;
    }
    
    if (user) {
        const linkedOrders = await prisma.order.findMany({ where: { userId: user.id } });
        output += `Orders explicitly linked to UserID [${user.id}]: ${linkedOrders.length}\n`;
        for (const o of linkedOrders) {
            output += ` - Order ${o.id}: Email=${o.email}, Created=${o.createdAt.toISOString()}\n`;
        }
    }
    output += '\n';
  }

  const allRecent = await prisma.order.findMany({
    where: { createdAt: { gte: new Date('2026-02-11') } },
    include: { items: true }
  });
  output += `Total Recent Orders (>= Feb 11): ${allRecent.length}\n`;
  for (const o of allRecent) {
    output += ` - ${o.email} | UserID: ${o.userId} | Created: ${o.createdAt.toISOString()} | Total: ${o.total}\n`;
  }

  const roles = await prisma.user.groupBy({
    by: ['role'],
    _count: { _all: true }
  });
  output += `\nUser Roles Distribution: ${JSON.stringify(roles)}\n`;

  fs.writeFileSync('debug_results.txt', output);
}

main()
  .catch(err => {
    fs.writeFileSync('debug_results.txt', 'Error: ' + err.message);
  })
  .finally(() => prisma.$disconnect());

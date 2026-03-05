import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
  try {
    const names = ['Red', 'Blue', 'Green'];
    
    for (const name of names) {
        const colors = await prisma.color.findMany({
            where: { name: { equals: name, mode: 'insensitive' } }
        });
        console.log(`Searching for '${name}': FOUND ${colors.length} records`);
        colors.forEach((c, i) => {
            console.log(`  [Record ${i}] ID=${c.id}, Name=${c.name}, Hex=${c.hexCode}`);
        });
    }

    const allColors = await prisma.color.findMany();
    console.log(`Total Color Records: ${allColors.length}`);
  } catch (e) {
    console.error("Failed to check duplicates:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();

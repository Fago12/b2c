import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkIndexes() {
  try {
    // Prisma doesn't have a direct "list indexes" method, but we can try to use raw commands if supported by the provider
    // For MongoDB, we can try to inspect the collection
    const colors = await (prisma as any).color.findRaw({
        command: { listIndexes: "Color" }
    });
    console.log("Color Indexes:", JSON.stringify(colors, null, 2));

    const patterns = await (prisma as any).pattern.findRaw({
        command: { listIndexes: "Pattern" }
    });
    console.log("Pattern Indexes:", JSON.stringify(patterns, null, 2));
  } catch (e) {
    console.error("Failed to check indexes raw:", e.message);
    
    // Fallback: Just try to upsert something and see if it works or throws
    console.log("Testing upsert behavior...");
    try {
        const testColor = await prisma.color.upsert({
            where: { name: "TEST_UNIQUE_" + Date.now() } as any,
            update: { hexCode: "#112233" },
            create: { name: "TEST_UNIQUE_" + Date.now(), hexCode: "#445566" }
        });
        console.log("Upsert test success:", testColor.name);
    } catch (upsertError) {
        console.error("Upsert test failed:", upsertError.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkIndexes();

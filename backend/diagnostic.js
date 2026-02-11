const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DIAGNOSTIC START ---');
    try {
        const heroes = await prisma.heroSection.findMany();
        console.log('Found', heroes.length, 'heroes');
        heroes.forEach(h => {
            console.log(`Hero ID: ${h.id}, URL: ${h.imageUrl}`);
        });

        const promos = await prisma.promoBanner.findMany();
        console.log('Found', promos.length, 'promos');
        promos.forEach(p => {
            console.log(`Promo ID: ${p.id}, URL: ${p.imageUrl}`);
        });
    } catch (e) {
        console.error('Diagnostic error:', e);
    } finally {
        await prisma.$disconnect();
        console.log('--- DIAGNOSTIC END ---');
    }
}

main();

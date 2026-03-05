import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const product = await prisma.product.findUnique({
        where: { slug: 'brand-patterned-napkin' },
        include: {
            variants: {
                include: {
                    color: true,
                    pattern: true
                }
            }
        }
    });

    if (!product) {
        // Try searching by name if slug is different
        const products = await prisma.product.findMany({
            where: { name: { contains: 'Napkin' } },
            include: {
                variants: {
                    include: {
                        color: true,
                        pattern: true
                    }
                }
            }
        });
        console.log('Search Results:', JSON.stringify(products, null, 2));
    } else {
        console.log('Product Found:', JSON.stringify(product, null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });

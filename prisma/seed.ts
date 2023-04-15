import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const cigala = await prisma.brand.upsert({
        where: {
            name: 'Cigala',
        },
        update: {},
        create: {
            name: 'Cigala',
            products: {},
        },
    });

    const arroz = await prisma.product.upsert({
        where: {
            fullname: {
                name: 'Arroz Agulha',
                bid: cigala.id,
            },
        },
        update: {},
        create: {
            name: 'Arroz Agulha',
            bid: cigala.id,
            prices: {},
        },
    });

    await prisma.supermarketChain.upsert({
        where: {
            name: 'Continente',
        },
        update: {},
        create: {
            name: 'Continente',
            locations: {
                create: [
                    {
                        name: 'Coimbra Shopping',
                        lat: 40.19442,
                        lon: -8.40865,
                    },
                    {
                        name: 'Fernão de Magalhães',
                        lat: 40.21271,
                        lon: -8.4334,
                    },
                    {
                        name: 'Forum Coimbra',
                        lat: 40.21155,
                        lon: -8.44377,
                    },
                ],
            },
            prices: {
                create: [
                    {
                        price: 139,
                        pid: arroz.id,
                    },
                ],
            }
        },
    });

    await prisma.supermarketChain.upsert({
        where: {
            name: 'Pingo Doce',
        },
        update: {},
        create: {
            name: 'Pingo Doce',
            locations: {
                create: [
                    {
                        name: 'Portela',
                        lat: 40.18921,
                        lon: -8.40182,
                    },
                    {
                        name: 'Rua do Brasil',
                        lat: 40.20244,
                        lon: -8.41337,
                    },
                    {
                        name: 'Celas',
                        lat: 40.21482,
                        lon: -8.41626,
                    },
                ],
            },
            prices: {
                create: [
                    {
                        price: 169,
                        pid: arroz.id,
                    },
                ],
            }
        },
    });

    await prisma.supermarketChain.upsert({
        where: {
            name: 'Auchan',
        },
        update: {},
        create: {
            name: 'Auchan',
            locations: {
                create: [
                    {
                        name: 'Alma Shopping',
                        lat: 40.2045,
                        lon: -8.40764,
                    },
                ],
            },
            prices: {
                create: [
                    {
                        price: 169,
                        pid: arroz.id,
                    },
                ],
            }
        },
    });

    await prisma.supermarketChain.upsert({
        where: {
            name: 'Minipreço',
        },
        update: {},
        create: {
            name: 'Minipreço',
            locations: {
                create: [
                    {
                        name: 'Estrada da Beira',
                        lat: 40.19693,
                        lon: -8.40215,
                    },
                    {
                        name: 'Baixa',
                        lat: 40.20943,
                        lon: -8.43233,
                    },
                ],
            },
            prices: {
                create: [
                    {
                        price: 169,
                        pid: arroz.id,
                    },
                ],
            }
        },
    });
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

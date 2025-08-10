import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const passwordAdmin = await bcrypt.hash('admin123', 10);
    const passwordSeller = await bcrypt.hash('seller123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@painel.dev' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@painel.dev',
            password: passwordAdmin,
            role: 'ADMIN',
            commissionPercent: '0.0500',
        },
    });

    await prisma.user.upsert({
        where: { email: 'vendedor@painel.dev' },
        update: {},
        create: {
            name: 'Vendedor',
            email: 'vendedor@painel.dev',
            password: passwordSeller,
            role: 'SELLER',
            commissionPercent: '0.0500',
        },
    });

    console.log('Seed concluído');
}

main().finally(async () => {
    await prisma.$disconnect();
});

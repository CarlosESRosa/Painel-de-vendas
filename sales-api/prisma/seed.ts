import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // ---- USERS ----
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
            commissionPercent: '0.0500', // 5%
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
            commissionPercent: '0.0500', // 5%
        },
    });

    // ---- PRODUCTS ----
    const PRODUCTS_SEED: Array<{ name: string; sku: string; price: string }> = [
        { name: 'Monitor 27" IPS 75Hz', sku: 'MON-27IPS-001', price: '1199.90' },
        { name: 'Monitor 24" Full HD', sku: 'MON-24FHD-002', price: '849.90' },
        { name: 'Teclado Mecânico ABNT2', sku: 'KEY-MEC-ABNT2-003', price: '329.90' },
        { name: 'Teclado Sem Fio Slim', sku: 'KEY-SLIM-WL-004', price: '199.90' },
        { name: 'Mouse Óptico 1600 DPI', sku: 'MOU-OPT-1600-005', price: '59.90' },
        { name: 'Mouse Ergonômico Vertical', sku: 'MOU-ERG-VERT-006', price: '149.90' },
        { name: 'Headset USB com Microfone', sku: 'HST-USB-MIC-007', price: '219.90' },
        { name: 'Webcam 1080p 30fps', sku: 'WBC-1080P-008', price: '249.90' },
        { name: 'Docking Station USB-C', sku: 'DOC-USBC-009', price: '699.90' },
        { name: 'Hub USB 3.0 4 Portas', sku: 'HUB-USB3-010', price: '89.90' },
        { name: 'Cadeira Ergonômica Mesh', sku: 'CHR-ERG-MESH-011', price: '1299.90' },
        { name: 'Cadeira Presidente Couro PU', sku: 'CHR-PRES-PU-012', price: '1599.90' },
        { name: 'Mesa Office 1,40m', sku: 'DES-140-OFC-013', price: '749.90' },
        { name: 'Mesa Ajustável (Standing Desk)', sku: 'DES-ADJ-014', price: '1999.90' },
        { name: 'Gaveteiro 3 gavetas', sku: 'GBX-3DRV-015', price: '399.90' },
        { name: 'Suporte Monitor Articulado', sku: 'SUP-MON-ART-016', price: '219.90' },
        { name: 'Base Notebook com Cooler', sku: 'BAS-NTB-COOL-017', price: '129.90' },
        { name: 'Nobreak 1200VA', sku: 'UPS-1200-018', price: '899.90' },
        { name: 'Filtro de Linha 6 Tomadas', sku: 'FLN-6P-019', price: '59.90' },
        { name: 'Roteador AC1200 Dual Band', sku: 'RTR-AC1200-020', price: '299.90' },
        { name: 'Switch 8 Portas Gigabit', sku: 'SWT-8G-021', price: '279.90' },
        { name: 'Impressora Laser Mono', sku: 'PRN-LSR-M-022', price: '1199.90' },
        { name: 'Multifuncional Jato de Tinta', sku: 'PRN-INK-MF-023', price: '949.90' },
        { name: 'Projetor 3500 lumens', sku: 'PRJ-3500-024', price: '2499.90' },
        { name: 'Tela Retrátil 100"', sku: 'SCR-100-025', price: '499.90' },
        { name: 'Quadro Branco 120x90', sku: 'WBD-12090-026', price: '219.90' },
        { name: 'Fragmentadora de Papel', sku: 'SHR-A4-027', price: '389.90' },
        { name: 'Etiquetadora Portátil', sku: 'LBL-PRT-028', price: '329.90' },
        { name: 'Kit Teclado + Mouse Sem Fio', sku: 'KIT-KM-WL-029', price: '249.90' },
        { name: 'Cadeira Gamer (para escritório)', sku: 'CHR-GMR-030', price: '1399.90' },
    ];

    for (const p of PRODUCTS_SEED) {
        await prisma.product.upsert({
            where: { sku: p.sku },
            update: {},             // se já existir, mantém
            create: {
                name: p.name,
                sku: p.sku,
                price: p.price,       // string para Decimal
            },
        });
    }

    console.log('Seed concluído (users + products)');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

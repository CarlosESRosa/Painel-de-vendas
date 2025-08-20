// prisma/seed.ts
import { PrismaClient, PaymentStatus, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/** Helpers de CPF (gera dígitos verificadores e retorna só números) */
function onlyDigits(v: string) {
    return v.replace(/\D/g, '');
}
function cpfFromNineDigits(nineDigits: string) {
    const n = onlyDigits(nineDigits).padStart(9, '0').slice(0, 9);
    const toInt = (s: string) => s.split('').map(Number);

    const nums = toInt(n);

    // primeiro DV
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += nums[i] * (10 - i);
    let d1 = 11 - (sum % 11);
    if (d1 > 9) d1 = 0;

    // segundo DV
    sum = 0;
    for (let i = 0; i < 9; i++) sum += nums[i] * (11 - i);
    sum += d1 * 2;
    let d2 = 11 - (sum % 11);
    if (d2 > 9) d2 = 0;

    return n + String(d1) + String(d2); // 11 dígitos
}

/** Gerar nome aleatório realista */
function generateRandomName() {
    const firstNames = [
        'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lucia', 'Fernando', 'Patricia',
        'Roberto', 'Juliana', 'Ricardo', 'Camila', 'André', 'Beatriz', 'Marcos', 'Aline',
        'Felipe', 'Carolina', 'Rafael', 'Gabriela', 'Thiago', 'Mariana', 'Diego', 'Isabela',
        'Lucas', 'Amanda', 'Bruno', 'Larissa', 'Gustavo', 'Vanessa', 'Rodrigo', 'Tatiana',
        'Daniel', 'Fernanda', 'Leonardo', 'Priscila', 'Matheus', 'Bianca', 'Alexandre', 'Renata',
        'Eduardo', 'Monica', 'Paulo', 'Cristina', 'Vinicius', 'Adriana', 'Fabricio', 'Elaine',
        'Guilherme', 'Silvia', 'Henrique', 'Regina', 'Igor', 'Tania', 'Jefferson', 'Vera'
    ];

    const lastNames = [
        'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Almeida', 'Pereira',
        'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Alves', 'Lopes',
        'Soares', 'Fernandes', 'Vieira', 'Monteiro', 'Cardoso', 'Teixeira', 'Moura', 'Barros',
        'Dias', 'Rocha', 'Nascimento', 'Mendes', 'Freitas', 'Barbosa', 'Pinto', 'Moraes',
        'Araujo', 'Cavalcanti', 'Dantas', 'Cunha', 'Machado', 'Bezerra', 'Coelho', 'Reis',
        'Correia', 'Melo', 'Nogueira', 'Guimaraes', 'Henriques', 'Medeiros', 'Borges', 'Sampaio',
        'Viana', 'Moreira', 'Guedes', 'Caldeira', 'Lacerda', 'Queiroz', 'Domingues', 'Duarte'
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
}

/** Gerar CPF único */
function generateUniqueCPF(existingCPFs: Set<string>): string {
    let cpf: string;
    do {
        const base = Math.floor(Math.random() * 999999999).toString().padStart(9, '0');
        cpf = cpfFromNineDigits(base);
    } while (existingCPFs.has(cpf));

    existingCPFs.add(cpf);
    return cpf;
}

/** Gerar data aleatória nos últimos 12 meses */
function generateRandomDate(): Date {
    const now = new Date();
    const pastDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    return pastDate;
}

/** Gerar método de pagamento aleatório */
function generateRandomPaymentMethod(): PaymentMethod {
    const methods: PaymentMethod[] = ['PIX', 'CARTAO', 'DINHEIRO', 'BOLETO'];
    return methods[Math.floor(Math.random() * methods.length)];
}

/** Gerar status de pagamento com distribuição realista */
function generateRandomPaymentStatus(): PaymentStatus {
    const rand = Math.random();
    if (rand < 0.65) return 'PAID';        // 65% pagas
    if (rand < 0.85) return 'PENDING';     // 20% pendentes
    return 'CANCELED';                      // 15% canceladas
}

async function main() {
    console.log('🚀 Iniciando seed com 1500+ vendas...');

    // ---- USERS ----
    const passwordAdmin = await bcrypt.hash('admin123', 10);
    const passwordSeller = await bcrypt.hash('seller123', 10);

    const adminUser = await prisma.user.upsert({
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

    const sellerUser = await prisma.user.upsert({
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

    const products: any[] = [];
    for (const p of PRODUCTS_SEED) {
        const product = await prisma.product.upsert({
            where: { sku: p.sku },
            update: {},
            create: { name: p.name, sku: p.sku, price: p.price },
        });
        products.push(product);
    }

    // ---- CLIENTS ----
    console.log('📝 Criando 1500+ clientes únicos...');

    const existingCPFs = new Set<string>();
    const clients: Array<{ id: string; name: string; cpf: string; email: string | null; phone: string | null; cep: string | null; city: string | null; neighborhood: string | null; street: string | null; number: string | null; state: string | null; createdAt: Date; updatedAt: Date }> = [];

    // Criar 1500+ clientes únicos
    for (let i = 0; i < 1500; i++) {
        const name = generateRandomName();
        const cpf = generateUniqueCPF(existingCPFs);

        const client = await prisma.client.create({
            data: {
                name,
                cpf,
                email: `${name.toLowerCase().replace(' ', '.')}${i}@example.com`,
                phone: `(${Math.floor(Math.random() * 90) + 10}) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
                cep: `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}`,
                city: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Goiânia', 'Salvador', 'Fortaleza', 'Campinas', 'Vitória', 'Florianópolis'][Math.floor(Math.random() * 11)],
                neighborhood: ['Centro', 'Vila Nova', 'Jardim', 'Bairro', 'Setor'][Math.floor(Math.random() * 5)],
                street: ['Rua das Flores', 'Avenida Principal', 'Travessa', 'Alameda', 'Praça'][Math.floor(Math.random() * 5)],
                number: (Math.floor(Math.random() * 1000) + 1).toString(),
                state: ['SP', 'RJ', 'MG', 'PR', 'RS', 'GO', 'BA', 'CE', 'SC', 'ES'][Math.floor(Math.random() * 10)],
            },
        });
        clients.push(client);

        if (i % 100 === 0) {
            console.log(`✅ ${i} clientes criados...`);
        }
    }

    // ---- SALES ----
    console.log('🛒 Criando 1500+ vendas...');

    const salesCreated: Array<{ id: string; createdAt: Date; updatedAt: Date; sellerId: string; clientId: string; date: Date; totalValue: any; paymentStatus: PaymentStatus; paymentMethod: PaymentMethod | null; paymentDate: Date | null; commissionPercentSnapshot: any; commissionValue: any; notes: string | null }> = [];

    for (let i = 0; i < 1500; i++) {
        // Selecionar cliente aleatório
        const client = clients[Math.floor(Math.random() * clients.length)];

        // Selecionar 1-4 produtos aleatórios
        const numProducts = Math.floor(Math.random() * 4) + 1;
        const selectedProducts: Array<{ id: string; name: string; sku: string; price: any; isActive: boolean; createdAt: Date; updatedAt: Date }> = [];
        const usedIndexes = new Set<number>();

        for (let j = 0; j < numProducts; j++) {
            let productIndex;
            do {
                productIndex = Math.floor(Math.random() * products.length);
            } while (usedIndexes.has(productIndex));

            usedIndexes.add(productIndex);
            selectedProducts.push(products[productIndex]);
        }

        // Calcular valor total da venda
        let totalValue = 0;
        const saleItems: any[] = [];

        for (const product of selectedProducts) {
            const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 unidades
            const unitPrice = parseFloat(product.price.toString());
            const subtotal = unitPrice * quantity;
            totalValue += subtotal;

            saleItems.push({
                productId: product.id,
                quantity,
                unitPrice: unitPrice.toFixed(2),
                subtotal: subtotal.toFixed(2)
            });
        }

        // Gerar dados aleatórios da venda
        const paymentStatus = generateRandomPaymentStatus();
        const paymentMethod = generateRandomPaymentMethod();
        const saleDate = generateRandomDate();

        // Determinar data de pagamento baseada no status
        let paymentDate: Date | null = null;
        if (paymentStatus === 'PAID') {
            // Pagamento realizado no mesmo dia ou até 3 dias depois
            const daysAfter = Math.floor(Math.random() * 4);
            paymentDate = new Date(saleDate.getTime() + daysAfter * 24 * 60 * 60 * 1000);
        }

        // Calcular comissão (5% do valor total)
        const commissionValue = totalValue * 0.05;

        // Criar a venda
        const sale = await prisma.sale.create({
            data: {
                date: saleDate,
                notes: `Venda #${i + 1} - ${paymentStatus === 'PAID' ? 'Cliente satisfeito' : paymentStatus === 'PENDING' ? 'Aguardando confirmação' : 'Cancelada pelo cliente'}`,
                totalValue: totalValue.toFixed(2),
                paymentStatus,
                paymentMethod,
                paymentDate,
                commissionPercentSnapshot: '0.0500',
                commissionValue: commissionValue.toFixed(2),
                sellerId: Math.random() > 0.3 ? sellerUser.id : adminUser.id, // 70% vendedor, 30% admin
                clientId: client.id,
                items: {
                    create: saleItems
                }
            }
        });

        salesCreated.push(sale);

        if (i % 100 === 0) {
            console.log(`✅ ${i} vendas criadas...`);
        }
    }

    console.log(`🎉 Seed concluído com sucesso!`);
    console.log(`📊 Resumo:`);
    console.log(`   - ${clients.length} clientes criados`);
    console.log(`   - ${products.length} produtos criados`);
    console.log(`   - ${salesCreated.length} vendas criadas`);

    // Contar status das vendas
    const paidCount = salesCreated.filter(s => s.paymentStatus === 'PAID').length;
    const pendingCount = salesCreated.filter(s => s.paymentStatus === 'PENDING').length;
    const canceledCount = salesCreated.filter(s => s.paymentStatus === 'CANCELED').length;

    console.log(`   - Vendas pagas: ${paidCount}`);
    console.log(`   - Vendas pendentes: ${pendingCount}`);
    console.log(`   - Vendas canceladas: ${canceledCount}`);
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

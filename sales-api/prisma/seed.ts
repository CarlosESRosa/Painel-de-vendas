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

async function main() {
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
    // Bases determinísticas → CPFs válidos via helper acima
    const clientBases = [
        { name: 'João Silva', base: '123456789', email: 'joao.silva@example.com', phone: '(11) 98888-7777', cep: '01001-000', city: 'São Paulo', neighborhood: 'Sé', street: 'Praça da Sé', number: '100', state: 'SP' },
        { name: 'Maria Oliveira', base: '987654321', email: 'maria.oliveira@example.com', phone: '(21) 97777-8888', cep: '20040-020', city: 'Rio de Janeiro', neighborhood: 'Centro', street: 'Rua da Quitanda', number: '250', state: 'RJ' },
        { name: 'Carlos Pereira', base: '321654987', email: 'carlos.pereira@example.com', phone: '(31) 96666-5555', cep: '30110-012', city: 'Belo Horizonte', neighborhood: 'Funcionários', street: 'Av. Afonso Pena', number: '1500', state: 'MG' },
        { name: 'Ana Costa', base: '111222333', email: 'ana.costa@example.com', phone: '(41) 95555-4444', cep: '80010-000', city: 'Curitiba', neighborhood: 'Centro', street: 'Rua XV de Novembro', number: '300', state: 'PR' },
        { name: 'Pedro Santos', base: '444555666', email: 'pedro.santos@example.com', phone: '(51) 94444-3333', cep: '90010-320', city: 'Porto Alegre', neighborhood: 'Centro Histórico', street: 'Rua dos Andradas', number: '450', state: 'RS' },
        { name: 'Luiza Martins', base: '159357456', email: 'luiza.martins@example.com', phone: '(62) 99999-1212', cep: '74000-000', city: 'Goiânia', neighborhood: 'Setor Central', street: 'Rua 10', number: '120', state: 'GO' },
        { name: 'Rafael Souza', base: '753951852', email: 'rafael.souza@example.com', phone: '(71) 98888-1111', cep: '40020-000', city: 'Salvador', neighborhood: 'Comércio', street: 'Av. da França', number: '200', state: 'BA' },
        { name: 'Fernanda Rocha', base: '258369147', email: 'fernanda.rocha@example.com', phone: '(85) 97777-2222', cep: '60060-000', city: 'Fortaleza', neighborhood: 'Centro', street: 'Rua General Sampaio', number: '80', state: 'CE' },
        { name: 'Bruno Lima', base: '147258369', email: 'bruno.lima@example.com', phone: '(19) 97676-3333', cep: '13010-111', city: 'Campinas', neighborhood: 'Centro', street: 'Rua Barão de Jaguara', number: '900', state: 'SP' },
        { name: 'Patrícia Alves', base: '246813579', email: 'patricia.alves@example.com', phone: '(27) 98888-4444', cep: '29010-000', city: 'Vitória', neighborhood: 'Centro', street: 'Av. Princesa Isabel', number: '50', state: 'ES' },
        { name: 'Gustavo Nunes', base: '369258147', email: 'gustavo.nunes@example.com', phone: '(48) 99900-1234', cep: '88010-001', city: 'Florianópolis', neighborhood: 'Centro', street: 'Rua Felipe Schmidt', number: '700', state: 'SC' },
        { name: 'Aline Ribeiro', base: '852741963', email: 'aline.ribeiro@example.com', phone: '(31) 97777-9090', cep: '30160-010', city: 'Belo Horizonte', neighborhood: 'Savassi', street: 'Rua Pernambuco', number: '321', state: 'MG' },
        { name: 'Ricardo Prado', base: '963852741', email: 'ricardo.prado@example.com', phone: '(11) 93456-7890', cep: '03333-000', city: 'São Paulo', neighborhood: 'Tatuapé', street: 'Rua Tuiuti', number: '1234', state: 'SP' },
        { name: 'Camila Duarte', base: '741852963', email: 'camila.duarte@example.com', phone: '(21) 94567-1234', cep: '22775-904', city: 'Rio de Janeiro', neighborhood: 'Barra da Tijuca', street: 'Av. das Américas', number: '4200', state: 'RJ' },
        { name: 'Rodrigo Teixeira', base: '951357852', email: 'rodrigo.teixeira@example.com', phone: '(51) 99876-5432', cep: '90560-002', city: 'Porto Alegre', neighborhood: 'Moinhos de Vento', street: 'Rua Padre Chagas', number: '88', state: 'RS' },
        { name: 'Beatriz Mendes', base: '357159456', email: 'beatriz.mendes@example.com', phone: '(41) 99555-1212', cep: '80420-090', city: 'Curitiba', neighborhood: 'Batel', street: 'Av. Batel', number: '500', state: 'PR' },
        { name: 'Marcos Vinícius', base: '654987321', email: 'marcos.vinicius@example.com', phone: '(85) 99123-4567', cep: '60125-060', city: 'Fortaleza', neighborhood: 'Aldeota', street: 'Av. Dom Luís', number: '1200', state: 'CE' },
        { name: 'Juliana Barros', base: '852963741', email: 'juliana.barros@example.com', phone: '(71) 99666-7777', cep: '41830-480', city: 'Salvador', neighborhood: 'Itaigara', street: 'Av. Antônio Carlos Magalhães', number: '3500', state: 'BA' },
        { name: 'Felipe Araújo', base: '159753486', email: 'felipe.araujo@example.com', phone: '(62) 98111-2222', cep: '74810-100', city: 'Goiânia', neighborhood: 'Jd. Goiás', street: 'Av. Jamel Cecílio', number: '3300', state: 'GO' },
        { name: 'Lorena Farias', base: '753486159', email: 'lorena.farias@example.com', phone: '(27) 98800-7788', cep: '29101-970', city: 'Vila Velha', neighborhood: 'Praia da Costa', street: 'Av. Antônio Gil Veloso', number: '10', state: 'ES' },
    ];

    const clients: any[] = [];
    for (const c of clientBases) {
        const cpf = cpfFromNineDigits(c.base); // 11 dígitos válidos
        const client = await prisma.client.upsert({
            where: { cpf }, // seu schema tem cpf @unique
            update: {},
            create: {
                name: c.name,
                cpf, // salva sem máscara, alinhado ao que seu serviço espera
                email: c.email,
                phone: c.phone,
                cep: c.cep,
                city: c.city,
                neighborhood: c.neighborhood,
                street: c.street,
                number: c.number,
                state: c.state,
            },
        });
        clients.push(client);
    }

    // ---- SALES ----
    const SALES_SEED = [
        // Vendas PAGAS (PAID) - 15 vendas
        {
            clientName: 'João Silva',
            productNames: ['Monitor 27" IPS 75Hz', 'Teclado Mecânico ABNT2'],
            paymentMethod: 'PIX' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-15',
            notes: 'Cliente solicitou entrega rápida'
        },
        {
            clientName: 'Maria Oliveira',
            productNames: ['Cadeira Ergonômica Mesh', 'Mesa Office 1,40m'],
            paymentMethod: 'CARTAO' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-16',
            notes: 'Montagem incluída'
        },
        {
            clientName: 'Carlos Pereira',
            productNames: ['Impressora Laser Mono', 'Nobreak 1200VA'],
            paymentMethod: 'BOLETO' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-17',
            notes: 'Instalação de drivers incluída'
        },
        {
            clientName: 'Ana Costa',
            productNames: ['Projetor 3500 lumens', 'Tela Retrátil 100"'],
            paymentMethod: 'PIX' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-18',
            notes: 'Para sala de reuniões'
        },
        {
            clientName: 'Pedro Santos',
            productNames: ['Kit Teclado + Mouse Sem Fio', 'Headset USB com Microfone'],
            paymentMethod: 'CARTAO' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-19',
            notes: 'Home office'
        },
        {
            clientName: 'Luiza Martins',
            productNames: ['Cadeira Gamer (para escritório)', 'Suporte Monitor Articulado'],
            paymentMethod: 'PIX' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-20',
            notes: 'Setup gamer profissional'
        },
        {
            clientName: 'Rafael Souza',
            productNames: ['Monitor 24" Full HD', 'Mouse Ergonômico Vertical'],
            paymentMethod: 'BOLETO' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-21',
            notes: 'Para desenvolvedor'
        },
        {
            clientName: 'Fernanda Rocha',
            productNames: ['Docking Station USB-C', 'Hub USB 3.0 4 Portas'],
            paymentMethod: 'CARTAO' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-22',
            notes: 'Setup para notebook'
        },
        {
            clientName: 'Bruno Lima',
            productNames: ['Mesa Ajustável (Standing Desk)', 'Gaveteiro 3 gavetas'],
            paymentMethod: 'PIX' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-23',
            notes: 'Escritório moderno'
        },
        {
            clientName: 'Patrícia Alves',
            productNames: ['Webcam 1080p 30fps', 'Base Notebook com Cooler'],
            paymentMethod: 'CARTAO' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-24',
            notes: 'Para reuniões online'
        },
        {
            clientName: 'Gustavo Nunes',
            productNames: ['Roteador AC1200 Dual Band', 'Switch 8 Portas Gigabit'],
            paymentMethod: 'BOLETO' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-25',
            notes: 'Infraestrutura de rede'
        },
        {
            clientName: 'Aline Ribeiro',
            productNames: ['Monitor 27" IPS 75Hz', 'Teclado Sem Fio Slim'],
            paymentMethod: 'PIX' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-26',
            notes: 'Setup limpo e minimalista'
        },
        {
            clientName: 'Ricardo Prado',
            productNames: ['Multifuncional Jato de Tinta', 'Fragmentadora de Papel'],
            paymentMethod: 'CARTAO' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-27',
            notes: 'Para pequeno escritório'
        },
        {
            clientName: 'Camila Duarte',
            productNames: ['Cadeira Presidente Couro PU', 'Quadro Branco 120x90'],
            paymentMethod: 'PIX' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-28',
            notes: 'Sala executiva'
        },
        {
            clientName: 'Rodrigo Teixeira',
            productNames: ['Etiquetadora Portátil', 'Filtro de Linha 6 Tomadas'],
            paymentMethod: 'BOLETO' as PaymentMethod,
            paymentStatus: 'PAID' as PaymentStatus,
            date: '2025-01-29',
            notes: 'Para organização de estoque'
        },

        // Vendas PENDENTES (PENDING) - 10 vendas
        {
            clientName: 'Beatriz Mendes',
            productNames: ['Monitor 24" Full HD', 'Mouse Óptico 1600 DPI'],
            paymentMethod: 'CARTAO' as PaymentMethod,
            paymentStatus: 'PENDING' as PaymentStatus,
            date: '2025-01-30',
            notes: 'Aguardando aprovação do cartão'
        },
        {
            clientName: 'Marcos Vinícius',
            productNames: ['Teclado Mecânico ABNT2', 'Headset USB com Microfone'],
            paymentMethod: 'BOLETO' as PaymentMethod,
            paymentStatus: 'PENDING' as PaymentStatus,
            date: '2025-01-31',
            notes: 'Transferência em processamento'
        },
        {
            clientName: 'Juliana Barros',
            productNames: ['Cadeira Ergonômica Mesh'],
            paymentMethod: 'PIX' as PaymentMethod,
            paymentStatus: 'PENDING' as PaymentStatus,
            date: '2025-02-01',
            notes: 'PIX não confirmado'
        },
        {
            clientName: 'Felipe Araújo',
            productNames: ['Mesa Office 1,40m', 'Gaveteiro 3 gavetas'],
            paymentMethod: 'CARTAO' as PaymentMethod,
            paymentStatus: 'PENDING' as PaymentStatus,
            date: '2025-02-02',
            notes: 'Cartão com limite insuficiente'
        },
        {
            clientName: 'Lorena Farias',
            productNames: ['Docking Station USB-C', 'Hub USB 3.0 4 Portas'],
            paymentMethod: 'BOLETO' as PaymentMethod,
            paymentStatus: 'PENDING' as PaymentStatus,
            date: '2025-02-03',
            notes: 'Aguardando confirmação bancária'
        },
        {
            clientName: 'João Silva',
            productNames: ['Nobreak 1200VA', 'Filtro de Linha 6 Tomadas'],
            paymentMethod: 'PIX' as PaymentMethod,
            paymentStatus: 'PENDING' as PaymentStatus,
            date: '2025-02-04',
            notes: 'Segunda compra do cliente'
        },
        {
            clientName: 'Maria Oliveira',
            productNames: ['Suporte Monitor Articulado', 'Base Notebook com Cooler'],
            paymentMethod: 'CARTAO' as PaymentMethod,
            paymentStatus: 'PENDING' as PaymentStatus,
            date: '2025-02-05',
            notes: 'Acessórios para setup existente'
        },
        {
            clientName: 'Carlos Pereira',
            productNames: ['Roteador AC1200 Dual Band'],
            paymentMethod: 'BOLETO' as PaymentMethod,
            paymentStatus: 'PENDING' as PaymentStatus,
            date: '2025-02-06',
            notes: 'Upgrade de rede residencial'
        },
        {
            clientName: 'Ana Costa',
            productNames: ['Webcam 1080p 30fps', 'Headset USB com Microfone'],
            paymentMethod: 'PIX' as PaymentMethod,
            paymentStatus: 'PENDING' as PaymentStatus,
            date: '2025-02-07',
            notes: 'Para trabalho remoto'
        },
        {
            clientName: 'Pedro Santos',
            productNames: ['Impressora Laser Mono'],
            paymentMethod: 'CARTAO' as PaymentMethod,
            paymentStatus: 'PENDING' as PaymentStatus,
            date: '2025-02-08',
            notes: 'Para pequena empresa'
        },

        // Vendas CANCELADAS (CANCELLED) - 5 vendas
        {
            clientName: 'Luiza Martins',
            productNames: ['Projetor 3500 lumens'],
            paymentMethod: 'CARTAO' as PaymentMethod,
            paymentStatus: 'CANCELED' as PaymentStatus,
            date: '2025-02-09',
            notes: 'Cliente desistiu - preço alto'
        },
        {
            clientName: 'Rafael Souza',
            productNames: ['Cadeira Gamer (para escritório)', 'Mesa Ajustável (Standing Desk)'],
            paymentMethod: 'PIX' as PaymentMethod,
            paymentStatus: 'CANCELED' as PaymentStatus,
            date: '2025-02-10',
            notes: 'Cancelado por falta de estoque'
        },
        {
            clientName: 'Fernanda Rocha',
            productNames: ['Monitor 27" IPS 75Hz', 'Teclado Mecânico ABNT2'],
            paymentMethod: 'BOLETO' as PaymentMethod,
            paymentStatus: 'CANCELED' as PaymentStatus,
            date: '2025-02-11',
            notes: 'Cliente mudou de ideia'
        },
        {
            clientName: 'Bruno Lima',
            productNames: ['Tela Retrátil 100"', 'Quadro Branco 120x90'],
            paymentMethod: 'CARTAO' as PaymentMethod,
            paymentStatus: 'CANCELED' as PaymentStatus,
            date: '2025-02-12',
            notes: 'Cancelado - sala não ficou pronta'
        },
        {
            clientName: 'Patrícia Alves',
            productNames: ['Fragmentadora de Papel', 'Etiquetadora Portátil'],
            paymentMethod: 'PIX' as PaymentMethod,
            paymentStatus: 'CANCELED' as PaymentStatus,
            date: '2025-02-13',
            notes: 'Empresa fechou antes da entrega'
        }
    ];

    // Criar vendas
    for (const saleData of SALES_SEED) {
        const client = clients.find(c => c.name === saleData.clientName);
        if (!client) continue;

        // Calcular valor total da venda
        let totalValue = 0;
        const saleItems: any[] = [];

        for (const productName of saleData.productNames) {
            const product = products.find(p => p.name === productName);
            if (product) {
                totalValue += parseFloat(product.price.toString());
                saleItems.push({
                    productId: product.id,
                    quantity: 1,
                    unitPrice: product.price.toString(),
                    subtotal: product.price.toString()
                });
            }
        }

        if (saleItems.length === 0) continue;

        // Calcular comissão (5% do valor total)
        const commissionValue = totalValue * 0.05;

        // Determinar data de pagamento baseada no status
        let paymentDate: Date | null = null;
        if (saleData.paymentStatus === 'PAID') {
            paymentDate = new Date(saleData.date);
        }

        // Criar a venda
        const sale = await prisma.sale.create({
            data: {
                date: new Date(saleData.date),
                notes: saleData.notes,
                totalValue: totalValue.toFixed(2),
                paymentStatus: saleData.paymentStatus,
                paymentMethod: saleData.paymentMethod,
                paymentDate: paymentDate,
                commissionPercentSnapshot: '0.0500',
                commissionValue: commissionValue.toFixed(2),
                sellerId: Math.random() > 0.5 ? adminUser.id : sellerUser.id, // Alternar entre vendedores
                clientId: client.id,
                items: {
                    create: saleItems
                }
            }
        });

        console.log(`Venda criada: ${saleData.clientName} - ${saleData.productNames.join(', ')} - ${saleData.paymentStatus}`);
    }

    console.log('Seed concluído (users + products + clients + sales)');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

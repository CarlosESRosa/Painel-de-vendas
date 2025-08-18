import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class SalesService {
    constructor(private prisma: PrismaService) { }

    async create(sellerId: string, dto: { clientId: string; notes?: string }) {
        // pega snapshot da comissão do vendedor na criação
        const seller = await this.prisma.user.findUnique({ where: { id: sellerId }, select: { commissionPercent: true } });
        if (!seller) throw new ForbiddenException('Seller not found');

        return this.prisma.sale.create({
            data: {
                sellerId,
                clientId: dto.clientId,
                notes: dto.notes,
                paymentStatus: PaymentStatus.PENDING,
                totalValue: '0', // começa zerado, soma quando adicionar itens
                commissionPercentSnapshot: seller.commissionPercent, // snapshot
            },
            select: this.selectSale(),
        });
    }

    async replaceItems(saleId: string, sellerId: string, items: { productId: string; quantity: number }[]) {
        const sale = await this.prisma.sale.findUnique({ where: { id: saleId }, select: { id: true, sellerId: true, paymentStatus: true } });
        if (!sale) throw new NotFoundException('Venda não encontrada');
        if (sale.sellerId !== sellerId) {
            // admin pode editar qualquer venda — ajuste no controller via role
            // aqui deixo a regra simples e segura:
            throw new ForbiddenException('Você não pode alterar itens desta venda');
        }
        if (sale.paymentStatus === PaymentStatus.PAID) {
            throw new BadRequestException('Não é possível alterar itens de uma venda já paga');
        }

        // Transação: apaga itens antigos, cria novos e recalcula total
        return this.prisma.$transaction(async (trx) => {
            await trx.saleItem.deleteMany({ where: { saleId } });

            // carrega preços atuais e cria items com snapshot de preço
            const productIds = items.map(i => i.productId);
            const products = await trx.product.findMany({
                where: { id: { in: productIds }, isActive: true },
                select: { id: true, price: true },
            });
            if (products.length !== items.length) {
                throw new BadRequestException('Produto inválido/inativo em itens');
            }

            let total = 0;
            for (const it of items) {
                const prod = products.find(p => p.id === it.productId)!;
                const unit = prod.price as unknown as number; // prisma Decimal → number (se preferir, use string)
                const sub = unit * it.quantity;
                total += sub;

                await trx.saleItem.create({
                    data: {
                        saleId,
                        productId: it.productId,
                        quantity: it.quantity,
                        unitPrice: prod.price, // snapshot
                        subtotal: sub.toFixed(2),
                    },
                });
            }

            const updated = await trx.sale.update({
                where: { id: saleId },
                data: { totalValue: total.toFixed(2) },
                select: this.selectSale(),
            });

            return updated;
        });
    }

    async pay(saleId: string, data: { paymentMethod: any; paymentDate: string }) {
        const sale = await this.prisma.sale.findUnique({
            where: { id: saleId },
            select: { id: true, paymentStatus: true, totalValue: true, commissionPercentSnapshot: true },
        });
        if (!sale) throw new NotFoundException('Venda não encontrada');
        if (sale.paymentStatus === PaymentStatus.PAID) {
            throw new BadRequestException('Venda já está paga');
        }
        const total = Number(sale.totalValue || 0);
        if (total <= 0) {
            throw new BadRequestException('Não é possível pagar uma venda sem itens');
        }
        const percent = Number(sale.commissionPercentSnapshot || 0);
        const commission = (total * percent).toFixed(2);

        return this.prisma.sale.update({
            where: { id: saleId },
            data: {
                paymentStatus: PaymentStatus.PAID,
                paymentMethod: data.paymentMethod,
                paymentDate: new Date(data.paymentDate),
                commissionValue: commission,
            },
            select: this.selectSale(),
        });
    }


    async getById(id: string, requester: { id: string; role: 'ADMIN' | 'SELLER' }) {
        const sale = await this.prisma.sale.findUnique({
            where: { id },
            select: this.selectSale(true),
        });
        if (!sale) throw new NotFoundException('Venda não encontrada');

        if (requester.role !== 'ADMIN' && sale.sellerId !== requester.id) {
            throw new ForbiddenException('Sem acesso a esta venda');
        }
        return sale;
    }

    async list(params: {
        requester: { id: string; role: 'ADMIN' | 'SELLER' };
        q?: string;
        clientId?: string;
        paymentStatus?: PaymentStatus;
        start?: string;
        end?: string;
        page: number;
        perPage: number;
        sortBy: 'date' | 'createdAt';
        order: 'asc' | 'desc';
    }) {
        const { requester, q, clientId, paymentStatus, start, end, page, perPage, sortBy, order } = params;

        const where: any = {};
        if (requester.role !== 'ADMIN') where.sellerId = requester.id; // filtro de permissão

        if (clientId) where.clientId = clientId;
        if (paymentStatus) where.paymentStatus = paymentStatus;

        if (start || end) {
            where.date = {};
            if (start) where.date.gte = new Date(start);
            if (end) {
                const endDate = new Date(end);
                endDate.setHours(23, 59, 59, 999);
                where.date.lte = endDate;
            }
        }

        if (q) {
            // busca por nome do cliente (SQLite LIKE)
            where.client = {
                name: { contains: q },
            };
        }

        const [items, total] = await Promise.all([
            this.prisma.sale.findMany({
                where,
                orderBy: { [sortBy]: order },
                skip: (page - 1) * perPage,
                take: perPage,
                select: this.selectSale(),
            }),
            this.prisma.sale.count({ where }),
        ]);

        return { items, page, perPage, total, totalPages: Math.ceil(total / perPage) };
    }

    private selectSale(includeItems = false) {
        return {
            id: true,
            date: true,
            notes: true,
            totalValue: true,
            paymentStatus: true,
            paymentMethod: true,
            paymentDate: true,
            commissionPercentSnapshot: true,
            commissionValue: true,
            createdAt: true,
            updatedAt: true,
            sellerId: true,
            clientId: true,
            seller: { select: { id: true, name: true, email: true, role: true } },
            client: { select: { id: true, name: true, cpf: true } },
            ...(includeItems && {
                items: {
                    select: {
                        id: true,
                        productId: true,
                        quantity: true,
                        unitPrice: true,
                        subtotal: true,
                        product: { select: { id: true, name: true, sku: true } },
                    },
                },
            }),
        };
    }
}

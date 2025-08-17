import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SELECT_SAFE = {
    id: true,
    name: true,
    sku: true,
    price: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
};

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: { name: string; sku: string; price: string }) {
        const exists = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
        if (exists) throw new ConflictException('SKU already in use');

        return this.prisma.product.create({
            data: { name: dto.name, sku: dto.sku, price: dto.price },
            select: SELECT_SAFE,
        });
    }

    async list(params: {
        q?: string;
        sku?: string;
        isActive?: string;
        page: number;
        perPage: number;
        sortBy: 'name' | 'price' | 'createdAt';
        order: 'asc' | 'desc';
    }) {
        const { q, sku, isActive, page, perPage, sortBy, order } = params;

        const where: any = {};
        if (q) {
            where.OR = [
                { name: { contains: q } },
                { sku: { contains: q } },
            ];
        }
        if (sku) where.sku = sku;
        if (typeof isActive !== 'undefined') where.isActive = isActive === 'true';

        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                orderBy: { [sortBy]: order },
                skip: (page - 1) * perPage,
                take: perPage,
                select: SELECT_SAFE,
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            items,
            page,
            perPage,
            total,
            totalPages: Math.ceil(total / perPage),
        };
    }

    async get(id: string) {
        const product = await this.prisma.product.findUnique({ where: { id }, select: SELECT_SAFE });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async update(id: string, dto: { name?: string; sku?: string; price?: string; isActive?: boolean }) {
        if (dto.sku) {
            const exists = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
            if (exists && exists.id !== id) throw new ConflictException('SKU already in use');
        }
        try {
            return await this.prisma.product.update({
                where: { id },
                data: dto,
                select: SELECT_SAFE,
            });
        } catch {
            throw new NotFoundException('Product not found');
        }
    }

    // Deleção física (para demo). Em produção, prefira isActive=false.
    async remove(id: string) {
        try {
            return await this.prisma.product.delete({ where: { id }, select: SELECT_SAFE });
        } catch {
            throw new NotFoundException('Product not found');
        }
    }
}

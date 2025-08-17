import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { onlyDigits, isValidCpf } from './cpf.util';

const SELECT_SAFE = {
    id: true,
    name: true,
    cpf: true,
    email: true,
    phone: true,
    cep: true,
    city: true,
    neighborhood: true,
    street: true,
    number: true,
    state: true,
    createdAt: true,
    updatedAt: true,
};

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) { }

    private normalizeCpf(cpf: string) {
        const digits = onlyDigits(cpf);
        if (!isValidCpf(digits)) throw new BadRequestException('CPF inválido');
        return digits; // salva sempre só dígitos
    }

    async create(dto: any) {
        const cpf = this.normalizeCpf(dto.cpf);
        const exists = await this.prisma.client.findUnique({ where: { cpf } });
        if (exists) throw new ConflictException('CPF já cadastrado');

        return this.prisma.client.create({
            data: { ...dto, cpf },
            select: SELECT_SAFE,
        });
    }

    async list(params: {
        q?: string;
        cpf?: string;
        page: number;
        perPage: number;
        sortBy: 'name' | 'createdAt';
        order: 'asc' | 'desc';
    }) {
        const { q, cpf, page, perPage, sortBy, order } = params;

        const where: any = {};
        if (q) where.name = { contains: q }; // SQLite: LIKE (case-insensitive comum em ASCII)
        if (cpf) where.cpf = { contains: onlyDigits(cpf) };

        const [items, total] = await Promise.all([
            this.prisma.client.findMany({
                where,
                orderBy: { [sortBy]: order },
                skip: (page - 1) * perPage,
                take: perPage,
                select: SELECT_SAFE,
            }),
            this.prisma.client.count({ where }),
        ]);

        return { items, page, perPage, total, totalPages: Math.ceil(total / perPage) };
    }

    async get(id: string) {
        const client = await this.prisma.client.findUnique({ where: { id }, select: SELECT_SAFE });
        if (!client) throw new NotFoundException('Cliente não encontrado');
        return client;
    }

    async update(id: string, dto: any) {
        if (dto.cpf) {
            dto.cpf = this.normalizeCpf(dto.cpf);
            const exists = await this.prisma.client.findUnique({ where: { cpf: dto.cpf } });
            if (exists && exists.id !== id) throw new ConflictException('CPF já cadastrado');
        }
        try {
            return await this.prisma.client.update({
                where: { id },
                data: dto,
                select: SELECT_SAFE,
            });
        } catch {
            throw new NotFoundException('Cliente não encontrado');
        }
    }

    // Em produção, prefira soft-delete; aqui só para demo
    async remove(id: string) {
        try {
            return await this.prisma.client.delete({ where: { id }, select: SELECT_SAFE });
        } catch {
            throw new NotFoundException('Cliente não encontrado');
        }
    }
}

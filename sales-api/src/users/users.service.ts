import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  commissionPercent: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // ---------- SELLERS ----------
  async createSeller(data: {
    name: string;
    email: string;
    password: string;
    commissionPercent?: string;
  }) {
    const exists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (exists) throw new ConflictException('E-mail already in use');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const commission = data.commissionPercent ?? '0.05';

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
        role: 'SELLER',
        commissionPercent: commission,
      },
      select: SAFE_USER_SELECT,
    });
  }

  async listSellers(params?: { page?: number; perPage?: number; q?: string }) {
    const { page = 1, perPage = 15, q } = params || {};

    const where: any = { role: 'SELLER' };

    // Add search functionality
    if (q) {
      where.OR = [{ name: { contains: q } }, { email: { contains: q } }];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        select: SAFE_USER_SELECT,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    };
  }

  getSellerById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, role: 'SELLER' },
      select: SAFE_USER_SELECT,
    });
  }

  async updateSeller(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      commissionPercent?: string;
    },
  ) {
    const toUpdate: any = {};
    if (data.name) toUpdate.name = data.name;
    if (data.email) {
      // checa duplicidade
      const exists = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (exists && exists.id !== id)
        throw new ConflictException('E-mail already in use');
      toUpdate.email = data.email;
    }
    if (data.password) {
      toUpdate.password = await bcrypt.hash(data.password, 10);
    }
    if (data.commissionPercent) {
      toUpdate.commissionPercent = data.commissionPercent; // string decimal
    }

    return this.prisma.user.update({
      where: { id },
      data: toUpdate,
      select: SAFE_USER_SELECT,
    });
  }

  updateSellerStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: SAFE_USER_SELECT,
    });
  }
}

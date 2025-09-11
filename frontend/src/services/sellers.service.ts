import { http } from '../api/http';
import type { Seller } from '../types/sellers.types';

export interface CreateSellerData {
  name: string;
  email: string;
  phone: string;
  cpf?: string;
}

export class SellersService {
  private static readonly SELLERS_ENDPOINT = '/sellers'; // ajuste se seu backend usar outro path

  static async createSeller(data: CreateSellerData): Promise<Seller> {
    try {
      const clean = {
        name: data.name,
        email: data.email,
        password: 'temp123', // Backend requires password, will be hashed
        commissionPercent: '0.05', // Default commission
      };
      const response = await http.post<Seller>(this.SELLERS_ENDPOINT, clean);
      return response.data;
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error('Erro ao criar vendedor');
    }
  }

  static async getSellerById(id: string): Promise<Seller> {
    try {
      const response = await http.get<Seller>(`${this.SELLERS_ENDPOINT}/${id}`);
      return response.data;
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error('Erro ao carregar vendedor');
    }
  }

  static async getSellers(query: { page?: number; perPage?: number; q?: string }): Promise<{
    items: Seller[];
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (query.page) params.append('page', String(query.page));
      if (query.perPage) params.append('perPage', String(query.perPage));
      if (query.q) params.append('q', query.q);
      const response = await http.get(`${this.SELLERS_ENDPOINT}?${params.toString()}`);
      return response.data;
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error('Erro ao listar vendedores');
    }
  }

  static async updateSeller(id: string, data: Partial<CreateSellerData>): Promise<Seller> {
    try {
      const clean: { name?: string; email?: string; password?: string } = {};
      if (data.name) clean.name = data.name;
      if (data.email) clean.email = data.email;

      const response = await http.patch<Seller>(`${this.SELLERS_ENDPOINT}/${id}`, clean);
      return response.data;
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error('Erro ao atualizar vendedor');
    }
  }
}

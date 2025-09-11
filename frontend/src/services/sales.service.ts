import { http } from '../api/http';
import type { SalesQuery, SalesResponse } from '../types/sales.types';

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface SaleWithItems {
  id: string;
  date: string;
  notes: string | null;
  totalValue: string;
  paymentStatus: 'PAID' | 'PENDING' | 'CANCELED';
  paymentMethod: 'PIX' | 'CARTAO' | 'DINHEIRO' | 'BOLETO' | null;
  paymentDate: string | null;
  commissionPercentSnapshot: string;
  commissionValue: string;
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  clientId: string;
  seller: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  client: {
    id: string;
    name: string;
    cpf: string;
    email: string;
    phone: string;
    cep: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    state: string;
    createdAt: string;
    updatedAt: string;
  };
  items: SaleItem[];
}

export interface UpdateSaleItemsData {
  items: {
    productId: string;
    quantity: number;
  }[];
}

export class SalesService {
  private static readonly SALES_ENDPOINT = '/sales';

  static async getSales(query: SalesQuery): Promise<SalesResponse> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.perPage) params.append('perPage', query.perPage.toString());
    if (query.clientName) params.append('q', query.clientName); // Usar 'q' para busca por nome
    if (query.startDate) params.append('start', query.startDate);
    if (query.endDate) params.append('end', query.endDate);
    if (query.paymentStatus && query.paymentStatus !== 'ALL') {
      params.append('paymentStatus', query.paymentStatus);
    }

    const response = await http.get<SalesResponse>(`${this.SALES_ENDPOINT}?${params.toString()}`);
    return response.data;
  }

  // Obter venda por ID com itens
  static async getSaleById(id: string): Promise<SaleWithItems> {
    try {
      const response = await http.get<SaleWithItems>(`${this.SALES_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao buscar venda');
    }
  }

  // Criar nova venda
  static async createSale(saleData: { clientId: string; notes?: string }): Promise<{ id: string }> {
    try {
      const response = await http.post<{ id: string }>(this.SALES_ENDPOINT, saleData);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao criar venda');
    }
  }

  // Atualizar itens da venda
  static async updateSaleItems(id: string, itemsData: UpdateSaleItemsData): Promise<SaleWithItems> {
    try {
      const response = await http.patch<SaleWithItems>(
        `${this.SALES_ENDPOINT}/${id}/items`,
        itemsData,
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao atualizar itens da venda');
    }
  }

  // Obter contadores de status de vendas (precisos, sem paginação)
  static async getStatusCounts(query: {
    clientName?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total: number;
    paid: number;
    pending: number;
    canceled: number;
  }> {
    try {
      const params = new URLSearchParams();

      if (query.clientName) params.append('q', query.clientName);
      if (query.startDate) params.append('start', query.startDate);
      if (query.endDate) params.append('end', query.endDate);

      const response = await http.get<{
        total: number;
        paid: number;
        pending: number;
        canceled: number;
      }>(`${this.SALES_ENDPOINT}/counts/status?${params.toString()}`);

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao buscar contadores de status');
    }
  }

  // Atualizar venda
  static async updateSale(id: string, saleData: Partial<{ notes: string; clientId: string }>) {
    try {
      const response = await http.put(`${this.SALES_ENDPOINT}/${id}`, saleData);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao atualizar venda');
    }
  }

  // Excluir venda
  static async deleteSale(id: string) {
    try {
      await http.delete(`${this.SALES_ENDPOINT}/${id}`);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao excluir venda');
    }
  }

  // Marcar venda como paga
  static async paySale(
    id: string,
    paymentData: { paymentMethod: string; paymentDate: string },
  ): Promise<SaleWithItems> {
    try {
      const response = await http.patch<SaleWithItems>(
        `${this.SALES_ENDPOINT}/${id}/pay`,
        paymentData,
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao atualizar status de pagamento da venda');
    }
  }
}

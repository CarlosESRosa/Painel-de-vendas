export interface Seller {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Client {
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
}

export interface Sale {
  id: string;
  date: string;
  notes: string | null;
  totalValue: string;
  paymentStatus: 'PAID' | 'PENDING' | 'CANCELED';
  paymentMethod: string;
  paymentDate: string | null;
  commissionPercentSnapshot: string;
  commissionValue: string;
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  clientId: string;
  seller: Seller;
  client: Client;
}

export interface SalesResponse {
  items: Sale[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface SalesFilters {
  clientName?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  paymentStatus?: 'PAID' | 'PENDING' | 'CANCELED' | 'ALL';
  page: number;
  perPage: number;
}

export interface SalesQuery {
  page: number;
  perPage: number;
  clientName?: string;
  startDate?: string;
  endDate?: string;
  paymentStatus?: string;
}

// Mapeamento dos status para português
export const PAYMENT_STATUS_LABELS = {
  PAID: 'Pago',
  PENDING: 'A receber',
  CANCELED: 'Cancelado',
} as const;

export const PAYMENT_STATUS_COLORS = {
  PAID: 'success',
  PENDING: 'warning',
  CANCELED: 'danger',
} as const;

// Mapeamento dos métodos de pagamento para português
export const PAYMENT_METHOD_LABELS = {
  PIX: 'PIX',
  CARTAO: 'Cartão',
  DINHEIRO: 'Dinheiro',
  BOLETO: 'Boleto',
} as const;

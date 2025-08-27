export type DateRange = { start: string; end: string };

export interface Seller {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  commissionPercent?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellersFilters {
  search: string;
  page: number;
  perPage: number;
}

export interface SellersQuery {
  page: number;
  perPage: number;
  q?: string; // backend espera 'q' para busca
}

export interface SellersResponse {
  items: Seller[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

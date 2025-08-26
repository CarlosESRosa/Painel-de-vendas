export type DateRange = { start: string; end: string };

// Client types for the sales panel
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

export interface ClientsFilters {
  search: string;
  page: number;
  perPage: number;
}

export interface ClientsQuery {
  page: number;
  perPage: number;
  q?: string; // Backend expects 'q' for search
}

export interface ClientsResponse {
  items: Client[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

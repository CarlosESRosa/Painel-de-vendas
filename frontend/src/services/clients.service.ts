import { http } from '../api/http';

export interface CreateClientData {
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

export class ClientsService {
  private static readonly CLIENTS_ENDPOINT = '/clients';

  // Criar novo cliente
  static async createClient(clientData: CreateClientData): Promise<Client> {
    try {
      // Remover máscaras dos campos formatados
      const cleanData = {
        ...clientData,
        cpf: clientData.cpf.replace(/\D/g, ''),
        phone: clientData.phone.replace(/\D/g, ''),
        cep: clientData.cep.replace(/\D/g, ''),
      };

      const response = await http.post<Client>(this.CLIENTS_ENDPOINT, cleanData);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao criar cliente');
    }
  }

  // Buscar cliente por CPF
  static async getClientByCPF(cpf: string): Promise<Client | null> {
    try {
      const cleanCPF = cpf.replace(/\D/g, '');
      const response = await http.get<Client[]>(`${this.CLIENTS_ENDPOINT}?cpf=${cleanCPF}`);
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao buscar cliente');
    }
  }

  static async getClientById(id: string): Promise<Client> {
    try {
      const response = await http.get<Client>(`${this.CLIENTS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Erro ao carregar cliente');
    }
  }

  // Listar clientes
  static async getClients(query: {
    page?: number;
    perPage?: number;
    q?: string; // Backend expects 'q' for search
  }): Promise<{
    items: Client[];
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();

      if (query.page) params.append('page', query.page.toString());
      if (query.perPage) params.append('perPage', query.perPage.toString());
      if (query.q) params.append('q', query.q);

      const response = await http.get<{
        items: Client[];
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
      }>(`${this.CLIENTS_ENDPOINT}?${params.toString()}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao listar clientes');
    }
  }

  // Atualizar cliente
  static async updateClient(id: string, clientData: Partial<CreateClientData>): Promise<Client> {
    try {
      // Remover máscaras dos campos formatados
      const cleanData = {
        ...clientData,
        cpf: clientData.cpf ? clientData.cpf.replace(/\D/g, '') : undefined,
        phone: clientData.phone ? clientData.phone.replace(/\D/g, '') : undefined,
        cep: clientData.cep ? clientData.cep.replace(/\D/g, '') : undefined,
      };

      const response = await http.patch<Client>(`${this.CLIENTS_ENDPOINT}/${id}`, cleanData);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao atualizar cliente');
    }
  }
}

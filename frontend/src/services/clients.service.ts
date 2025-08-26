import { api } from './api';

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
  static async createClient(clientData: CreateClientData, token: string): Promise<Client> {
    try {
      // Remover máscaras dos campos formatados
      const cleanData = {
        ...clientData,
        cpf: clientData.cpf.replace(/\D/g, ''),
        phone: clientData.phone.replace(/\D/g, ''),
        cep: clientData.cep.replace(/\D/g, ''),
      };

      const response = await api.authPost<Client>(this.CLIENTS_ENDPOINT, token, cleanData);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao criar cliente');
    }
  }

  // Buscar cliente por CPF
  static async getClientByCPF(cpf: string, token: string): Promise<Client | null> {
    try {
      const cleanCPF = cpf.replace(/\D/g, '');
      const response = await api.authGet<Client[]>(
        `${this.CLIENTS_ENDPOINT}?cpf=${cleanCPF}`,
        token,
      );
      return response.length > 0 ? response[0] : null;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao buscar cliente');
    }
  }

  // Listar clientes
  static async getClients(
    query: {
      page?: number;
      perPage?: number;
      q?: string; // Backend expects 'q' for search
    },
    token: string,
  ): Promise<{
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

      const response = await api.authGet<{
        items: Client[];
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
      }>(`${this.CLIENTS_ENDPOINT}?${params.toString()}`, token);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao listar clientes');
    }
  }

  // Atualizar cliente
  static async updateClient(
    id: string,
    clientData: Partial<CreateClientData>,
    token: string,
  ): Promise<Client> {
    try {
      // Remover máscaras dos campos formatados
      const cleanData = {
        ...clientData,
        cpf: clientData.cpf ? clientData.cpf.replace(/\D/g, '') : undefined,
        phone: clientData.phone ? clientData.phone.replace(/\D/g, '') : undefined,
        cep: clientData.cep ? clientData.cep.replace(/\D/g, '') : undefined,
      };

      const response = await api.authPatch<Client>(
        `${this.CLIENTS_ENDPOINT}/${id}`,
        token,
        cleanData,
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao atualizar cliente');
    }
  }
}

import { api } from './api'
import type { SalesResponse, SalesQuery } from '../types/sales.types'

export class SalesService {
    private static readonly SALES_ENDPOINT = '/sales'

    static async getSales(query: SalesQuery, token: string): Promise<SalesResponse> {
        const params = new URLSearchParams()

        if (query.page) params.append('page', query.page.toString())
        if (query.perPage) params.append('perPage', query.perPage.toString())
        if (query.clientName) params.append('q', query.clientName) // Usar 'q' para busca por nome
        if (query.startDate) params.append('start', query.startDate)
        if (query.endDate) params.append('end', query.endDate)
        if (query.paymentStatus && query.paymentStatus !== 'ALL') {
            params.append('paymentStatus', query.paymentStatus)
        }

        const response = await api.authGet<SalesResponse>(`${this.SALES_ENDPOINT}?${params.toString()}`, token)
        return response
    }

    // Obter venda por ID
    static async getSaleById(id: string, token: string) {
        try {
            const response = await api.authGet(`${this.SALES_ENDPOINT}/${id}`, token)
            return response
        } catch (error) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error('Erro ao buscar venda')
        }
    }

    // Criar nova venda
    static async createSale(saleData: any, token: string): Promise<{ id: string }> {
        try {
            const response = await api.authPost<{ id: string }>(this.SALES_ENDPOINT, token, saleData)
            return response
        } catch (error) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error('Erro ao criar venda')
        }
    }

    // Atualizar venda
    static async updateSale(id: string, saleData: any, token: string) {
        try {
            const response = await api.authPut(`${this.SALES_ENDPOINT}/${id}`, token, saleData)
            return response
        } catch (error) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error('Erro ao atualizar venda')
        }
    }

    // Excluir venda
    static async deleteSale(id: string, token: string) {
        try {
            await api.authDelete(`${this.SALES_ENDPOINT}/${id}`, token)
            return true
        } catch (error) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error('Erro ao excluir venda')
        }
    }
}

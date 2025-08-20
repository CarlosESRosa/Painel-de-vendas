import { api } from './api'

export interface Product {
    id: string
    name: string
    sku: string
    price: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface ProductsResponse {
    items: Product[]
    page: number
    perPage: number
    total: number
    totalPages: number
}

export interface ProductsQuery {
    page: number
    perPage: number
    q?: string
    sku?: string
    isActive?: boolean
}

export class ProductsService {
    private static readonly PRODUCTS_ENDPOINT = '/products'

    static async getProducts(query: ProductsQuery, token: string): Promise<ProductsResponse> {
        const params = new URLSearchParams()

        if (query.page) params.append('page', query.page.toString())
        if (query.perPage) params.append('perPage', query.perPage.toString())
        if (query.q) params.append('q', query.q)
        if (query.sku) params.append('sku', query.sku)
        if (query.isActive !== undefined) params.append('isActive', query.isActive.toString())

        const response = await api.authGet<ProductsResponse>(`${this.PRODUCTS_ENDPOINT}?${params.toString()}`, token)
        return response
    }

    static async getProductById(id: string, token: string): Promise<Product> {
        try {
            const response = await api.authGet<Product>(`${this.PRODUCTS_ENDPOINT}/${id}`, token)
            return response
        } catch (error) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error('Erro ao buscar produto')
        }
    }
}

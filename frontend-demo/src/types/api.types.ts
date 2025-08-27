// Tipos da API de Autenticação
export interface SignInRequest {
    email: string
    password: string
}

export interface SignInResponse {
    access_token: string
}

export interface UserProfile {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'SELLER'
    status: string
}

// Tipos de erro da API
export interface ApiError {
    message: string
    statusCode?: number
    error?: string
}

// Tipos de resposta genérica da API
export interface ApiResponse<T> {
    data?: T
    message?: string
    success: boolean
}

// Tipos para paginação
export interface PaginationMeta {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: PaginationMeta
}

// Tipos para filtros e queries
export interface ListQuery {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

// Tipos para usuários
export interface User {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'SELLER'
    status: 'ACTIVE' | 'INACTIVE'
    createdAt?: string
    updatedAt?: string
}

// Tipos para clientes
export interface Client {
    id: string
    name: string
    email: string
    phone: string
    cpf: string
    status: 'ACTIVE' | 'INACTIVE'
    createdAt?: string
    updatedAt?: string
}

// Tipos para produtos
export interface Product {
    id: string
    name: string
    description?: string
    price: number
    stock: number
    status: 'ACTIVE' | 'INACTIVE'
    createdAt?: string
    updatedAt?: string
}

// Tipos para vendas
export interface Sale {
    id: string
    clientId: string
    clientName?: string
    total: number
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
    items: SaleItem[]
    createdAt?: string
    updatedAt?: string
}

export interface SaleItem {
    id: string
    productId: string
    productName?: string
    quantity: number
    price: number
    total: number
}

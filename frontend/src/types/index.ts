// Tipos para o projeto
export interface NavigationItem {
    name: string
    href: string
    icon: string
}

export interface User {
    id: string
    name: string
    email: string
    role: string
}

export interface Sale {
    id: string
    client: string
    product: string
    value: number
    status: 'completed' | 'pending' | 'cancelled'
    date: Date
}

export interface Client {
    id: string
    name: string
    email: string
    phone: string
    status: 'active' | 'inactive'
}

export interface Seller {
    id: string
    name: string
    email: string
    phone: string
    status: 'active' | 'inactive'
    salesCount: number
}

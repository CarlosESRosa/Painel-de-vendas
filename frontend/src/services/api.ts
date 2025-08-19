// TEMPORÁRIO: Arquivo aguardando instalação do axios
// Execute: npm install axios

import { API_CONFIG, getAuthHeaders } from '../config/api.config'

// Configuração da API
const API_BASE_URL = API_CONFIG.BASE_URL

// Função para fazer requisições HTTP com fetch (temporário)
const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
        headers: API_CONFIG.DEFAULT_HEADERS,
        credentials: 'include', // Importante para CORS
        ...options,
    }

    try {
        const response = await fetch(url, config)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error('Erro na requisição da API')
    }
}

// Função para requisições autenticadas
const authenticatedRequest = async <T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
): Promise<T> => {
    const config: RequestInit = {
        headers: getAuthHeaders(token),
        credentials: 'include', // Importante para CORS
        ...options,
    }

    return apiRequest<T>(endpoint, config)
}

export const api = {
    // Requisições públicas
    get: <T>(endpoint: string) => apiRequest<T>(endpoint),
    post: <T>(endpoint: string, data: any) => apiRequest<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    put: <T>(endpoint: string, data: any) => apiRequest<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: <T>(endpoint: string) => apiRequest<T>(endpoint, {
        method: 'DELETE',
    }),

    // Requisições autenticadas
    authGet: <T>(endpoint: string, token: string) => authenticatedRequest<T>(endpoint, token),
    authPost: <T>(endpoint: string, token: string, data: any) => authenticatedRequest<T>(endpoint, token, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    authPut: <T>(endpoint: string, token: string, data: any) => authenticatedRequest<T>(endpoint, token, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    authDelete: <T>(endpoint: string, token: string) => authenticatedRequest<T>(endpoint, token, {
        method: 'DELETE',
    }),
}

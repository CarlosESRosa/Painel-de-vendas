import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { API_CONFIG, getAuthHeaders } from '../config/api.config'

// Instância base do axios
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.DEFAULT_HEADERS,
    withCredentials: true, // Importante para CORS
})

// Interceptor para requisições
axiosInstance.interceptors.request.use(
    (config: any) => {
        // Log das requisições em desenvolvimento
        if (import.meta.env.DEV) {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        }
        return config
    },
    (error: any) => {
        return Promise.reject(error)
    }
)

// Interceptor para respostas
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log das respostas em desenvolvimento
        if (import.meta.env.DEV) {
            console.log(`✅ API Response: ${response.status} ${response.config.url}`)
        }
        return response.data
    },
    (error: any) => {
        // Tratamento de erros
        if (error.response) {
            // Erro da API com resposta
            const { status, data } = error.response
            const message = data?.message || `HTTP error! status: ${status}`

            if (import.meta.env.DEV) {
                console.error(`❌ API Error: ${status} ${error.config?.url}`, data)
            }

            throw new Error(message)
        } else if (error.request) {
            // Erro de rede (sem resposta)
            if (import.meta.env.DEV) {
                console.error('❌ Network Error:', error.message)
            }
            throw new Error('Erro de conexão com a API')
        } else {
            // Erro de configuração
            throw error
        }
    }
)

// Função para requisições autenticadas
const authenticatedRequest = async <T>(
    endpoint: string,
    token: string,
    config: any = {}
): Promise<T> => {
    const authConfig = {
        ...config,
        headers: {
            ...config.headers,
            ...getAuthHeaders(token),
        },
    }

    return axiosInstance.request<T>({
        url: endpoint,
        ...authConfig,
    }).then(response => response.data)
}

export const api = {
    // Requisições públicas
    get: <T>(endpoint: string, config?: any) =>
        axiosInstance.get<T>(endpoint, config),

    post: <T>(endpoint: string, data?: any, config?: any) =>
        axiosInstance.post<T>(endpoint, data, config),

    put: <T>(endpoint: string, data?: any, config?: any) =>
        axiosInstance.put<T>(endpoint, data, config),

    delete: <T>(endpoint: string, config?: any) =>
        axiosInstance.delete<T>(endpoint, config),

    // Requisições autenticadas
    authGet: <T>(endpoint: string, token: string, config?: any) =>
        authenticatedRequest<T>(endpoint, token, { ...config, method: 'GET' }),

    authPost: <T>(endpoint: string, token: string, data?: any, config?: any) =>
        authenticatedRequest<T>(endpoint, token, { ...config, method: 'POST', data }),

    authPut: <T>(endpoint: string, token: string, data?: any, config?: any) =>
        authenticatedRequest<T>(endpoint, token, { ...config, method: 'PUT', data }),

    authDelete: <T>(endpoint: string, token: string, config?: any) =>
        authenticatedRequest<T>(endpoint, token, { ...config, method: 'DELETE' }),
}

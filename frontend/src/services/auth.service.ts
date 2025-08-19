import { api } from './api'
import { API_CONFIG } from '../config/api.config'
import type { SignInRequest, SignInResponse, UserProfile } from '../types/api.types'

// Serviço de autenticação
export class AuthService {
    private static readonly AUTH_ENDPOINTS = {
        SIGNIN: API_CONFIG.ENDPOINTS.AUTH.SIGNIN,
        ME: API_CONFIG.ENDPOINTS.AUTH.ME,
    }

    // Fazer login
    static async signIn(credentials: SignInRequest): Promise<SignInResponse> {
        try {
            const response = await api.post<SignInResponse>(
                this.AUTH_ENDPOINTS.SIGNIN,
                credentials
            )
            return response
        } catch (error) {
            if (error instanceof Error) {
                // Mapear erros específicos da API
                if (error.message.includes('Invalid credentials')) {
                    throw new Error('Email ou senha inválidos')
                }
                if (error.message.includes('Unauthorized')) {
                    throw new Error('Credenciais inválidas')
                }
                throw error
            }
            throw new Error('Erro ao fazer login')
        }
    }

    // Obter perfil do usuário autenticado
    static async getProfile(token: string): Promise<UserProfile> {
        try {
            const response = await api.authGet<UserProfile>(
                this.AUTH_ENDPOINTS.ME,
                token
            )
            return response
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Unauthorized')) {
                    throw new Error('Token inválido ou expirado')
                }
                throw error
            }
            throw new Error('Erro ao obter perfil do usuário')
        }
    }

    // Validar token (verificar se ainda é válido)
    static async validateToken(token: string): Promise<boolean> {
        try {
            await this.getProfile(token)
            return true
        } catch (error) {
            return false
        }
    }
}

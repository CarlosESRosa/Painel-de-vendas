import { http } from '../api/http';
import { API_CONFIG } from '../config/api.config';
import type { SignInRequest, SignInResponse, UserProfile } from '../types/api.types';

// Serviço de autenticação
export class AuthService {
  private static readonly AUTH_ENDPOINTS = {
    SIGNIN: API_CONFIG.ENDPOINTS.AUTH.SIGNIN,
    ME: API_CONFIG.ENDPOINTS.AUTH.ME,
  };

  // Fazer login
  static async signIn(credentials: SignInRequest): Promise<SignInResponse> {
    try {
      const response = await http.post<SignInResponse>(this.AUTH_ENDPOINTS.SIGNIN, credentials);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        // Mapear erros específicos da API
        if (error.message.includes('Invalid credentials')) {
          throw new Error('Email ou senha inválidos');
        }
        if (error.message.includes('Unauthorized')) {
          throw new Error('Credenciais inválidas');
        }
        throw error;
      }
      throw new Error('Erro ao fazer login');
    }
  }

  // Obter perfil do usuário autenticado
  static async getProfile(): Promise<UserProfile> {
    try {
      const response = await http.get<UserProfile>(this.AUTH_ENDPOINTS.ME);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized')) {
          throw new Error('Token inválido ou expirado');
        }
        throw error;
      }
      throw new Error('Erro ao obter perfil do usuário');
    }
  }
}

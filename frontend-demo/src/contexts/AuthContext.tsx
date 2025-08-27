import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import { AuthService } from '../services/auth.service';
import type { UserProfile } from '../types/api.types';
import { clearAuthData, getAuthToken } from '../utils/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Chamada real para a API
      const response = await AuthService.signIn({ email, password });

      // Salvar token no sessionStorage (será limpo quando a aba for fechada)
      sessionStorage.setItem('access_token', response.access_token);

      // Obter perfil do usuário
      const userProfile = await AuthService.getProfile(response.access_token);

      // Converter para o formato interno
      const user: UserProfile = {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        status: userProfile.status,
      };

      setUser(user);
      sessionStorage.setItem('user', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error; // Re-throw para que o componente possa tratar o erro
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearAuthData();
  };

  // Verificar se há usuário salvo no sessionStorage ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = sessionStorage.getItem('user');
      const savedToken = getAuthToken();

      if (savedUser && savedToken) {
        try {
          // Verificar se o token ainda é válido
          const isValid = await AuthService.validateToken(savedToken);

          if (isValid) {
            setUser(JSON.parse(savedUser));
          } else {
            // Token expirado, limpar dados
            clearAuthData();
          }
        } catch (error) {
          console.error('Erro ao validar token:', error);
          clearAuthData();
        }
      }
    };

    initializeAuth();

    // Adicionar event listeners para limpar dados quando a aba for fechada ou atualizada
    const handleBeforeUnload = () => {
      // Limpar dados sensíveis antes de fechar/atualizar
      clearAuthData();
    };

    const handleVisibilityChange = () => {
      // Se a aba ficar oculta por muito tempo, considerar limpar dados
      if (document.hidden) {
        // Opcional: implementar timeout para limpar dados após período de inatividade
        console.log('Aba oculta - considerando limpeza de dados');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };

import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import { clearAuth, isAuthed, setAuth } from '../auth/storage';
import { AuthService } from '../services/auth.service';
import type { UserProfile } from '../types/api.types';

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
  const [isInitialized, setIsInitialized] = useState(false);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Chamada real para a API
      const response = await AuthService.signIn({ email, password });

      // Salvar token no localStorage com expiração
      setAuth(response.access_token);

      // Obter perfil do usuário
      const userProfile = await AuthService.getProfile();

      // Converter para o formato interno
      const user: UserProfile = {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        status: userProfile.status,
      };

      setUser(user);
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
    clearAuth();
  };

  // Verificar se há usuário salvo no localStorage ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthed()) {
        try {
          // Obter perfil do usuário para validar o token
          const userProfile = await AuthService.getProfile();
          const user: UserProfile = {
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            role: userProfile.role,
            status: userProfile.status,
          };
          setUser(user);
        } catch (error) {
          console.error('Erro ao validar token:', error);
          clearAuth();
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: isLoading || !isInitialized,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };

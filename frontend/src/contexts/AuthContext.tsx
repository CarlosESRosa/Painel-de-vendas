import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/auth.service';
import type { UserProfile } from '../types/api.types';

interface User extends UserProfile {
  // Mantendo compatibilidade com a interface existente
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  demoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Chamada real para a API
      const response = await AuthService.signIn({ email, password });

      // Salvar token no localStorage
      localStorage.setItem('access_token', response.access_token);

      // Obter perfil do usuário
      const userProfile = await AuthService.getProfile(response.access_token);

      // Converter para o formato interno
      const user: User = {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        status: userProfile.status,
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error; // Re-throw para que o componente possa tratar o erro
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = () => {
    const mockUser: User = {
      id: 'demo',
      name: 'Usuário Demo',
      email: 'demo@painel.com',
      role: 'ADMIN',
      status: 'ACTIVE',
    };

    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
  };

  // Verificar se há usuário salvo no localStorage ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('access_token');

      if (savedUser && savedToken) {
        try {
          // Verificar se o token ainda é válido
          const isValid = await AuthService.validateToken(savedToken);

          if (isValid) {
            setUser(JSON.parse(savedUser));
          } else {
            // Token expirado, limpar dados
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
          }
        } catch (error) {
          console.error('Erro ao validar token:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
        }
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    demoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

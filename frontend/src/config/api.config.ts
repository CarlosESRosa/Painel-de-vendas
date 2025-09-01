// Configurações da API
export const API_CONFIG = {
  // URL base da API
  BASE_URL: import.meta.env.PROD ? 'https://sua-api-producao.com' : 'http://localhost:3000',

  // Timeout das requisições (em ms)
  TIMEOUT: 10000,

  // Endpoints de autenticação
  ENDPOINTS: {
    AUTH: {
      SIGNIN: '/auth/signin',
      ME: '/auth/me',
    },
    USERS: {
      BASE: '/users',
    },
    CLIENTS: {
      BASE: '/clients',
    },
    SALES: {
      BASE: '/sales',
    },
    PRODUCTS: {
      BASE: '/products',
    },
  },

  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },

  // Configurações de retry
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
  },
} as const;

// Função para obter a URL completa de um endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Função para obter headers com token
export const getAuthHeaders = (token: string) => ({
  ...API_CONFIG.DEFAULT_HEADERS,
  Authorization: `Bearer ${token}`,
});

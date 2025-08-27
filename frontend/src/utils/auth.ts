// Utility functions for authentication
export const getAuthToken = (): string | null => {
  return sessionStorage.getItem('access_token');
};

export const clearAuthData = (): void => {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('user');
};

export const isTokenValid = (token: string | null): boolean => {
  return !!(token && token.trim().length > 0);
};

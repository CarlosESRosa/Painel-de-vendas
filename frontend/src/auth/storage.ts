export const AUTH_KEY = 'AUTH_TOKEN';

export type AuthRecord = {
  token: string;
  expiresAt: number;
};

export function setAuth(token: string, ttlMs = 60 * 60 * 1000): void {
  const authRecord: AuthRecord = {
    token,
    expiresAt: Date.now() + ttlMs,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(authRecord));
}

export function getAuth(): AuthRecord | null {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function isAuthed(): boolean {
  const auth = getAuth();
  return !!(auth?.token && auth.expiresAt > Date.now());
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}

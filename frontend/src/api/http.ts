import axios, { type AxiosInstance } from 'axios';
import { clearAuth, getAuth, isAuthed } from '../auth/storage';
import { API_CONFIG } from '../config/api.config';

let redirecting = false;

export const http: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
  withCredentials: true,
});

// Request interceptor - automatically attach token
http.interceptors.request.use(
  (config) => {
    if (isAuthed()) {
      const auth = getAuth();
      if (auth?.token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle auth errors globally
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Only handle 401/403 as auth failures
    if ((status === 401 || status === 403) && !redirecting) {
      redirecting = true;
      clearAuth();
      alert('Your session expired. Please log in again.');
      window.location.assign('/login');
    }

    return Promise.reject(error);
  },
);

import { api, setAuthToken } from './api';
import {
  saveToken,
  saveUser,
  getToken,
  clearAuthStorage,
} from '../storage/authStorage';

export async function login(email, password) {
  const response = await api.post('/api/auth/login', { email, password });
  const payload = response.data.data;
  const { user, token } = payload;

  saveToken(token);
  saveUser(user);
  setAuthToken(token);

  return { user, token };
}

export async function register(data) {
  const response = await api.post('/api/auth/register', data);
  const payload = response.data.data;
  const { user, token } = payload;

  saveToken(token);
  saveUser(user);
  setAuthToken(token);

  return { user, token };
}

export async function getMe() {
  const response = await api.get('/api/auth/me');
  return response.data.data.user;
}

export async function restoreSession() {
  const token = getToken();

  if (!token) {
    setAuthToken(null);
    return null;
  }

  try {
    setAuthToken(token);
    const user = await getMe();
    saveUser(user);
    return user;
  } catch {
    logout();
    return null;
  }
}

export function logout() {
  clearAuthStorage();
  setAuthToken(null);
}

export function getAuthErrorMessage(error) {
  if (error.code === 'ECONNABORTED') {
    return 'Tiempo de espera agotado. Inténtalo de nuevo.';
  }

  if (!error.response) {
    return 'No se pudo conectar con el servidor.';
  }

  const { status, data } = error.response;
  const backendMessage = data?.message;

  if (backendMessage) {
    return backendMessage;
  }

  if (status === 401 || status === 403) {
    return 'Credenciales incorrectas o sesión expirada.';
  }

  if (status >= 500) {
    return 'El servidor no está disponible en este momento.';
  }

  return 'Ocurrió un error inesperado.';
}

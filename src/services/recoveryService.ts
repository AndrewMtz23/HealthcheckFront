import {clearSession, sessionFetch} from '@/services/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
async function request(path: string, body: object, token?: string | null) {
  const response = await sessionFetch(`${API_URL}/auth/password/${path}`, {
    method: 'POST', headers: {'Content-Type':'application/json', ...(token ? {Authorization:`Bearer ${token}`} : {})},
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || 'No se pudo completar la solicitud. Intenta más tarde.');
  return result.message as string;
}
export const requestRecovery = (email: string) => request('forgot', {email});
export const resetPassword = (token: string, contrasena: string) => request('reset', {token, contrasena});
export async function changePassword(actual: string, contrasena: string) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Inicia sesión para cambiar tu contraseña.');
  const message = await request('change', {actual, contrasena}, token);
  if (localStorage.getItem('token') === token) clearSession('healthcheck:password-changed');
  return message;
}

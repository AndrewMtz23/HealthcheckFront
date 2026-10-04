// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Interfaces
export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  telefono?: string;
  fecha_registro?: string;
  ultima_conexion?: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

/**
 * Iniciar sesión con correo y contraseña
 */
export const login = async (email: string, contrasena: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, contrasena }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al iniciar sesión');
  }

  return data;
};

/**
 * Registrar un nuevo usuario
 */
export const register = async (
  email: string,
  nombre: string,
  contrasena: string,
  telefono?: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, nombre, contrasena, telefono }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al registrar usuario');
  }

  return data;
};

/**
 * Obtener el perfil del usuario autenticado
 */
export const getProfile = async (): Promise<User> => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener perfil');
  }

  return data.data.user;
};

/**
 * Actualizar el perfil del usuario
 */
export const updateProfile = async (updates: {
  nombre?: string;
  telefono?: string;
}): Promise<User> => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar perfil');
  }

  return data.data.user;
};

/**
 * Cerrar sesión
 */
export const logout = async (): Promise<void> => {
  const token = localStorage.getItem('token');

  // Limpiar almacenamiento local
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Notificar al servidor (opcional)
  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error al notificar logout al servidor:', error);
    }
  }
};

/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return localStorage.getItem('token') !== null;
};

/**
 * Obtener el usuario actual desde localStorage
 */
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return null;
  }
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error al parsear usuario:', error);
    return null;
  }
};

export default {
  login,
  register,
  getProfile,
  updateProfile,
  logout,
  isAuthenticated,
  getCurrentUser,
};
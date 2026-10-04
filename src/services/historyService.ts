// src/services/historyService.ts
import { NewsItem } from '@/types/news';

//const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';
const API_URL = 'http://localhost:3003/api';

export interface HistoryEntry {
  id: number;
  noticia_id: number;
  fecha_consulta: string;
  noticia: NewsItem;
}

export interface HistoryResponse {
  total: number;
  currentPage: number;
  totalPages: number;
  history: HistoryEntry[];
}

/**
 * Registra una consulta de noticia (De esto se encarga otro servicio ya)
 */

/**
 * Obtiene el historial de consultas del usuario
 */
export const getUserHistory = async (
  page: number = 1,
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<HistoryResponse> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    // Construir URL con parámetros de consulta
    let url = `${API_URL}/history?page=${page}&limit=${limit}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener historial');
    }

    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      return data.data as HistoryResponse;
    }
    
    throw new Error('Formato de respuesta inesperado');
  } catch (error) {
    console.error('Error al obtener historial:', error);
    throw error;
  }
};

/**
 * Elimina una entrada específica del historial
 */
export const deleteHistoryEntry = async (entryId: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    const response = await fetch(`${API_URL}/history/${entryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al eliminar entrada del historial');
    }
  } catch (error) {
    console.error('Error al eliminar entrada del historial:', error);
    throw error;
  }
};

/**
 * Elimina todo el historial de consultas
 */
export const clearHistory = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    const response = await fetch(`${API_URL}/history`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al limpiar historial');
    }
  } catch (error) {
    console.error('Error al limpiar historial:', error);
    throw error;
  }
};
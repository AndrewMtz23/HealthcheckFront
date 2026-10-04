import { NewsItem, UserInteraction } from '@/types/news';

const API_URL = 'http://localhost:3003/api';
const MICROLINK_API = 'https://api.microlink.io';

/**
 * Obtiene las noticias más recientes
 */
export const fetchRecentNews = async (limit: number = 6): Promise<NewsItem[]> => {
  try {
    const response = await fetch(`${API_URL}/news?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar noticias recientes');
    }
    
    const data = await response.json();
    
    if (data.status === 'success' && data.data && data.data.news) {
      return data.data.news;
    }
    
    throw new Error('Formato de respuesta inesperado');
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

/**
 * Busca noticias con múltiples filtros
 */
export const searchNews = async (
  query?: string, 
  clasificacion?: string, 
  page: number = 1,
  temaId?: number,
  fechaInicio?: string,
  fechaFin?: string,
  fuenteId?: number
): Promise<{
  news: NewsItem[];
  total: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    // Construir URL base
    let url = `${API_URL}/search?page=${page}&limit=12`;
    
    // Añadir parámetros opcionales
    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }
    
    if (clasificacion) {
      url += `&clasificacion=${clasificacion}`;
    }
    
    if (temaId) {
      url += `&temaId=${temaId}`;
    }
    
    if (fechaInicio) {
      url += `&fechaInicio=${encodeURIComponent(fechaInicio)}`;
    }
    
    if (fechaFin) {
      url += `&fechaFin=${encodeURIComponent(fechaFin)}`;
    }
    
    if (fuenteId) {
      url += `&fuenteId=${fuenteId}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Error en respuesta:', response.status, response.statusText);
      throw new Error(`Error al buscar noticias: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      return {
        news: data.data.results || [],
        total: data.data.total || 0,
        currentPage: data.data.currentPage || 1,
        totalPages: data.data.totalPages || 1
      };
    }
    
    throw new Error('Formato de respuesta inesperado');
  } catch (error) {
    console.error('Error searching news:', error);
    throw error;
  }
};

/**
 * Obtiene una noticia por su ID
 */
export const getNewsById = async (id: number): Promise<NewsItem> => {
  try {
    const response = await fetch(`${API_URL}/news/${id}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener la noticia');
    }
    
    const data = await response.json();
    
    if (data.status === 'success' && data.data && data.data.news) {
      return data.data.news;
    }
    
    throw new Error('Formato de respuesta inesperado');
  } catch (error) {
    console.error(`Error fetching news with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene previsualizaciones de URLs con Microlink
 */
export const getUrlPreview = async (url: string) => {
  try {
    const response = await fetch(`${MICROLINK_API}?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching preview for URL ${url}:`, error);
    return null;
  }
};

/**
 * Enriquece las noticias con previsualizaciones
 */
export const enrichNewsWithPreviews = async (newsItems: NewsItem[]): Promise<NewsItem[]> => {
  try {
    const itemsWithPreviews = await Promise.all(
      newsItems.map(async (item) => {
        if (item.url) {
          const preview = await getUrlPreview(item.url);
          if (preview) {
            return { ...item, preview };
          }
        }
        return item;
      })
    );
    
    return itemsWithPreviews;
  } catch (error) {
    console.error('Error enriching news with previews:', error);
    return newsItems; // Devolver las noticias originales en caso de error
  }
};

/**
 * Crea o actualiza una interacción con una noticia
 */
export const createInteraction = async (noticiaId: number, tipoInteraccion: string): Promise<{
  success: boolean;
  action?: 'created' | 'removed';
  message?: string;
}> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Usuario no autenticado');
    }
    
    const response = await fetch(`${API_URL}/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        noticia_id: noticiaId,
        tipo_interaccion: tipoInteraccion
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar interacción');
    }
    
    return {
      success: true,
      action: data.action,
      message: data.message
    };
  } catch (error) {
    console.error('Error creating interaction:', error);
    throw error;
  }
};

/**
 * Obtiene el estado de interacciones de un usuario con una noticia
 */
export const getInteractionStatus = async (noticiaId: number): Promise<{
  marcar_confiable: boolean;
  marcar_dudosa: boolean;
  compartir: boolean;
}> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Si no hay token, asumir que no hay interacciones
      return {
        marcar_confiable: false,
        marcar_dudosa: false,
        compartir: false
      };
    }
    
    const response = await fetch(`${API_URL}/interactions/${noticiaId}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener estado de interacciones');
    }
    
    const data = await response.json();
    
    if (data.status === 'success' && data.data && data.data.interactions) {
      return data.data.interactions;
    }
    
    throw new Error('Formato de respuesta inesperado');
  } catch (error) {
    console.error('Error fetching interaction status:', error);
    // En caso de error, asumir que no hay interacciones
    return {
      marcar_confiable: false,
      marcar_dudosa: false,
      compartir: false
    };
  }
};

/**
 * Obtiene interacciones para múltiples noticias
 */
export const getInteractionsForNews = async (newsItems: NewsItem[]): Promise<NewsItem[]> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token || newsItems.length === 0) {
      return newsItems;
    }
    
    // Obtener estado de interacción para cada noticia
    const newsWithInteractions = await Promise.all(
      newsItems.map(async (item) => {
        try {
          const interactions = await getInteractionStatus(item.id);
          return {
            ...item,
            userInteractions: interactions
          };
        } catch {
          // Si falla, devolver la noticia sin interacciones
          return item;
        }
      })
    );
    
    return newsWithInteractions;
  } catch (error) {
    console.error('Error getting interactions for news:', error);
    return newsItems;
  }
};

/**
 * Reporta una fuente
 */
export const reportSource = async (fuenteId: number, motivo: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Usuario no autenticado');
    }
    
    const response = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fuente_id: fuenteId,
        motivo
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al enviar reporte');
    }
    
    return {
      success: true,
      message: data.message || 'Reporte enviado correctamente'
    };
  } catch (error) {
    console.error('Error reporting source:', error);
    throw error;
  }
};

// Función adicional para obtener temas disponibles
export const fetchTemas = async () => {
  try {
    const response = await fetch(`${API_URL}/temas`);
    
    if (!response.ok) {
      throw new Error('Error al cargar temas');
    }
    
    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      return data.data;
    }
    
    throw new Error('Formato de respuesta inesperado');
  } catch (error) {
    console.error('Error fetching temas:', error);
    throw error;
  }
};

// Función adicional para obtener fuentes disponibles
export const fetchFuentes = async () => {
  try {
    const response = await fetch(`${API_URL}/fuentes`);
    
    if (!response.ok) {
      throw new Error('Error al cargar fuentes');
    }
    
    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      return data.data;
    }
    
    throw new Error('Formato de respuesta inesperado');
  } catch (error) {
    console.error('Error fetching fuentes:', error);
    throw error;
  }
};

// Actualización para getInteractionCounts en newsService.ts
export const getInteractionCounts = async (noticiaId: number): Promise<{
  likes: number;
  dislikes: number;
  shares: number;
}> => {
  try {
    const token = localStorage.getItem('token');
    
    // Si no hay token (usuario no logueado), hacer la solicitud sin autorización
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/interactions/${noticiaId}/counts`, {
      headers
    });
    
    // Si hay un error en la respuesta, devolver conteo vacío en lugar de lanzar error
    if (!response.ok) {
      console.error('Error en respuesta de API:', response.status, response.statusText);
      return { 
        likes: 0, 
        dislikes: 0, 
        shares: 0 
      };
    }
    
    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      return {
        likes: data.data.likes || 0,
        dislikes: data.data.dislikes || 0,
        shares: data.data.shares || 0
      };
    }
    
    return { 
      likes: 0, 
      dislikes: 0, 
      shares: 0 
    };
  } catch (error) {
    console.error('Error fetching interaction counts:', error);
    return { 
      likes: 0, 
      dislikes: 0, 
      shares: 0 
    };
  }
};
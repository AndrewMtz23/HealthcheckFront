// src/services/notificationsService.ts

// Definición de tipos
export interface Notification {
    id: number;
    titulo: string;
    mensaje: string;
    tipo: 'email' | 'sms';
    enviada: boolean;
    fecha_creacion: string;
    fecha_envio: string | null;
    noticia_id: number | null;
    noticia_titulo?: string;
  }
  
  // URL base de la API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api';
  
  /**
   * Obtiene las notificaciones del usuario
   * @param userId ID del usuario
   * @returns Lista de notificaciones del usuario
   */
  export const getUserNotifications = async (userId: number): Promise<Notification[]> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await fetch(`${API_URL}/notifications/notifications/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener notificaciones');
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error desconocido al obtener notificaciones');
    }
  };
  
  /**
   * Marca una notificación como leída
   * @param userId ID del usuario
   * @param notificationId ID de la notificación
   * @returns true si se marcó correctamente
   */
  export const markNotificationAsRead = async (userId: number, notificationId: number): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await fetch(`${API_URL}/notifications/notifications/${userId}/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al marcar notificación como leída');
      }
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error desconocido al marcar notificación como leída');
    }
  };
  
  /**
   * Elimina una notificación
   * @param userId ID del usuario
   * @param notificationId ID de la notificación
   * @returns true si se eliminó correctamente
   */
  export const deleteNotification = async (userId: number, notificationId: number): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await fetch(`${API_URL}/notifications/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar notificación');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error desconocido al eliminar notificación');
    }
  };
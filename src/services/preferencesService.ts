// src/services/preferencesService.ts

// Definición de tipos
export interface UserPreferences {
    id: number;
    recibir_notificaciones: boolean;
    frecuencia_notificaciones: 'diaria' | 'semanal' | 'inmediata';
    tipo_notificacion: 'email' | 'sms';
  }
  
  export interface UserTopic {
    id: number;
    tema_id: number;
    tema_nombre: string;
  }
  
  export interface Topic {
    id: number;
    nombre: string;
    descripcion: string;
  }
  
  export interface PreferencesResponse {
    preferences: UserPreferences;
    topics: UserTopic[];
  }
  
  // URL base de la API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api';
  
  // Endpoints
  const ENDPOINTS = {
    preferences: (userId: number) => `${API_URL}/notifications/preferences/${userId}`,
    topics: (userId: number) => `${API_URL}/notifications/preferences/${userId}/topics`,
    topic: (userId: number, topicId: number) => `${API_URL}/notifications/preferences/${userId}/topics/${topicId}`,
    allTopics: `${API_URL}/notifications/preferences/topics/all`
  };
  
  /**
   * Obtiene las preferencias y temas del usuario
   * @param userId ID del usuario
   * @returns Objeto con preferencias y temas del usuario
   */
  export const getUserPreferences = async (userId: number): Promise<PreferencesResponse> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await fetch(ENDPOINTS.preferences(userId), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener preferencias');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error desconocido al obtener preferencias');
    }
  };
  
  /**
   * Actualiza las preferencias del usuario
   * @param userId ID del usuario
   * @param preferences Objeto con las preferencias a actualizar
   * @returns Objeto con las preferencias actualizadas
   */
  export const updateUserPreferences = async (
    userId: number, 
    preferences: {
      recibir_notificaciones: boolean;
      frecuencia_notificaciones: 'diaria' | 'semanal' | 'inmediata';
      tipo_notificacion: 'email' | 'sms';
    }
  ): Promise<UserPreferences> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await fetch(ENDPOINTS.preferences(userId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar preferencias');
      }
      
      const data = await response.json();
      return data.preferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error desconocido al actualizar preferencias');
    }
  };
  
  /**
   * Obtiene todos los temas disponibles
   * @returns Lista de todos los temas
   */
  export const getAllTopics = async (): Promise<Topic[]> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await fetch(ENDPOINTS.allTopics, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener temas');
      }
      
      const data = await response.json();
      return data.topics || [];
    } catch (error) {
      console.error('Error fetching all topics:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error desconocido al obtener temas');
    }
  };
  
  /**
   * Añade un tema de interés al usuario
   * @param userId ID del usuario
   * @param topicId ID del tema a añadir
   * @returns Objeto con información del tema añadido
   */
  export const addUserTopic = async (userId: number, topicId: number): Promise<UserTopic> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await fetch(ENDPOINTS.topics(userId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tema_id: topicId })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al añadir tema');
      }
      
      const data = await response.json();
      return data.topic;
    } catch (error) {
      console.error('Error adding user topic:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error desconocido al añadir tema');
    }
  };
  
  /**
   * Elimina un tema de interés del usuario
   * @param userId ID del usuario
   * @param topicId ID del tema a eliminar
   * @returns true si se eliminó correctamente
   */
  export const removeUserTopic = async (userId: number, topicId: number): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await fetch(ENDPOINTS.topic(userId, topicId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar tema');
      }
      
      return true;
    } catch (error) {
      console.error('Error removing user topic:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error desconocido al eliminar tema');
    }
  };
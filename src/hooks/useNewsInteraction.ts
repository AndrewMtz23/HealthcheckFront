// src/hooks/useNewsInteraction.ts
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// Definimos la URL base de la API Gateway
const API_URL = 'http://localhost:3003/api';

type InteractionType = 'marcar_confiable' | 'marcar_dudosa' | 'compartir';

export const useNewsInteraction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const createInteraction = async (noticiaId: number, tipo: InteractionType) => {
    if (!user) {
      setError('Debes iniciar sesión para interactuar con noticias');
      return false;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          noticia_id: noticiaId,
          tipo_interaccion: tipo
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar interacción');
      }

      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Error en interacción:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    createInteraction
  };
};
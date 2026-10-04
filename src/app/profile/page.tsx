'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/services/authService';
import { 
  getUserPreferences, 
  updateUserPreferences, 
  UserPreferences,
  UserTopic,
  Topic,
  getAllTopics,
  addUserTopic,
  removeUserTopic
} from '@/services/preferencesService';
import {
  Notification as UserNotification,
  getUserNotifications,
  deleteNotification
} from '@/services/notificationsService';
import Link from 'next/link';

const ProfilePage = () => {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  
  // Estados para gestionar los datos y la interfaz
  const [activeTab, setActiveTab] = useState('general');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Estado para preferencias y temas
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [userTopics, setUserTopics] = useState<UserTopic[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<number | ''>('');
  
  // Estado para notificaciones
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      // Inicializar formulario con datos del usuario
      setName(user.nombre || '');
      setPhone(user.telefono || '');
      
      // Cargar preferencias del usuario
      loadUserPreferences();
    }
  }, [loading, user, router]);
  
  // Cargar notificaciones cuando se activa la pestaña
  useEffect(() => {
    if (activeTab === 'notifications' && user?.id) {
      loadUserNotifications();
    }
  }, [activeTab, user?.id]);
  
  // Función para cargar las preferencias del usuario
  const loadUserPreferences = async () => {
    if (!user?.id) return;
    
    try {
      setPreferencesLoading(true);
      const data = await getUserPreferences(user.id);
      setPreferences(data.preferences);
      setUserTopics(data.topics || []);
    } catch (error) {
      console.error('Error loading preferences:', error);
      // No mostramos mensaje de error aquí para no distraer al usuario
      // cuando está en otra pestaña
    } finally {
      setPreferencesLoading(false);
    }
  };
  
  // Función para cargar todos los temas disponibles
  const loadAllTopics = async () => {
    try {
      setTopicsLoading(true);
      const topics = await getAllTopics();
      setAllTopics(topics);
    } catch (error) {
      console.error('Error loading all topics:', error);
      // No mostramos mensaje de error aquí para no distraer al usuario
    } finally {
      setTopicsLoading(false);
    }
  };
  
  // Función para cargar las notificaciones del usuario
  const loadUserNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setNotificationsLoading(true);
      const data = await getUserNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // No mostramos mensaje de error aquí para no distraer al usuario
    } finally {
      setNotificationsLoading(false);
    }
  };
  
  // Cargar todos los temas cuando se activa la pestaña de temas
  useEffect(() => {
    if (activeTab === 'topics' && allTopics.length === 0) {
      loadAllTopics();
    }
  }, [activeTab, allTopics.length]);

  // Función para actualizar perfil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const updatedUser = await updateProfile({
        nombre: name,
        telefono: phone,
      });

      // Actualizar el usuario en el contexto
      updateUser(updatedUser);
      
      setMessage({
        text: 'Perfil actualizado correctamente',
        type: 'success',
      });
      
      // Cerrar automáticamente el mensaje después de 5 segundos
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Error al actualizar perfil',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para actualizar preferencias
  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !preferences) return;
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const updatedPreferences = await updateUserPreferences(user.id, {
        recibir_notificaciones: preferences.recibir_notificaciones,
        frecuencia_notificaciones: preferences.frecuencia_notificaciones,
        tipo_notificacion: preferences.tipo_notificacion
      });
      
      setPreferences(updatedPreferences);
      
      setMessage({
        text: 'Preferencias actualizadas correctamente',
        type: 'success',
      });
      
      // Cerrar automáticamente el mensaje después de 5 segundos
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Error al actualizar preferencias',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para añadir un tema
  const handleAddTopic = async () => {
    if (!user?.id || !selectedTopic) return;
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      await addUserTopic(user.id, Number(selectedTopic));
      
      // Recargar los temas del usuario
      const data = await getUserPreferences(user.id);
      setUserTopics(data.topics || []);
      
      // Resetear el selector
      setSelectedTopic('');
      
      setMessage({
        text: 'Tema añadido correctamente',
        type: 'success',
      });
      
      // Cerrar automáticamente el mensaje después de 5 segundos
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Error al añadir tema',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para eliminar un tema
  const handleRemoveTopic = async (topicId: number) => {
    if (!user?.id) return;
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      await removeUserTopic(user.id, topicId);
      
      // Actualizar la lista de temas del usuario
      setUserTopics(userTopics.filter(topic => topic.tema_id !== topicId));
      
      setMessage({
        text: 'Tema eliminado correctamente',
        type: 'success',
      });
      
      // Cerrar automáticamente el mensaje después de 5 segundos
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Error al eliminar tema',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para eliminar una notificación
  const handleDeleteNotification = async (notificationId: number) => {
    if (!user?.id) return;
    
    try {
      await deleteNotification(user.id, notificationId);
      
      // Actualizar la lista de notificaciones
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
      
      setMessage({
        text: 'Notificación eliminada',
        type: 'success',
      });
      
      // Cerrar automáticamente el mensaje después de 5 segundos
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Error al eliminar notificación',
        type: 'error',
      });
    }
  };
  
// Función mejorada para formatear fecha sin bibliotecas externas
const formatDate = (dateString: string): string => {
  try {
    // Crear objeto Date a partir del string
    const utcDate = new Date(dateString);
    
    // Ajustar a zona horaria de México (UTC-6)
    // Nota: Este método es simple pero no maneja cambios de horario de verano
    const mexicoOffset = -6 * 60 * 60 * 1000; // -6 horas en milisegundos
    const mexicoDate = new Date(utcDate.getTime() + mexicoOffset);
    
    // Formatear la fecha manualmente
    const day = mexicoDate.getDate();
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const month = monthNames[mexicoDate.getMonth()];
    const year = mexicoDate.getFullYear();
    
    // Formatear hora (con formato 12 horas)
    let hours = mexicoDate.getHours();
    const minutes = mexicoDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12;
    hours = hours ? hours : 12; // La hora '0' debe ser '12'
    const formattedHours = hours.toString().padStart(2, '0');
    
    // Combinar todo en un formato legible
    return `${day} de ${month} de ${year}, ${formattedHours}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha desconocida';
  }
};

  // Función para obtener la inicial del usuario (para mostrar en avatar)
  const getUserInitial = () => {
    if (user?.nombre) {
      return user.nombre.charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          {/* Barra lateral */}
          <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            {/* Información del usuario */}
            <div className="mb-6 flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <span className="text-lg font-medium">{getUserInitial()}</span>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">{user?.nombre || 'Usuario'}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('general')}
                className={`group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full ${
                  activeTab === 'general'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                aria-current={activeTab === 'general' ? 'page' : undefined}
              >
                <svg
                  className={`flex-shrink-0 -ml-1 mr-3 h-6 w-6 ${
                    activeTab === 'general' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="truncate">Información General</span>
              </button>

              <button
                onClick={() => setActiveTab('preferences')}
                className={`group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full ${
                  activeTab === 'preferences'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                aria-current={activeTab === 'preferences' ? 'page' : undefined}
              >
                <svg
                  className={`flex-shrink-0 -ml-1 mr-3 h-6 w-6 ${
                    activeTab === 'preferences' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="truncate">Preferencias</span>
              </button>

              <button
                onClick={() => setActiveTab('topics')}
                className={`group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full ${
                  activeTab === 'topics'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                aria-current={activeTab === 'topics' ? 'page' : undefined}
              >
                <svg
                  className={`flex-shrink-0 -ml-1 mr-3 h-6 w-6 ${
                    activeTab === 'topics' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="truncate">Temas de Interés</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                aria-current={activeTab === 'notifications' ? 'page' : undefined}
              >
                <svg
                  className={`flex-shrink-0 -ml-1 mr-3 h-6 w-6 ${
                    activeTab === 'notifications' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="truncate">Notificaciones</span>
              </button>
              
              <div className="pt-6">
                <Link
                  href="/dashboard"
                  className="group rounded-md px-3 py-2 flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full"
                >
                  <svg
                    className="flex-shrink-0 -ml-1 mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span className="truncate">Volver al Dashboard</span>
                </Link>
              </div>
            </nav>
          </aside>

          {/* Contenido principal */}
          <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
            {message && (
              <div
                className={`mb-4 p-4 rounded-md ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                } relative`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {message.type === 'success' ? (
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{message.text}</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="absolute top-4 right-4"
                  onClick={() => setMessage(null)}
                  aria-label="Cerrar"
                >
                  <svg className="h-4 w-4 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {/* Panel de información general */}
            {activeTab === 'general' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Información personal</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Actualiza tu información personal y de contacto.</p>
                  </div>
                  <form onSubmit={handleUpdateProfile} className="mt-5 space-y-6">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          El correo electrónico no se puede cambiar.
                        </p>
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="+52 123 456 7890"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Fecha de registro
                        </label>
                        <input
                          type="text"
                          value={user?.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString('es-ES') : ''}
                          disabled
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Panel de preferencias */}
            {activeTab === 'preferences' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Preferencias de notificaciones</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Configura cómo y con qué frecuencia deseas recibir notificaciones sobre noticias falsas y verificación de información.</p>
                  </div>
                  
                  {preferencesLoading ? (
                    <div className="mt-5 flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : preferences ? (
                    <form onSubmit={handleUpdatePreferences} className="mt-5 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="receive_notifications"
                              name="receive_notifications"
                              type="checkbox"
                              checked={preferences.recibir_notificaciones}
                              onChange={(e) => setPreferences({
                                ...preferences,
                                recibir_notificaciones: e.target.checked
                              })}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="receive_notifications" className="font-medium text-gray-700">
                              Recibir notificaciones
                            </label>
                            <p className="text-gray-500">Activa esta opción para recibir notificaciones sobre noticias verificadas.</p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                            Frecuencia de notificaciones
                          </label>
                          <select
                            id="frequency"
                            name="frequency"
                            value={preferences.frecuencia_notificaciones}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              frecuencia_notificaciones: e.target.value as 'diaria' | 'semanal' | 'inmediata'
                            })}
                            disabled={!preferences.recibir_notificaciones}
                            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                              !preferences.recibir_notificaciones ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="inmediata">Inmediata</option>
                            <option value="diaria">Diaria</option>
                            <option value="semanal">Semanal</option>
                          </select>
                          <p className="mt-1 text-xs text-gray-500">
                            {preferences.frecuencia_notificaciones === 'inmediata' 
                              ? 'Recibirás notificaciones tan pronto como se detecte una noticia relevante.' 
                              : preferences.frecuencia_notificaciones === 'diaria' 
                                ? 'Recibirás un resumen diario de noticias relevantes.' 
                                : 'Recibirás un resumen semanal de noticias relevantes.'}
                          </p>
                        </div>

                        <div className="mt-4">
                          <label htmlFor="notification_type" className="block text-sm font-medium text-gray-700">
                            Tipo de notificación
                          </label>
                          <select
                            id="notification_type"
                            name="notification_type"
                            value={preferences.tipo_notificacion}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              tipo_notificacion: e.target.value as 'email' | 'sms'
                            })}
                            disabled={!preferences.recibir_notificaciones}
                            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                              !preferences.recibir_notificaciones ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="email">Correo electrónico</option>
                            <option value="sms">SMS</option>
                          </select>
                          {preferences.tipo_notificacion === 'sms' && !phone && (
                            <p className="mt-2 text-sm text-yellow-600">
                              Para recibir notificaciones por SMS, debes agregar un número de teléfono en tu perfil.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isSubmitting ? 'Guardando...' : 'Guardar preferencias'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-5 p-4 bg-red-50 text-red-700 rounded-md">
                      <p>No se pudieron cargar las preferencias. Intenta recargar la página.</p>
                      <button 
                        onClick={loadUserPreferences}
                        className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                      >
                        Reintentar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel de temas de interés */}
            {activeTab === 'topics' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Temas de interés</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Selecciona los temas sobre los que deseas recibir información y notificaciones.</p>
                  </div>
                  
                  <div className="mt-5 space-y-6">
                    {/* Temas actuales del usuario */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Mis temas</h4>
                      <div className="mt-2">
                        {topicsLoading ? (
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                            <span>Cargando temas...</span>
                          </div>
                        ) : userTopics.length === 0 ? (
                          <p className="text-sm text-gray-500">No has seleccionado ningún tema de interés.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {userTopics.map((topic) => (
                              <div key={topic.id} className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                <span>{topic.tema_nombre}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTopic(topic.tema_id)}
                                  disabled={isSubmitting}
                                  className={`ml-2 flex-shrink-0 inline-flex text-blue-400 hover:text-blue-600 focus:outline-none ${
                                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Agregar nuevo tema */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Agregar tema</h4>
                      <div className="mt-2 flex space-x-2">
                        <select
                          value={selectedTopic}
                          onChange={(e) => setSelectedTopic(e.target.value ? parseInt(e.target.value) : '')}
                          disabled={topicsLoading || isSubmitting}
                          className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                            topicsLoading || isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="">Selecciona un tema</option>
                          {allTopics
                            .filter(topic => !userTopics.some(userTopic => userTopic.tema_id === topic.id))
                            .map(topic => (
                              <option key={topic.id} value={topic.id}>
                                {topic.nombre}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleAddTopic}
                          disabled={!selectedTopic || isSubmitting}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            !selectedTopic || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center">
                              <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              <span>Agregando...</span>
                            </div>
                          ) : 'Agregar'}
                        </button>
                      </div>
                      {allTopics
                        .filter(topic => selectedTopic === topic.id)
                        .map(topic => (
                          <p key={topic.id} className="mt-2 text-sm text-gray-500">
                            {topic.descripcion || 'Sin descripción disponible.'}
                          </p>
                        ))}
                        
                      {/* Explicación para el usuario */}
                      <div className="mt-4 bg-blue-50 p-3 rounded-md">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3 text-sm text-blue-700">
                            <p>
                              Los temas que selecciones se utilizarán para personalizar las noticias que se muestran y las notificaciones que recibes. Puedes añadir o eliminar temas en cualquier momento.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Panel de notificaciones */}
            {activeTab === 'notifications' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Historial de notificaciones</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Revisa las notificaciones que has recibido sobre verificación de noticias.</p>
                  </div>
                  
                  <div className="mt-5">
                    {notificationsLoading ? (
                      <div className="flex justify-center my-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <h3 className="mt-2 text-gray-900 text-sm font-medium">No tienes notificaciones</h3>
                        <p className="mt-1 text-gray-500 text-sm">Las notificaciones sobre noticias verificadas aparecerán aquí.</p>
                      </div>
                    ) : (
                      <div className="flow-root">
                        <ul className="-my-5 divide-y divide-gray-200">
                          {notifications.map((notification) => (
                            <li key={notification.id} className="py-5">
                              <div className="relative focus-within:ring-2 focus-within:ring-blue-500">
                                <div className="flex justify-between items-start">
                                  <h4 className="text-sm font-semibold text-gray-900">
                                    {notification.titulo}
                                  </h4>
                                  <button
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
                                    title="Eliminar notificación"
                                  >
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                  {notification.mensaje}
                                </p>
                                {notification.noticia_id && (
                                  <Link
                                    href={`/news/${notification.noticia_id}`}
                                    className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                                  >
                                    Ver noticia
                                    <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </Link>
                                )}
                                <div className="mt-2 flex justify-between text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <span>{formatDate(notification.fecha_creacion)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    <span>{notification.tipo === 'email' ? 'Correo electrónico' : 'SMS'}</span>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        
                        {notifications.length > 0 && (
                          <div className="mt-6 text-center">
                            <button
                              type="button"
                              onClick={() => loadUserNotifications()}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                              </svg>
                              Actualizar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Definimos la URL base de la API Gateway
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Model {
  id: number;
  nombre: string;
  version: string;
  precision: number | null;
  recall: number | null;
  f1_score: number | null;
  fecha_entrenamiento: string | null;
  activo: boolean;
  modelo_base: number | null;
}

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('models'); // 'models', 'scraping', 'stats'
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.rol !== 'admin') {
        router.push('/'); // Redirigir a la página principal si no es admin
      } else {
        // Cargar modelos cuando el usuario es admin
        fetchModels();
      }
    }
  }, [loading, user, router]);

  const fetchModels = async () => {
    try {
      setLoadingModels(true);
      setError(null);

      const response = await fetch(`${API_URL}/ml/train/models`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los modelos');
      }

      const data = await response.json();
      setModels(data.models || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching models:', err);
    } finally {
      setLoadingModels(false);
    }
  };

  const activateModel = async (modelId: number) => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`${API_URL}/ml/train/models/${modelId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al activar el modelo');
      }

      const data = await response.json();
      setSuccess(`Modelo ID ${modelId} activado correctamente`);
      
      // Actualizar la lista de modelos
      await fetchModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error activating model:', err);
    }
  };

  const deleteModel = async (modelId: number) => {
    if (!confirm('¿Estás seguro de eliminar este modelo? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`${API_URL}/ml/train/models/${modelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el modelo');
      }

      const data = await response.json();
      setSuccess(`Modelo ID ${modelId} eliminado correctamente`);
      
      // Actualizar la lista de modelos
      await fetchModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error deleting model:', err);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatMetric = (value: number | null) => {
    if (value === null) return 'N/A';
    return (value * 100).toFixed(2) + '%';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona modelos de IA, configuración y datos del sistema
            </p>
          </div>

          {/* Tabs navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('models')}
                className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'models'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Modelos de IA
              </button>
              <button
                onClick={() => setActiveTab('scraping')}
                className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'scraping'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Obtención de Datos
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'stats'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Estadísticas
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 text-green-700 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Models tab */}
            {activeTab === 'models' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Modelos de IA</h2>
                  <Link
                    href="/admin/train-model"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Entrenar nuevo modelo
                  </Link>
                </div>

                {loadingModels ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : models.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay modelos disponibles.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Versión
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Precisión
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Recall
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            F1-Score
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha de Entrenamiento
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {models.map((model) => (
                          <tr key={model.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{model.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{model.nombre}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{model.version}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatMetric(model.precision)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatMetric(model.recall)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatMetric(model.f1_score)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(model.fecha_entrenamiento)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {model.activo ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Activo
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Inactivo
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {!model.activo && (
                                <button
                                  onClick={() => activateModel(model.id)}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                >
                                  Activar
                                </button>
                              )}
                              {!model.activo && model.modelo_base !== null && (
                                <button
                                  onClick={() => deleteModel(model.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Eliminar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Scraping tab */}
            {activeTab === 'scraping' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Obtención de Datos</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Google News</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Obtener noticias de Google News sobre temas de salud para analizar y entrenar el modelo.
                    </p>
                    <Link
                      href="/admin/scrape-google"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Configurar obtención
                    </Link>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Twitter</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Obtener tweets relacionados con temas de salud para analizar y entrenar el modelo.
                    </p>
                    <Link
                      href="/admin/scrape-twitter"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Configurar obtención
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Stats tab */}
            {activeTab === 'stats' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Estadísticas del Sistema</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Visualiza los datos sobre el uso y rendimiento del sistema.
                  </p>
                </div>
                
                <Link
                  href="/admin/stats"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Ver estadísticas detalladas
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
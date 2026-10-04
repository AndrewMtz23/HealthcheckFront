'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Definimos la URL base de la API Gateway
const API_URL = 'http://localhost:3003/api';

interface StatisticsData {
  classificationStats: Array<{
    clasificacion: string;
    total: number;
  }>;
  topicStats: Array<{
    tema: string;
    total: number;
  }>;
  sourceStats: Array<{
    fuente: string;
    total: number;
  }>;
  monthlyTrend: Array<{
    mes: string;
    total: number;
  }>;
}

const AdminStatsPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!loading && (!user || user.rol !== 'admin')) {
      router.push('/');
    } else if (user && user.rol === 'admin') {
      fetchStats();
    }
  }, [loading, user, router]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/news/stats/general`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }

      const data = await response.json();
      if (data.status === 'success' && data.data) {
        setStats(data.data);
      } else {
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Estadísticas del Sistema</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Visualiza datos sobre el uso y rendimiento de la plataforma
                </p>
              </div>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Volver
              </Link>
            </div>
          </div>

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

            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Clasificación de Noticias */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Clasificación</h3>
                  <div className="space-y-4">
                    {stats.classificationStats && stats.classificationStats.length > 0 ? (
                      stats.classificationStats.map((stat, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {stat.clasificacion}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{stat.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                stat.clasificacion === 'verdadera' 
                                  ? 'bg-green-600' 
                                  : stat.clasificacion === 'falsa' 
                                    ? 'bg-red-600' 
                                    : 'bg-yellow-500'
                              }`}
                              style={{ 
                                width: `${(stat.total / stats.classificationStats.reduce((sum, s) => sum + s.total, 0)) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No hay datos de clasificación disponibles</p>
                    )}
                  </div>
                </div>

                {/* Temas */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Tema</h3>
                  <div className="space-y-4">
                    {stats.topicStats && stats.topicStats.length > 0 ? (
                      stats.topicStats.slice(0, 5).map((stat, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">{stat.tema}</span>
                            <span className="text-sm font-medium text-gray-900">{stat.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ 
                                width: `${(stat.total / stats.topicStats.reduce((sum, s) => sum + s.total, 0)) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No hay datos de temas disponibles</p>
                    )}
                  </div>
                </div>

                {/* Fuentes */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Fuentes Principales</h3>
                  <div className="space-y-4">
                    {stats.sourceStats && stats.sourceStats.length > 0 ? (
                      stats.sourceStats.slice(0, 5).map((stat, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">{stat.fuente}</span>
                            <span className="text-sm font-medium text-gray-900">{stat.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-purple-600 h-2.5 rounded-full"
                              style={{ 
                                width: `${(stat.total / stats.sourceStats.reduce((sum, s) => sum + s.total, 0)) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No hay datos de fuentes disponibles</p>
                    )}
                  </div>
                </div>

                {/* Tendencia Mensual */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tendencia Mensual</h3>
                  {stats.monthlyTrend && stats.monthlyTrend.length > 0 ? (
                    <div className="h-64 flex items-end space-x-2">
                      {stats.monthlyTrend.slice(0, 6).map((stat, index) => {
                        const maxValue = Math.max(...stats.monthlyTrend.map(s => s.total));
                        const heightPercentage = (stat.total / maxValue) * 100;
                        return (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div 
                              className="w-full bg-indigo-500 rounded-t-md"
                              style={{ height: `${heightPercentage}%` }}
                            ></div>
                            <div className="text-xs text-gray-500 mt-2 w-full text-center truncate" title={stat.mes}>
                              {stat.mes.substring(5)} {/* Mostrar solo el mes */}
                            </div>
                            <div className="text-xs font-medium mt-1">{stat.total}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No hay datos de tendencias mensuales disponibles</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No hay estadísticas disponibles.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsPage;
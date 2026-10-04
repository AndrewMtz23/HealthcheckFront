'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  getUserHistory, 
  deleteHistoryEntry, 
  clearHistory, 
  HistoryEntry 
} from '@/services/historyService';
import { Calendar, Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Estados para el historial y paginación
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Cargar historial cuando cambian los parámetros
  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, currentPage]);

  // Función para cargar el historial
  const loadHistory = async () => {
    if (!user) return;

    try {
      setHistoryLoading(true);
      setError(null);

      const response = await getUserHistory(currentPage, 10, startDate, endDate);
      
      setHistory(response.history);
      setTotalItems(response.total);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el historial');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Función para aplicar filtros
  const applyFilters = () => {
    setCurrentPage(1);
    loadHistory();
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    loadHistory();
  };

  // Función para eliminar una entrada del historial
  const handleDeleteEntry = async (entryId: number) => {
    if (!user || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteHistoryEntry(entryId);
      
      // Actualizar la lista sin recargar de la API
      setHistory(history.filter(entry => entry.id !== entryId));
      setTotalItems(prev => prev - 1);
      
      // Si se eliminó el último elemento de la página actual y no es la primera página
      if (history.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Recargar la página actual
        loadHistory();
      }
    } catch (err) {
      console.error('Error eliminando entrada:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar la entrada');
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para limpiar todo el historial
  const handleClearHistory = async () => {
    if (!user || isDeleting) return;

    try {
      setIsDeleting(true);
      await clearHistory();
      
      // Actualizar estados
      setHistory([]);
      setTotalItems(0);
      setCurrentPage(1);
      setTotalPages(1);
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Error eliminando historial:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar el historial');
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener ícono según clasificación
  const getClassificationIcon = (classifications: any[] | undefined) => {
    if (!classifications || classifications.length === 0) {
      return <Info className="h-5 w-5 text-gray-400" />;
    }

    const classification = classifications[0];

    switch (classification.resultado) {
      case 'verdadera':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'falsa':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'dudosa':
        return <Info className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-400" />;
    }
  };

  // Renderizar mensaje de carga o error
  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Historial de consultas</h1>
          <p className="mt-2 text-lg text-gray-600">
            Revisa las noticias que has consultado recientemente.
          </p>
        </div>

        {/* Filtros y acciones */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <Calendar className="mr-2 h-5 w-5" />
              {showFilters ? 'Ocultar filtros' : 'Filtrar por fecha'}
            </button>
            
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-red-600 hover:text-red-800 font-medium flex items-center"
              disabled={totalItems === 0 || isDeleting}
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Limpiar historial
            </button>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap gap-4">
                <div className="w-full sm:w-auto">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha inicial
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="w-full sm:w-auto">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha final
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex items-end space-x-2 w-full sm:w-auto">
                  <button
                    onClick={applyFilters}
                    disabled={historyLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Aplicar
                  </button>
                  <button
                    onClick={clearFilters}
                    disabled={historyLoading || (!startDate && !endDate)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de historial */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {historyLoading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay consultas en tu historial</h3>
              <p className="mt-1 text-sm text-gray-500">
                Las noticias que consultes aparecerán aquí.
              </p>
              <div className="mt-6">
                <Link
                  href="/news"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Explorar noticias
                </Link>
              </div>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {history.map((entry) => (
                  <li key={entry.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getClassificationIcon(entry.noticia.clasificaciones)}
                        <p className="ml-2 text-sm font-medium text-gray-600">
                          {formatDate(entry.fecha_consulta)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        disabled={isDeleting}
                        className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
                        title="Eliminar del historial"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <Link
                        href={`/news/${entry.noticia_id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {entry.noticia.titulo}
                      </Link>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {entry.noticia.contenido}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="mr-3">
                        Tema: {entry.noticia.tema?.nombre || 'General'}
                      </span>
                      {entry.noticia.fuente && (
                        <span>
                          Fuente: {entry.noticia.fuente.nombre}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> a{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * 10, totalItems)}
                        </span>{' '}
                        de <span className="font-medium">{totalItems}</span> resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1 || historyLoading}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                            currentPage === 1 || historyLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <span className="sr-only">Anterior</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Páginas */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            disabled={historyLoading}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            } ${historyLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages || historyLoading}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                            currentPage === totalPages || historyLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <span className="sr-only">Siguiente</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmación para limpiar historial */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Confirmar acción</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar todo tu historial de consultas? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClearHistory}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar historial'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
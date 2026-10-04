'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Definimos la URL base de la API Gateway
const API_URL = 'http://localhost:5000/api';

const ScrapeTwitterPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [query, setQuery] = useState<string>('noticias salud covid vacunas');
  const [limit, setLimit] = useState<number>(10);
  const [minLength, setMinLength] = useState<number>(100);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [saveToDB, setSaveToDB] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [csvUrl, setCsvUrl] = useState<string | null>(null);

  // Redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!loading && (!user || user.rol !== 'admin')) {
      router.push('/');
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      setCsvUrl(null);

      const response = await fetch(`${API_URL}/ml/classify/scrape/twitter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit,
          min_length: minLength,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          save_to_db: saveToDB,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error durante el scraping');
      }

      // Si la respuesta es un CSV, crear un objeto URL para descargar
      if (response.headers.get('content-type')?.includes('text/csv')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setCsvUrl(url);
        setResult({
          status: 'success',
          message: 'Los datos se han recopilado correctamente. Haz clic en el botón para descargar el CSV.',
        });
      } else {
        const data = await response.json();
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error en scraping:', err);
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Obtener Datos de Twitter</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Configura el scraping de Twitter para obtener publicaciones sobre temas de salud
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

            {result && (
              <div className="mb-6 bg-green-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{result.message}</p>
                    {csvUrl && (
                      <div className="mt-2">
                        <a
                          href={csvUrl}
                          download="twitter_results.csv"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          Descargar CSV
                        </a>
                      </div>
                    )}
                    {result.processed_ids && (
                      <p className="mt-2 text-sm text-green-700">
                        Se procesaron {result.processed_ids.length} tweets y se guardaron en la base de datos.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="query" className="block text-sm font-medium text-gray-700">
                  Términos de búsqueda
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="query"
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Ejemplo: "noticias salud covid vacunas". Usa OR para operador "O", - para excluir palabras.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                    Fecha de inicio
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="start-date"
                      id="start-date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Ejemplo: 2025-01-01
                  </p>
                </div>

                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                    Fecha de fin
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="end-date"
                      id="end-date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Ejemplo: 2025-03-31
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="limit" className="block text-sm font-medium text-gray-700">
                    Límite de tweets
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="limit"
                      id="limit"
                      min="1"
                      max="100"
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Número máximo de tweets a procesar (1-100)
                  </p>
                </div>

                <div>
                  <label htmlFor="min-length" className="block text-sm font-medium text-gray-700">
                    Longitud mínima
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="min-length"
                      id="min-length"
                      min="10"
                      max="280"
                      value={minLength}
                      onChange={(e) => setMinLength(Number(e.target.value))}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Longitud mínima en caracteres para filtrar tweets cortos (recomendado: 100)
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="save-to-db"
                    name="save-to-db"
                    type="checkbox"
                    checked={saveToDB}
                    onChange={(e) => setSaveToDB(e.target.checked)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="save-to-db" className="font-medium text-gray-700">
                    Guardar en la base de datos
                  </label>
                  <p className="text-gray-500">
                    Si se marca, los tweets serán clasificados y guardados en la base de datos. Si no, se generará un CSV con los resultados.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/dashboard')}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? 'Procesando...' : 'Iniciar scraping'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapeTwitterPage;
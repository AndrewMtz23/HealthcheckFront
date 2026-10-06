'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Definimos la URL base de la API Gateway
const API_URL = 'http://localhost:5000/api';

const ScrapeGoogleNewsPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [rssUrl, setRssUrl] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [saveToDB, setSaveToDB] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{status?: string; message: string; processed_ids?: number[]} | null>(null);
  const [csvUrl, setCsvUrl] = useState<string | null>(null);

  // Redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!loading && (!user || user.rol !== 'admin')) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      setCsvUrl(null);

      const response = await fetch(`${API_URL}/ml/classify/scrape/google`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rss_url: rssUrl || undefined,
          limit,
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
      <div className="min-h-screen pt-16 bg-gray-50 dark:bg-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white dark:bg-slate-900 shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Obtener Noticias de Google</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Configura el scraping de Google News para obtener noticias sobre temas de salud
                </p>
              </div>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-950"
              >
                Volver
              </Link>
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 p-4 rounded-md">
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
              <div className="mb-6 bg-green-50 dark:bg-green-950/40 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">{result.message}</p>
                    {csvUrl && (
                      <div className="mt-2">
                        <a
                          href={csvUrl}
                          download="google_news_results.csv"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          Descargar CSV
                        </a>
                      </div>
                    )}
                    {result.processed_ids && (
                      <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                        Se procesaron {result.processed_ids.length} noticias y se guardaron en la base de datos.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="rss-url" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                  URL del RSS (opcional)
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    name="rss-url"
                    id="rss-url"
                    value={rssUrl}
                    onChange={(e) => setRssUrl(e.target.value)}
                    placeholder="https://news.google.com/rss/search?q=salud+OR+medicina&hl=es-419&gl=MX"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Si se deja vacío, se usará la URL predeterminada para noticias de salud.
                </p>
              </div>

              <div>
                <label htmlFor="limit" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                  Límite de noticias
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="limit"
                    id="limit"
                    min="1"
                    max="50"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Número máximo de noticias a procesar (1-50).
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="save-to-db"
                    name="save-to-db"
                    type="checkbox"
                    checked={saveToDB}
                    onChange={(e) => setSaveToDB(e.target.checked)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-slate-600 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="save-to-db" className="font-medium text-gray-700 dark:text-slate-200">
                    Guardar en la base de datos
                  </label>
                  <p className="text-gray-500 dark:text-slate-400">
                    Si se marca, las noticias serán clasificadas y guardadas en la base de datos. Si no, se generará un CSV con los resultados.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-700 pt-5">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/dashboard')}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

export default ScrapeGoogleNewsPage;

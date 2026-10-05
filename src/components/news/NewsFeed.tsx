'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SearchBar from './SearchBar';
import NewsCard from './NewsCard';
import { Newspaper, RefreshCw } from 'lucide-react';
import { 
  fetchRecentNews, 
  enrichNewsWithPreviews, 
  getInteractionsForNews, 
  createInteraction 
} from '@/services/newsService';
import type { NewsItem } from '@/types/news';

interface NewsFeedProps {
  limit?: number;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  title?: string;
  subtitle?: string;
}

const NewsFeed = ({ 
  limit = 6, 
  showSearch = true, 
  onSearch,
  title = "Noticias recientes",
  subtitle = "Mantente informado con las últimas noticias analizadas por nuestra plataforma"
}: NewsFeedProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Cargar noticias al iniciar
  useEffect(() => {
    loadNews();
  }, [limit, user]); // Añadir user como dependencia para recargar cuando cambie

  // Función para cargar noticias
  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener noticias
      let newsItems = await fetchRecentNews(limit);
      
      // Enriquecer con previsualizaciones
      newsItems = await enrichNewsWithPreviews(newsItems);
      
      // Si hay usuario, obtener interacciones
      if (user) {
        newsItems = await getInteractionsForNews(newsItems);
      }
      
      setNews(newsItems);
    } catch (err) {
      console.warn('No fue posible cargar las noticias:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Manejar interacciones con noticias
  const handleInteraction = async (newsId: number, interactionType: string) => {
    if (!user) {
      // Redirigir a login en lugar de mostrar alerta
      router.push('/login');
      return;
    }
    
    try {
      // Crear interacción en el backend
      await createInteraction(newsId, interactionType);
      
      // Actualizar el estado local para reflejar el cambio inmediatamente
      setNews(prevNews => 
        prevNews.map(item => {
          if (item.id === newsId) {
            // Clonar el objeto de interacciones o crear uno nuevo
            const userInteractions = { 
              ...(item.userInteractions || {
                marcar_confiable: false,
                marcar_dudosa: false,
                compartir: false
              })
            };
            
            // Actualizar según el tipo de interacción
            if (interactionType === 'marcar_confiable') {
              userInteractions.marcar_confiable = !userInteractions.marcar_confiable;
              // Si marcamos como confiable, desmarcamos como dudosa
              if (userInteractions.marcar_confiable) {
                userInteractions.marcar_dudosa = false;
              }
            } else if (interactionType === 'marcar_dudosa') {
              userInteractions.marcar_dudosa = !userInteractions.marcar_dudosa;
              // Si marcamos como dudosa, desmarcamos como confiable
              if (userInteractions.marcar_dudosa) {
                userInteractions.marcar_confiable = false;
              }
            } else if (interactionType === 'compartir') {
              userInteractions.compartir = true; // Compartir siempre es true
            }
            
            return { ...item, userInteractions };
          }
          return item;
        })
      );
    } catch (error) {
      console.error('Error handling interaction:', error);
      alert('Error al procesar tu interacción. Inténtalo de nuevo.');
    }
  };

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">{subtitle}</p>
          </div>
          <div className="mt-10 flex justify-center" role="status">
            <div aria-hidden="true" className="motion-safe:animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="sr-only">Cargando noticias…</span>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">{subtitle}</p>
          </div>
          <div className="relative mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 px-6 py-12 text-center" role="status">
            <div aria-hidden="true" className="absolute -left-12 -top-12 h-40 w-40 rounded-full border border-blue-100" />
            <div aria-hidden="true" className="absolute -bottom-16 -right-8 h-48 w-48 rounded-full border border-blue-100" />
            <div aria-hidden="true" className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-600 shadow-sm"><Newspaper className="h-7 w-7" /></div>
            <h3 className="relative text-lg font-semibold text-gray-900">En este momento no hemos podido cargar las noticias</h3>
            <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">Puedes volver a intentarlo en unos momentos. Mientras tanto, sigue explorando HealthCheck.</p>
            <button
              type="button"
              onClick={loadNews}
              className="relative mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Volver a intentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">{subtitle}</p>
        </div>

        {/* Barra de búsqueda */}
        {showSearch && (
          <div className="mt-8 max-w-3xl mx-auto">
            <SearchBar onSearch={onSearch} />
          </div>
        )}

        {/* Grid de noticias */}
        {news.length === 0 ? (
          <div className="mt-10 text-center text-gray-500">
            No hay noticias disponibles en este momento.
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <NewsCard
                key={item.id}
                news={item}
                onInteraction={handleInteraction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;

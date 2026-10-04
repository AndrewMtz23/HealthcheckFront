'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, CheckCircle, Newspaper, ExternalLink, Calendar, BarChart, Info, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

// Definimos la URL base de la API Gateway
const API_URL = 'http://localhost:3003/api';
// URL de la API de Microlink
const MICROLINK_API = 'https://api.microlink.io';

interface MicrolinkData {
  url: string;
  title?: string;
  description?: string;
  image?: {
    url: string;
  };
  logo?: {
    url: string;
  };
  publisher?: string;
}

interface ModelML {
  nombre: string;
  version: string;
  precision: number;
  recall: number;
  f1_score: number;
}

interface Clasificacion {
  resultado: 'verdadera' | 'falsa' | 'dudosa';
  confianza: number;
  explicacion?: string;
  fecha_clasificacion: string;
  modelo?: ModelML;
}

interface Tema {
  nombre: string;
}

interface Fuente {
  nombre: string;
  url?: string;
  confiabilidad: number;
}

interface NewsItem {
  id: number;
  titulo: string;
  contenido: string;
  url?: string;
  fecha_publicacion?: string;
  created_at?: string;
  clasificaciones?: Clasificacion[];
  tema?: Tema;
  fuente?: Fuente;
  preview?: MicrolinkData; // Añadimos los datos de previsualización
}

const RecentNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentNews = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_URL}/news?limit=6`);
        
        if (!response.ok) {
          throw new Error('Error al cargar noticias recientes');
        }
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data && data.data.news) {
          // Ordenar noticias considerando fecha_publicacion y created_at
          const newsItems = [...data.data.news].sort((a, b) => {
            // Usar fecha_publicacion si está disponible, sino usar created_at
            const dateA = a.fecha_publicacion ? new Date(a.fecha_publicacion) : 
                         (a.created_at ? new Date(a.created_at) : new Date(0));
            const dateB = b.fecha_publicacion ? new Date(b.fecha_publicacion) : 
                         (b.created_at ? new Date(b.created_at) : new Date(0));
            
            return dateB.getTime() - dateA.getTime(); // Orden descendente (más reciente primero)
          });
          
          setNews(newsItems);
          
          // Luego obtener las previsualizaciones para cada noticia con URL
          const newsWithPreviews = await Promise.all(
            newsItems.map(async (item: NewsItem) => {
              if (item.url) {
                try {
                  const microlinkResponse = await fetch(`${MICROLINK_API}?url=${encodeURIComponent(item.url)}`);
                  const microlinkData = await microlinkResponse.json();
                  
                  if (microlinkData.status === 'success') {
                    return { ...item, preview: microlinkData.data };
                  }
                } catch (error) {
                  console.error(`Error fetching preview for URL ${item.url}:`, error);
                }
              }
              return item;
            })
          );
          
          setNews(newsWithPreviews);
        } else {
          throw new Error('Formato de respuesta inesperado');
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentNews();
  }, []);

  const getClassificationIcon = (classificacion?: Clasificacion) => {
    if (!classificacion) {
      return <Info className="h-5 w-5 text-gray-400" />;
    }
    
    switch (classificacion.resultado) {
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

  const getClassificationBadge = (newsItem: NewsItem) => {
    if (!newsItem.clasificaciones || newsItem.clasificaciones.length === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Info className="h-3 w-3 mr-1" />
          Sin clasificar
        </span>
      );
    }
    
    const classification = newsItem.clasificaciones[0];
    
    let badgeColor = 'bg-gray-100 text-gray-800';
    let icon = <Info className="h-3 w-3 mr-1" />;
    
    if (classification.resultado === 'verdadera') {
      badgeColor = 'bg-green-100 text-green-800';
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
    } else if (classification.resultado === 'falsa') {
      badgeColor = 'bg-red-100 text-red-800';
      icon = <AlertTriangle className="h-3 w-3 mr-1" />;
    } else if (classification.resultado === 'dudosa') {
      badgeColor = 'bg-yellow-100 text-yellow-800';
      icon = <Info className="h-3 w-3 mr-1" />;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
        {icon}
        {classification.resultado.toUpperCase()}
      </span>
    );
  };

  const renderConfidenceBar = (classification?: Clasificacion) => {
    if (!classification) return null;
    
    // Obtener el valor de confianza
    let confidenceValue = classification.confianza;
    
    // Verificar si el valor existe y es un número
    if (confidenceValue === null || confidenceValue === undefined) {
      confidenceValue = 0;
    }
    
    // Convertir a número si es un string
    let confidence = typeof confidenceValue === 'string' 
      ? parseFloat(confidenceValue) 
      : confidenceValue;
    
    // Si no es un número válido, usar 0
    if (isNaN(confidence)) confidence = 0;
    
    // Los valores de confianza se muestran directamente como porcentajes
    // Sin realizar multiplicación por 100, incluso si son < 1
    const displayPercentage = confidence;
    
    // Limitar el porcentaje para la barra entre 0 y 100
    const barPercentage = Math.min(Math.max(displayPercentage, 0), 100);
    
    // Formato con un decimal
    const formattedPercentage = displayPercentage.toFixed(1);
    
    let barColor = 'bg-gray-400';
    if (classification.resultado === 'verdadera') {
      barColor = 'bg-green-500';
    } else if (classification.resultado === 'falsa') {
      barColor = 'bg-red-500';
    } else if (classification.resultado === 'dudosa') {
      barColor = 'bg-yellow-500';
    }
    
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span className="flex items-center">
            <BarChart className="h-3 w-3 mr-1" />
            Confianza
          </span>
          <span>{formattedPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full ${barColor} rounded-full`}
            style={{ width: `${barPercentage}%` }}
          />
        </div>
      </div>
    );
  };

  const truncateText = (text: string, maxLength: number = 140) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Fecha desconocida';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleUrlPreview = (url: string) => {
    setPreviewUrl(url === previewUrl ? null : url);
  };

  if (loading) {
    return (
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Noticias</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Noticias recientes
            </p>
          </div>
          <div className="mt-10 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Noticias</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Noticias recientes
            </p>
          </div>
          <div className="mt-10 bg-red-50 p-4 rounded-md text-red-700 text-center">
            <p>Error al cargar noticias: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Noticias</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Noticias recientes
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Mantente informado con las últimas noticias analizadas por nuestra plataforma.
          </p>
        </div>

        {news.length === 0 ? (
          <div className="mt-10 text-center text-gray-500">
            No hay noticias disponibles en este momento.
          </div>
        ) : (
          <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
            {news.map((item) => (
              <div key={item.id} className="flex flex-col rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                {/* Imagen de previsualización si existe */}
                {item.preview?.image?.url && (
                  <div className="relative w-full h-48 bg-gray-100">
                    <img 
                      src={item.preview.image.url} 
                      alt={item.titulo} 
                      className="object-cover w-full h-full"
                    />
                    {item.preview.logo?.url && (
                      <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow">
                        <img 
                          src={item.preview.logo.url} 
                          alt={item.fuente?.nombre || 'Logo'} 
                          className="w-6 h-6 object-contain rounded-full"
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {/* Header con clasificación */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    {getClassificationIcon(item.clasificaciones?.[0])}
                    <span className="ml-2 font-medium text-gray-700">
                      {item.tema?.nombre || 'General'}
                    </span>
                  </div>
                  <div>
                    {getClassificationBadge(item)}
                  </div>
                </div>
                
                {/* Contenido principal */}
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(item.fecha_publicacion)}</span>
                    </div>
                    
                    <Link href={`/news/${item.id}`}>
                      <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                        {item.titulo}
                      </h3>
                    </Link>
                    
                    {/* Barra de confianza */}
                    {renderConfidenceBar(item.clasificaciones?.[0])}
                    
                    <p className="mt-3 text-base text-gray-500">
                      {item.preview?.description ? item.preview.description : truncateText(item.contenido)}
                    </p>
                    
                    {/* Información del modelo de IA */}
                    {item.clasificaciones?.[0]?.modelo && (
                      <div className="mt-3 bg-blue-50 rounded-md p-2 text-xs text-blue-600">
                        <p className="font-medium">Analizado por: {item.clasificaciones[0].modelo.nombre} v{item.clasificaciones[0].modelo.version}</p>
                        <p className="mt-1">Precisión: {(item.clasificaciones[0].modelo.precision * 100).toFixed(0)}%</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer con acciones */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Newspaper className="h-4 w-4 mr-1" />
                      <span>{item.fuente?.nombre || item.preview?.publisher || 'Fuente desconocida'}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link 
                        href={`/news/${item.id}`}
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Ver detalles
                      </Link>
                      
                      {item.url && (
                        <a 
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-10 text-center">
          <Link 
            href="/news" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Ver todas las noticias
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecentNews;
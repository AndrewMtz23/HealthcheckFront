'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart2,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Flag,
  Info
} from 'lucide-react';
import type { NewsItem } from '@/types/news';
import ConfidenceBar from './ConfidenceBar';
import ReportModal from './ReportModal';
import { getInteractionCounts } from '@/services/newsService';

interface NewsCardProps {
  news: NewsItem;
  onInteraction: (newsId: number, interactionType: string) => Promise<void>;
}

const NewsCard = ({ news, onInteraction }: NewsCardProps) => {
  const { user } = useAuth()
  const [showReportModal, setShowReportModal] = useState(false);
  const [interactionCounts, setInteractionCounts] = useState({
    likes: 0,
    dislikes: 0,
    shares: 0
  });
  const router = useRouter();

  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Fecha desconocida';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return 'Fecha inválida';
    }
  };

  // Truncar texto
  const truncateText = (text: string, maxLength: number = 140) => {
    if (!text) return '';

    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Cargar conteos de interacciones al montar el componente
  useEffect(() => {
    const loadInteractionCounts = async () => {
      try {
        const counts = await getInteractionCounts(news.id);
        setInteractionCounts(counts);
      } catch (error) {
        console.error('Error cargando conteos de interacciones:', error);
      }
    };

    loadInteractionCounts();
  }, [news.id]);

  // Obtener icono basado en la clasificación
  const getClassificationIcon = () => {
    if (!news.clasificaciones || news.clasificaciones.length === 0) {
      return <Info className="h-5 w-5 text-gray-400 dark:text-slate-400" />;
    }

    const classification = news.clasificaciones[0];

    switch (classification.resultado) {
      case 'verdadera':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'falsa':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'dudosa':
        return <Info className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-400 dark:text-slate-400" />;
    }
  };

  // Obtener badge de clasificación
  const getClassificationBadge = () => {
    if (!news.clasificaciones || news.clasificaciones.length === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-100">
          <Info className="h-3 w-3 mr-1" />
          Sin clasificar
        </span>
      );
    }

    const classification = news.clasificaciones[0];

    let badgeColor = 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-100';
    let icon = <Info className="h-3 w-3 mr-1" />;

    switch (classification.resultado) {
      case 'verdadera':
        badgeColor = 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300';
        icon = <CheckCircle className="h-3 w-3 mr-1" />;
        break;
      case 'falsa':
        badgeColor = 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300';
        icon = <AlertTriangle className="h-3 w-3 mr-1" />;
        break;
      case 'dudosa':
        badgeColor = 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300';
        icon = <Info className="h-3 w-3 mr-1" />;
        break;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
        {icon}
        {classification.resultado.toUpperCase()}
      </span>
    );
  };

  // Manejar interacciones
  const handleInteraction = async (type: string) => {
    if (!user) {
      // Redirigir al usuario a la página de login
      router.push('/login');
      return;
    }

    await onInteraction(news.id, type);

    // Actualizar conteos localmente después de la interacción
    try {
      const updatedCounts = await getInteractionCounts(news.id);
      setInteractionCounts(updatedCounts);
    } catch (error) {
      console.error('Error actualizando conteos:', error);
    }
  };

  const handleReportClick = () => {
    // Verificar si el usuario está autenticado
    if (!user) {
      // Redirigir al usuario a la página de login
      router.push('/login');
      return;
    }
    
    // Si está autenticado, mostrar el modal de reporte
    setShowReportModal(true);
  };

  // Compartir noticia
  const handleShare = async () => {
    // Verificar si el usuario está autenticado
    if (!user) {
      // Redirigir al usuario a la página de login
      router.push('/login');
      return; // Importante retornar para detener la ejecución
    }

    const shareUrl = `${window.location.origin}/news/${news.id}`;
    const shareText = `${news.titulo} - Verificado por HealthCheck`;

    // Registrar interacción de compartir
    await onInteraction(news.id, 'compartir');

    // Actualizar conteos localmente
    try {
      const updatedCounts = await getInteractionCounts(news.id);
      setInteractionCounts(updatedCounts);
    } catch (error) {
      console.error('Error actualizando conteos:', error);
    }

    // Fallback: Compartir en Twitter
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterShareUrl, '_blank');
  };

  return (
    <>
      <div className="flex flex-col rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl h-full">
        {/* Imagen de previsualización si existe */}
        {news.preview?.image?.url && (
          <div className="relative w-full h-48 bg-gray-100 dark:bg-slate-800">
            <img
              src={news.preview.image.url}
              alt={news.titulo}
              className="object-cover w-full h-full"
            />
            {news.preview.logo?.url && (
              <div className="absolute bottom-2 right-2 bg-white dark:bg-slate-900 rounded-full p-1 shadow">
                <img
                  src={news.preview.logo.url}
                  alt={news.fuente?.nombre || 'Logo'}
                  className="w-6 h-6 object-contain rounded-full"
                />
              </div>
            )}
          </div>
        )}

        {/* Header con clasificación */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center">
            {getClassificationIcon()}
            <span className="ml-2 font-medium text-gray-700 dark:text-slate-200">
              {news.tema?.nombre || 'General'}
            </span>
          </div>
          <div>
            {getClassificationBadge()}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between">
          <div className="flex-1">

            {/* Fecha y acciones secundarias */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-slate-400 mb-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(news.fecha_publicacion)}</span>
              </div>

              {/* Acciones: compartir + fuente + contadores */}
              <div className="flex items-center space-x-1">
                {/* Compartir */}
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  title="Compartir"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="ml-1 text-xs">{interactionCounts.shares}</span>
                </button>

                {/* Ver fuente original */}
                {news.url && (
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    title="Ver fuente original"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            <Link href={`/news/${news.id}`}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {news.titulo}
              </h3>
            </Link>

            {/* Barra de confianza */}
            {news.clasificaciones && news.clasificaciones.length > 0 && (
              <ConfidenceBar classification={news.clasificaciones[0]} />
            )}

            <p className="mt-3 text-base text-gray-500 dark:text-slate-400">
              {news.preview?.description ? news.preview.description : truncateText(news.contenido)}
            </p>

            {/* Información del modelo de IA */}
            {news.clasificaciones?.[0]?.modelo && (
              <div className="mt-3 bg-blue-50 dark:bg-blue-950/50 rounded-md p-2 text-xs text-blue-600 dark:text-blue-400">
                <p className="font-medium">Analizado por: {news.clasificaciones[0].modelo.nombre} v{news.clasificaciones[0].modelo.version}</p>
                <p className="mt-1">Precisión: {(news.clasificaciones[0].modelo.precision * 100).toFixed(0)}%</p>
              </div>
            )}
          </div>

          {/* Footer con acciones */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500 dark:text-slate-400">
                <span>{news.fuente?.nombre || news.preview?.publisher || 'Fuente desconocida'}</span>
                {news.fuente && (
                  <button
                    onClick={handleReportClick}
                    className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    title="Reportar fuente"
                  >
                    <Flag className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex space-x-1 text-sm">
                <button
                  onClick={() => handleInteraction('marcar_confiable')}
                  className={`p-2 rounded-full transition-colors flex items-center ${news.userInteractions?.marcar_confiable
                    ? 'text-white bg-green-500 hover:bg-green-600'
                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  title="Marcar como confiable"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span>{interactionCounts.likes}</span>
                </button>

                <button
                  onClick={() => handleInteraction('marcar_dudosa')}
                  className={`p-2 rounded-full transition-colors flex items-center ${news.userInteractions?.marcar_dudosa
                    ? 'text-white bg-red-500 hover:bg-red-600'
                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  title="Marcar como dudosa"
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  <span>{interactionCounts.dislikes}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de reporte */}
      {showReportModal && news.fuente && (
        <ReportModal
          fuente={news.fuente}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
};

export default NewsCard;
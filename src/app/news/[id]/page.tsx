'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    ThumbsUp,
    ThumbsDown,
    Share2,
    AlertTriangle,
    CheckCircle,
    Info,
    ExternalLink,
    ChevronLeft,
    Calendar,
    Flag,
    BarChart2
} from 'lucide-react';
import {
    getNewsById,
    createInteraction,
    getInteractionCounts,
    getInteractionStatus
} from '@/services/newsService';
import type { NewsItem } from '@/types/news';
import ConfidenceBar from '@/components/news/ConfidenceBar';
import ReportModal from '@/components/news/ReportModal';

export default function NewsDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [news, setNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userInteractions, setUserInteractions] = useState({
        marcar_confiable: false,
        marcar_dudosa: false,
        compartir: false
    });
    const [interactionCounts, setInteractionCounts] = useState({
        likes: 0,
        dislikes: 0,
        shares: 0
    });
    const [showOriginal, setShowOriginal] = useState(true);
    // Estado para controlar la carga del tweet y contenido web
    const [isTweetLoaded, setIsTweetLoaded] = useState(false);
    const [isWebContentLoaded, setIsWebContentLoaded] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);


    useEffect(() => {
        const fetchNewsDetails = async () => {
            try {
                setLoading(true);

                // Obtener detalles de la noticia
                const newsData = await getNewsById(Number(id));
                setNews(newsData);

                // Obtener conteos de interacciones
                const counts = await getInteractionCounts(Number(id));
                setInteractionCounts(counts);

                // Obtener estado de interacciones del usuario
                if (user) {
                    const interactionStatus = await getInteractionStatus(Number(id));
                    setUserInteractions(interactionStatus);
                }
            } catch (err) {
                console.error('Error fetching news details:', err);
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchNewsDetails();
        }
    }, [id, user]);

    const handleInteraction = async (interactionType: 'marcar_confiable' | 'marcar_dudosa' | 'compartir') => {
        if (!user) {
            // Redirigir a login
            router.push('/login');
            return;
        }

        try {
            const result = await createInteraction(Number(id), interactionType);

            // Actualizar conteos e interacciones
            const updatedCounts = await getInteractionCounts(Number(id));
            setInteractionCounts(updatedCounts);

            // Actualizar estado de interacciones
            const updatedInteractions = await getInteractionStatus(Number(id));
            setUserInteractions(updatedInteractions);
        } catch (error) {
            console.error('Error en interacción:', error);
            alert('Error al procesar tu interacción');
        }
    };


    const handleShare = async () => {
        if (!user) {
            // Redirigir a login
            router.push('/login');
            return;
        }

        const shareUrl = `${window.location.origin}/news/${id}`;
        const shareText = `${news?.titulo} - Verificado por HealthCheck`;

        // Registrar interacción de compartir
        await handleInteraction('compartir');

        // Compartir usando Web Share API o fallback
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'HealthCheck - Noticia Verificada',
                    text: shareText,
                    url: shareUrl
                });
            } catch (error) {
                console.error('Error compartiendo:', error);
                // Fallback: copiar al portapapeles
                await navigator.clipboard.writeText(shareUrl);
                alert('Enlace copiado al portapapeles');
            }
        } else {
            // Fallback para navegadores que no soportan Web Share API
            const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
            window.open(twitterShareUrl, '_blank');
        }
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

    const getClassificationBadge = () => {
        if (!news || !news.clasificaciones || news.clasificaciones.length === 0) {
            return (
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    Sin clasificar
                </span>
            );
        }

        const classification = news.clasificaciones[0];

        let badgeColor = 'bg-gray-100 text-gray-800';
        let Icon = Info;

        switch (classification.resultado) {
            case 'verdadera':
                badgeColor = 'bg-green-100 text-green-800 border border-green-200';
                Icon = CheckCircle;
                break;
            case 'falsa':
                badgeColor = 'bg-red-100 text-red-800 border border-red-200';
                Icon = AlertTriangle;
                break;
            case 'dudosa':
                badgeColor = 'bg-yellow-100 text-yellow-800 border border-yellow-200';
                Icon = Info;
                break;
        }

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeColor} shadow-sm`}>
                <Icon className="mr-1 h-3 w-3" />
                {classification.resultado.toUpperCase()}
            </span>
        );
    };

    const handleReportClick = () => {
        // Verificar si el usuario está autenticado
        if (!user) {
          // Redirigir al usuario a la página de login
          router.push('/login');
          return;
        }
        
        // Si está autenticado, mostrar el modal de reporte
        setReportModalOpen(true);
      };

    // Función para obtener color según nivel de confianza
    const getConfidenceColor = (confidence: number) => {
        const value = typeof confidence === 'string' ? parseFloat(confidence) : confidence;

        if (value >= 0.7) return 'bg-green-500';
        if (value >= 0.4) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // Referencia para el tweet embebido
    const tweetRef = useRef<HTMLDivElement>(null);

    // Verificar si la URL es de Twitter
    const isTwitterUrl = (url?: string) => {
        if (!url) return false;
        return url.includes('twitter.com') || url.includes('x.com');
    };

    // Renderizar el tweet usando la API de Twitter
    useEffect(() => {
        // No renderizar si no hay noticia, URL, no es Twitter o no está en modo original
        if (!news || !news.url || !isTwitterUrl(news.url) || !showOriginal) {
            return;
        }

        // No volver a cargar si ya está cargado y estamos en la misma noticia
        if (isTweetLoaded && tweetRef.current && tweetRef.current.querySelector('iframe')) {
            return;
        }

        // Resetear estado de carga al cambiar de noticia
        setIsTweetLoaded(false);

        const renderTweet = () => {
            if (!tweetRef.current) return;

            // Siempre usar twitter.com en lugar de x.com para la incrustación
            let tweetUrl = news.url || '';
            if (tweetUrl.includes('x.com')) {
                tweetUrl = tweetUrl.replace('x.com', 'twitter.com');
            }

            // Eliminar Twitter widgets existentes para evitar duplicados
            const existingTweet = tweetRef.current.querySelector('.twitter-tweet');
            if (existingTweet && tweetRef.current.contains(existingTweet)) {
                tweetRef.current.removeChild(existingTweet);
            }

            // Crear el blockquote para Twitter
            const blockquote = document.createElement('blockquote');
            blockquote.className = 'twitter-tweet';

            const link = document.createElement('a');
            link.href = tweetUrl;
            blockquote.appendChild(link);

            tweetRef.current.appendChild(blockquote);

            // Función para verificar si el tweet se ha cargado correctamente
            const checkIfLoaded = () => {
                if (tweetRef.current && tweetRef.current.querySelector('iframe')) {
                    setIsTweetLoaded(true);
                }
            };

            // Cargar el widget de Twitter con un pequeño retraso para asegurar que DOM esté listo
            setTimeout(() => {
                if ((window as any).twttr && (window as any).twttr.widgets) {
                    (window as any).twttr.widgets.load(tweetRef.current);

                    // Verificar la carga después de un tiempo
                    setTimeout(checkIfLoaded, 1000);
                }
            }, 500);
        };

        // Cargar el script de Twitter si aún no está cargado
        if (!(window as any).twttr) {
            const script = document.createElement('script');
            script.src = 'https://platform.twitter.com/widgets.js';
            script.async = true;

            script.onload = () => {
                renderTweet();
            };

            document.body.appendChild(script);
        } else {
            renderTweet();
        }

        // Reintentar la carga después de 1.5 segundos por si acaso
        const retryTimeout = setTimeout(() => {
            if (tweetRef.current && !tweetRef.current.querySelector('iframe')) {
                renderTweet();

                // Verificar de nuevo después de otro segundo
                setTimeout(() => {
                    if (tweetRef.current && tweetRef.current.querySelector('iframe')) {
                        setIsTweetLoaded(true);
                    }
                }, 1000);
            }
        }, 2000);

        return () => clearTimeout(retryTimeout);
    }, [news?.id, showOriginal, isTweetLoaded]);

    // Manejar la carga del iframe
    const handleIframeLoad = () => {
        setIsWebContentLoaded(true);
    };

    // Renderizar el iframe adecuado según la URL
    const renderContentFrame = () => {
        if (!news || !news.url) {
            return null;
        }

        // Si es un tweet, mostrar el contenedor del tweet con indicador de carga
        if (isTwitterUrl(news.url)) {
            return (
                <div className="mt-4 flex flex-col items-center">
                    <div ref={tweetRef} className="w-full max-w-lg min-h-[300px] flex flex-col items-center justify-center">
                        {/* Mostrar el indicador de carga solo si no está cargado el tweet */}
                        {!isTweetLoaded && (
                            <div className="animate-pulse flex flex-col items-center absolute">
                                <div className="rounded-md bg-gray-200 h-16 w-16 mb-3"></div>
                                <div className="h-2 bg-gray-200 rounded w-48 mb-2"></div>
                                <div className="h-2 bg-gray-200 rounded w-40 mb-2"></div>
                                <div className="h-2 bg-gray-200 rounded w-32"></div>
                                <div className="mt-4 text-sm text-gray-500">Cargando tweet...</div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Para otras URLs, mostrar un iframe con indicador de carga
        return (
            <div className="mt-4 relative min-h-[300px]">
                {/* Indicador de carga para sitios web normales */}
                {!isWebContentLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-lg z-10">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="rounded-md bg-gray-200 h-20 w-32 mb-3"></div>
                            <div className="h-2 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-2 bg-gray-200 rounded w-64 mb-2"></div>
                            <div className="h-2 bg-gray-200 rounded w-40"></div>
                            <div className="mt-4 text-sm text-gray-500">Cargando contenido...</div>
                        </div>
                    </div>
                )}

                <iframe
                    src={news.url}
                    className="w-full border-0 rounded-lg shadow-md"
                    style={{ height: '60vh' }}
                    title={news.titulo}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    loading="lazy"
                    onLoad={handleIframeLoad}
                ></iframe>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 flex justify-center items-center">
                <div className="bg-red-50 p-8 rounded-lg text-center">
                    <h2 className="text-2xl font-bold text-red-800 mb-4">Error</h2>
                    <p className="text-red-600 mb-6">{error || 'Noticia no encontrada'}</p>
                    <button
                        onClick={() => router.push('/news')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Volver a noticias
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-6 pb-12">
            {/* Contenedor principal con ancho reducido */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                {/* Botón de volver arriba */}
                <div className="mb-4">
                    <button
                        onClick={() => router.push('/news')}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Volver a noticias
                    </button>
                </div>

                <div className="bg-white shadow-md rounded-xl overflow-hidden">
                    {/* Encabezado de la noticia */}
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                    {news.clasificaciones && news.clasificaciones.length > 0 && (
                                        <>
                                            {news.clasificaciones[0].resultado === 'verdadera' && (
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                            )}
                                            {news.clasificaciones[0].resultado === 'falsa' && (
                                                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                                            )}
                                            {news.clasificaciones[0].resultado === 'dudosa' && (
                                                <Info className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                                            )}
                                        </>
                                    )}
                                    <span className="text-sm font-medium text-gray-700">
                                        {news.tema?.nombre || 'General'}
                                    </span>
                                </div>
                                <div>
                                    {getClassificationBadge()}
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{news.titulo}</h1>

                            {/* Fecha e información de la fuente */}
                            <div className="flex flex-wrap items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center mr-4 mb-2 sm:mb-0">
                                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                    <span>{formatDate(news.fecha_publicacion)}</span>
                                </div>

                                {news.fuente && (
                                    <button
                                        onClick={handleReportClick}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Reportar fuente"
                                    >
                                        <Flag className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Barra de confianza */}
                            {news.clasificaciones && news.clasificaciones.length > 0 && (
                                <div className="mt-1">
                                    <ConfidenceBar classification={news.clasificaciones[0]} />
                                </div>
                            )}

                            {/* Botones de acción */}
                            <div className="flex flex-wrap mt-4 gap-1 md:gap-2">
                                <button
                                    onClick={() => handleInteraction('marcar_confiable')}
                                    className={`p-2 rounded-full transition-colors flex items-center ${userInteractions.marcar_confiable
                                        ? 'text-white bg-green-500 hover:bg-green-600'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    title="Marcar como confiable"
                                >
                                    <ThumbsUp className="h-5 w-5 mr-1" />
                                    <span>{interactionCounts.likes}</span>
                                </button>

                                <button
                                    onClick={() => handleInteraction('marcar_dudosa')}
                                    className={`p-2 rounded-full transition-colors flex items-center ${userInteractions.marcar_dudosa
                                        ? 'text-white bg-red-500 hover:bg-red-600'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    title="Marcar como dudosa"
                                >
                                    <ThumbsDown className="h-5 w-5 mr-1" />
                                    <span>{interactionCounts.dislikes}</span>
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors flex items-center"
                                    title="Compartir"
                                >
                                    <Share2 className="h-5 w-5 mr-1" />
                                    <span>{interactionCounts.shares}</span>
                                </button>

                                {news.url && (
                                    <a
                                        href={news.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                                        title="Ver fuente original"
                                    >
                                        <ExternalLink className="h-5 w-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botones para alternar entre contenido original y resumen */}
                    {news.url && (
                        <div className="px-6 py-2 border-b border-t border-gray-100 flex">
                            <button
                                className={`px-4 py-2 rounded-full mr-2 text-sm font-medium transition-colors ${showOriginal
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                onClick={() => setShowOriginal(true)}
                            >
                                Contenido original
                            </button>
                            <button
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!showOriginal
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                onClick={() => setShowOriginal(false)}
                            >
                                Resumen y análisis
                            </button>
                        </div>
                    )}

                    {/* Contenido de la noticia */}
                    <div className="p-6">
                        {showOriginal && news.url ? (
                            renderContentFrame()
                        ) : (
                            <div className="prose max-w-none text-gray-800">
                                {news.contenido.split('\n').map((paragraph, idx) => (
                                    paragraph ? <p key={idx} className="mb-4">{paragraph}</p> : <br key={idx} />
                                ))}

                                {/* Información del análisis */}
                                {news.clasificaciones && news.clasificaciones.length > 0 && news.clasificaciones[0].explicacion && (
                                    <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                            <BarChart2 className="mr-2 h-5 w-5 text-blue-500" />
                                            Análisis de veracidad
                                        </h3>
                                        <p className="italic text-gray-700">{news.clasificaciones[0].explicacion}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Información adicional */}
                        {news.fuente && !showOriginal && (
                            <div className="mt-6 bg-blue-50 p-4 rounded-lg shadow-sm">
                                <h3 className="text-md font-semibold text-blue-800 mb-2 flex items-center">
                                    <Info className="mr-2 h-4 w-4" />
                                    Información de la fuente
                                </h3>
                                <div className="flex flex-col gap-2">
                                    <p className="text-blue-700 flex items-center text-sm">
                                        <span className="font-medium min-w-[100px]">Nombre:</span>
                                        {news.fuente.nombre}
                                    </p>
                                    {news.fuente.url && (
                                        <p className="text-blue-700 flex items-center text-sm">
                                            <span className="font-medium min-w-[100px]">URL:</span>
                                            <a
                                                href={news.fuente.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline hover:text-blue-800 transition-colors overflow-hidden text-ellipsis"
                                            >
                                                {news.fuente.url}
                                            </a>
                                        </p>
                                    )}
                                    {news.fuente.confiabilidad && (
                                        <p className="text-blue-700 flex items-center text-sm">
                                            <span className="font-medium min-w-[100px]">Confiabilidad:</span>
                                            <span className="inline-flex items-center">
                                                {Math.round(news.fuente.confiabilidad * 100)}%
                                                <span className={`ml-2 w-12 h-1.5 rounded-full ${getConfidenceColor(news.fuente.confiabilidad)}`}></span>
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Información del modelo de ML */}
                        {news.clasificaciones && news.clasificaciones[0]?.modelo && !showOriginal && (
                            <div className="mt-4 bg-purple-50 p-4 rounded-lg shadow-sm">
                                <h3 className="text-md font-semibold text-purple-800 mb-2 flex items-center">
                                    <BarChart2 className="mr-2 h-4 w-4" />
                                    Modelo de análisis
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                        <p className="text-purple-700 text-xs font-medium">Modelo</p>
                                        <p className="text-gray-800 font-bold text-sm mt-1">
                                            {news.clasificaciones[0].modelo.nombre} v{news.clasificaciones[0].modelo.version}
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                        <p className="text-purple-700 text-xs font-medium">Precisión</p>
                                        <p className="text-gray-800 font-bold text-sm mt-1">
                                            {(news.clasificaciones[0].modelo.precision * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                        <p className="text-purple-700 text-xs font-medium">F1-Score</p>
                                        <p className="text-gray-800 font-bold text-sm mt-1">
                                            {(news.clasificaciones[0].modelo.f1_score * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {!user && (
                        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100 text-center text-sm">
                            <p className="text-blue-700 font-medium">
                                Inicia sesión para interactuar con esta noticia y ayudar a verificar su veracidad
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal para reportar fuente */}
            {reportModalOpen && news.fuente && (
                <ReportModal
                    fuente={news.fuente}
                    onClose={() => setReportModalOpen(false)}
                />
            )}
        </div>
    );
}
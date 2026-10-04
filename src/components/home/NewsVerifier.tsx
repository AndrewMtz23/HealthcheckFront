'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// Definimos la URL base de la API Gateway
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface VerificationResult {
  "Noticia ID": number;
  "Clasificación": string;
  "Confianza": number;
  "Explicación": string;
  "Tema": string;
  "Palabras Clave": string[];
  "Título": string;
  "Autor": string;
  "Fuente": string;
  "Fecha de Publicación"?: string;
  "Texto Completo": string;
  "Clasificación ID"?: number;
  "Consulta ID"?: number;
}

type InputTab = 'texto' | 'url' | 'twitter';

const NewsVerifier = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<InputTab>('texto');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [showExample, setShowExample] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) {
      setError('Por favor, introduce contenido para verificar');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Preparar datos para la API
      const requestData: Record<string, any> = {};
      
      // Mapear el tipo de entrada según la pestaña activa
      if (activeTab === 'texto') {
        requestData.text = input;
      } else if (activeTab === 'url' || activeTab === 'twitter') {
        requestData.url = input;
      }
      
      // Incluir ID de usuario si está autenticado
      if (user) {
        requestData.usuario_id = user.id;
      }
      
      // Enviar solicitud a la API
      const response = await fetch(`${API_URL}/ml/classify/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
        },
        body: JSON.stringify(requestData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al verificar la información');
      }
      
      setResult(data);
      setShowExample(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Formatear la confianza para mostrarla como porcentaje
  const formatConfidence = (confidence: number) => {
    // Si la confianza está entre 0 y 1, multiplicarla por 100
    if (confidence <= 1) {
      return (confidence * 100).toFixed(0);
    }
    // Si ya está en porcentaje, simplemente formatearla
    return confidence.toFixed(0);
  };

  const renderConfidenceBar = (classification: string, confidence: number) => {
    const percentage = parseFloat(formatConfidence(confidence));
    const isTrue = classification.toLowerCase() === 'verdadera';
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
        <div 
          className={`h-4 rounded-full ${isTrue ? 'bg-green-600' : 'bg-red-600'}`}
          style={{ width: `${percentage}%` }}
        >
        </div>
      </div>
    );
  };

  const renderSourcePreview = (source: string) => {
    // Solo mostrar preview para URLs válidas
    if (!source || source === "Texto ingresado directamente" || !source.startsWith('http')) {
      return null;
    }

    // Verificar si es un tweet
    const isTwitter = source.match(/twitter\.com|x\.com/i);
    
    return (
      <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b text-sm font-medium text-gray-700">
          Vista previa
        </div>
        <div className="bg-white p-4 h-64 overflow-hidden">
          {isTwitter ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Vista previa de Twitter no disponible
            </div>
          ) : (
            <iframe 
              src={source} 
              className="w-full h-full"
              title="Vista previa de la fuente"
              sandbox="allow-same-origin allow-scripts"
            />
          )}
        </div>
      </div>
    );
  };

  // Ejemplo de resultado para mostrar
  const exampleResult: VerificationResult = {
    "Noticia ID": 1,
    "Clasificación": "falsa",
    "Confianza": 97.5,
    "Explicación": "Esta información es falsa. El dióxido de cloro no es un tratamiento aprobado para COVID-19 y puede ser peligroso para la salud humana. Múltiples autoridades sanitarias como la OMS, FDA y CDC han advertido contra su uso.",
    "Tema": "COVID-19",
    "Palabras Clave": ["dióxido de cloro", "COVID-19", "tratamiento", "peligroso", "desinformación"],
    "Título": "Análisis de información sobre tratamiento con dióxido de cloro",
    "Autor": "Sistema HealthCheck",
    "Fuente": "Texto ingresado directamente",
    "Texto Completo": "Las inyecciones de dióxido de cloro pueden eliminar el COVID-19 en personas infectadas."
  };

  return (
    <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto my-8">
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Verificador de información</h2>
        
        {/* Tabs de selección */}
        <div className="mb-6 flex">
          <button 
            className={`rounded-full px-6 py-2 mr-2 ${activeTab === 'texto' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('texto')}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              Texto
            </span>
          </button>
          <button 
            className={`rounded-full px-6 py-2 mr-2 ${activeTab === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('url')}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              URL
            </span>
          </button>
          <button 
            className={`rounded-full px-6 py-2 ${activeTab === 'twitter' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('twitter')}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
              </svg>
              Twitter
            </span>
          </button>
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {activeTab === 'texto' ? (
              <textarea
                placeholder="Ingresa el texto completo de la noticia o información que deseas verificar"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <div className="flex">
                <input
                  type="url"
                  placeholder={activeTab === 'twitter' ? "https://twitter.com/usuario/status/123456789" : "https://ejemplo.com/noticia"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow px-4 py-3 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`px-6 py-3 bg-blue-600 text-white rounded-r-md focus:outline-none ${
                    (isLoading || !input.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>

          {activeTab === 'texto' && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`px-6 py-3 bg-blue-600 text-white rounded-md flex items-center ${
                  (isLoading || !input.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verificando...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Verificar
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
        </form>
        
        {/* Información de cómo funciona */}
        {!result && !showExample && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-900">
                  <span className="font-bold">¿Cómo funciona?</span> Nuestro sistema compara la información con fuentes oficiales y bases de datos médicas verificadas
                </p>
                <p className="mt-3 text-sm md:mt-0 md:ml-6">
                  <button 
                    onClick={() => setShowExample(true)}
                    className="whitespace-nowrap text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Ver ejemplo de resultado →
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Resultados */}
        {(result || showExample) && (
          <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Resultado del análisis</h3>
              {showExample && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Ejemplo</span>
              )}
            </div>
            
            <div className="bg-white p-6">
              {/* Visualización de resultado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {/* Info principal */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {showExample ? exampleResult["Título"] : result?.["Título"] !== "No disponible" ? result?.["Título"] : "Análisis de información"}
                    </h4>
                    
                    {/* Autor y fecha */}
                    <div className="flex flex-wrap text-sm text-gray-600 mb-4">
                      {(showExample ? exampleResult["Autor"] : result?.["Autor"]) && 
                       (showExample ? exampleResult["Autor"] : result?.["Autor"]) !== "Desconocido" && (
                        <span className="mr-4">
                          <span className="font-medium">Autor:</span> {showExample ? exampleResult["Autor"] : result?.["Autor"]}
                        </span>
                      )}
                      
                      {(showExample ? undefined : result?.["Fecha de Publicación"]) && (
                        <span>
                          <span className="font-medium">Fecha:</span> {result?.["Fecha de Publicación"]}
                        </span>
                      )}
                    </div>
                    
                    {/* Clasificación con barra de confianza */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Clasificación:</span>
                        <span 
                          className={`font-bold ${
                          (showExample ? exampleResult["Clasificación"] : result?.["Clasificación"] || '').toLowerCase() === 'verdadera' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                          }`}
                        >
                          {(showExample ? exampleResult["Clasificación"] : result?.["Clasificación"] || 'No disponible').toUpperCase()}
                        </span>
                      </div>
                      {renderConfidenceBar(
                        showExample ? exampleResult["Clasificación"] : result?.["Clasificación"] || '',
                        showExample ? exampleResult["Confianza"] : result?.["Confianza"] || 0
                      )}
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>Confianza: {formatConfidence(showExample ? exampleResult["Confianza"] : result?.["Confianza"] || 0)}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    {/* Explicación */}
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">Explicación:</h5>
                      <p className="text-gray-800">
                        {showExample ? exampleResult["Explicación"] : result?.["Explicación"]}
                      </p>
                    </div>
                    
                    {/* Tema */}
                    <div className="mb-4">
                      <span className="font-medium text-gray-700">Tema: </span>
                      <span className="ml-1 px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {showExample ? exampleResult["Tema"] : result?.["Tema"]}
                      </span>
                    </div>
                    
                    {/* Palabras clave */}
                    {((showExample ? exampleResult["Palabras Clave"] : result?.["Palabras Clave"]) ?? []).length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Palabras clave:</h5>
                        <div className="flex flex-wrap gap-2">
                          {(showExample ? exampleResult["Palabras Clave"] : result?.["Palabras Clave"])?.map((keyword, index) => (
                            <span key={index} className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  {/* Vista previa o texto completo */}
                  {!showExample && result?.["Fuente"] && result?.["Fuente"] !== "Texto ingresado directamente" ? (
                    // Mostrar vista previa para URLs
                    renderSourcePreview(result["Fuente"])
                  ) : (
                    // Mostrar texto completo
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b text-sm font-medium text-gray-700">
                        Texto analizado
                      </div>
                      <div className="bg-white p-4 max-h-64 overflow-y-auto">
                        {(showExample ? exampleResult["Texto Completo"] : result?.["Texto Completo"] || '')
                          .split('\n')
                          .map((paragraph, idx) => (
                            paragraph ? <p key={idx} className="mb-2">{paragraph}</p> : <br key={idx} />
                          ))
                        }
                      </div>
                    </div>
                  )}
                  
                  {/* Fuente */}
                  {!showExample && result?.["Fuente"] && result?.["Fuente"] !== "Texto ingresado directamente" && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700 mb-1">Fuente original:</h5>
                      <a 
                        href={result["Fuente"]} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline break-all"
                      >
                        {result["Fuente"]}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Botón para cerrar el ejemplo */}
              {showExample && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setShowExample(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cerrar ejemplo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsVerifier;
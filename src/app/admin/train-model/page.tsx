'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Definimos la URL base de la API Gateway
const API_URL = 'http://localhost:5000/api';

const TrainModelPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [epochs, setEpochs] = useState(3);
  const [batchSize, setBatchSize] = useState(8);
  const [learningRate, setLearningRate] = useState(0.00002);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);

  // Redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!loading && (!user || user.rol !== 'admin')) {
      router.push('/');
    }
  }, [loading, user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('Archivo seleccionado:', files[0].name);
      setFile(files[0]);
      setFileName(files[0].name);
      setError(null); // Limpiar error previo al seleccionar nuevo archivo
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Iniciando envío del formulario');
    console.log('File state:', file);

    if (!file) {
      setError('Por favor, selecciona un archivo CSV de entrenamiento');
      return;
    }

    try {
      setIsTraining(true);
      setError(null);
      setProgress(0);
      setResult(null);

      // Crear FormData con los parámetros de entrenamiento
      const formData = new FormData();
      formData.append('file', file);
      formData.append('epochs', epochs.toString());
      formData.append('batch_size', batchSize.toString());
      formData.append('learning_rate', learningRate.toString());

      // Log para depuración
      console.log('FormData creado:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        epochs,
        batchSize,
        learningRate
      });

      // Simular progreso ya que la API real no envía actualizaciones de progreso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev === null) return 5;
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 1000);

      // Enviar solicitud de entrenamiento
      const response = await fetch(`${API_URL}/ml/train/train`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          // Importante: NO incluir 'Content-Type' aquí, 
          // deja que el navegador lo establezca con el boundary para multipart/form-data
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      console.log('Respuesta recibida:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.error || 'Error en el entrenamiento del modelo');
      }

      const data = await response.json();
      console.log('Datos de respuesta:', data);
      setResult(data);

      // Esperar 3 segundos antes de redirigir
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 3000);

    } catch (err) {
      console.error('Error completo:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsTraining(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFileName('');
    setEpochs(3);
    setBatchSize(8);
    setLearningRate(0.00002);
    setError(null);
    setProgress(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
                <h1 className="text-xl font-semibold text-gray-900">Entrenar Nuevo Modelo</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Sube un archivo CSV con datos de entrenamiento para mejorar el clasificador de noticias
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

            {result ? (
              <div className="text-center">
                <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6">
                  <h3 className="text-sm font-medium">¡Entrenamiento completado con éxito!</h3>
                  <p className="mt-2 text-sm">
                    El nuevo modelo ha sido entrenado y guardado. Se redirigirá al dashboard en breve...
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md text-left mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Resultados del entrenamiento:</h4>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <dt className="text-sm font-medium text-gray-500">Modelo ID:</dt>
                    <dd className="text-sm text-gray-900">{result.model_id}</dd>
                    
                    <dt className="text-sm font-medium text-gray-500">Precisión:</dt>
                    <dd className="text-sm text-gray-900">{(result.evaluation.precision * 100).toFixed(2)}%</dd>
                    
                    <dt className="text-sm font-medium text-gray-500">Recall:</dt>
                    <dd className="text-sm text-gray-900">{(result.evaluation.recall * 100).toFixed(2)}%</dd>
                    
                    <dt className="text-sm font-medium text-gray-500">F1-Score:</dt>
                    <dd className="text-sm text-gray-900">{(result.evaluation.f1_score * 100).toFixed(2)}%</dd>
                  </dl>
                </div>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Entrenar otro modelo
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Archivo CSV de entrenamiento</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label 
                          htmlFor="file-upload" 
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Subir archivo</span>
                          <input
                            id="file-upload"
                            name="file"
                            type="file"
                            ref={fileInputRef}
                            className="sr-only"
                            accept=".csv"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">o arrastra y suelta</p>
                      </div>
                      <p className="text-xs text-gray-500">CSV con columnas 'text' y 'label'</p>
                      {file && (
                        <p className="mt-2 text-xs text-green-500">
                          Archivo seleccionado: {fileName} ({(file.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="epochs" className="block text-sm font-medium text-gray-700">
                      Épocas de entrenamiento
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="epochs"
                        id="epochs"
                        min="1"
                        max="10"
                        value={epochs}
                        onChange={(e) => setEpochs(Number(e.target.value))}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Recomendado: 3-5 épocas</p>
                  </div>

                  <div>
                    <label htmlFor="batchSize" className="block text-sm font-medium text-gray-700">
                      Tamaño de batch
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="batchSize"
                        id="batchSize"
                        min="1"
                        max="32"
                        value={batchSize}
                        onChange={(e) => setBatchSize(Number(e.target.value))}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Recomendado: 8-16</p>
                  </div>

                  <div>
                    <label htmlFor="learningRate" className="block text-sm font-medium text-gray-700">
                      Tasa de aprendizaje
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="learningRate"
                        id="learningRate"
                        step="0.000001"
                        min="0.000001"
                        max="0.01"
                        value={learningRate}
                        onChange={(e) => setLearningRate(Number(e.target.value))}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Recomendado: 2e-5</p>
                  </div>
                </div>

                {progress !== null && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Progreso del entrenamiento</span>
                      <span className="text-sm font-medium text-gray-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    {progress < 100 && (
                      <p className="mt-2 text-xs text-gray-500">
                        El entrenamiento puede tardar varios minutos dependiendo del tamaño del dataset.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <Link
                    href="/admin/dashboard"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={isTraining || !file}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isTraining || !file ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                  >
                    {isTraining ? 'Entrenando...' : 'Iniciar entrenamiento'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainModelPage;
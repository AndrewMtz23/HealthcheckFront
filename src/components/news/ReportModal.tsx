import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Fuente } from '@/types/news';

interface ReportModalProps {
  fuente: Fuente;
  onClose: () => void;
}

const ReportModal = ({ fuente, onClose }: ReportModalProps) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Función para enviar reporte
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setMessage({ type: 'error', text: 'Por favor, proporciona un motivo para el reporte' });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('http://localhost:3003/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fuente_id: fuente.id,
          motivo: reason
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const mensaje = data.message || 'Error al enviar reporte';
      
        // Si el mensaje dice que ya se reportó, no lo trates como error grave
        if (mensaje.toLowerCase().includes('ya has reportado')) {
          setMessage({ type: 'error', text: mensaje }); // O type: 'info' si querés otro color
          return; // ← salimos sin tirar error
        }
      
        // Si es otro tipo de error, sí lo lanzamos
        throw new Error(mensaje);
      }      

      setMessage({ type: 'success', text: 'Reporte enviado correctamente' });

      // Cerrar modal automáticamente después de 2 segundos en caso de éxito
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error al enviar reporte:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al enviar reporte'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} className="fixed inset-0 flex items-center justify-center z-500">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Reportar fuente</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4 p-3 bg-yellow-50 rounded-md flex">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mr-3" />
            <div className="text-sm text-yellow-600">
              Estás a punto de reportar <strong>{fuente.nombre}</strong> como una fuente poco confiable.
              Este reporte será revisado por nuestro equipo.
            </div>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
              }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Motivo del reporte
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Explica por qué consideras que esta fuente es poco confiable..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
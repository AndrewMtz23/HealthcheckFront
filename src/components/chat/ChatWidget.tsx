'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

// Definimos la URL base de la API Gateway
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  onClose: () => void;
}

const ChatWidget = ({ onClose }: ChatWidgetProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'Hola, soy el asistente de HealthCheck. ¿En qué puedo ayudarte a verificar información sobre salud?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generar un ID de sesión único cuando se carga el componente
  useEffect(() => {
    // Usar el ID del usuario concatenado con un timestamp para crear un ID de sesión único
    const uniqueId = `${user?.id || 'guest'}_${Date.now()}`;
    setSessionId(uniqueId);
    
    // Enfocar el input cuando se monta el componente
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [user]);

  // Scroll automático al último mensaje con animación suave
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que hay texto en el input
    if (!input.trim()) return;
    
    // Obtener token de autenticación
    const token = localStorage.getItem('token');
    
    // Crear nuevo mensaje del usuario
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    // Actualizar estado
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Enviar mensaje al chatbot
      const response = await fetch(`${API_URL}/ml/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: input,
          session_id: sessionId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al comunicarse con el chatbot');
      }
      
      // Crear mensaje del bot
      const botMessage: Message = {
        role: 'bot',
        content: data.response || 'Lo siento, no pude procesar tu solicitud en este momento.',
        timestamp: new Date(),
      };
      
      // Actualizar estado con la respuesta del bot
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error en chatbot:', error);
      
      // Mensaje de error como respuesta del bot
      const errorMessage: Message = {
        role: 'bot',
        content: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo más tarde.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      // Enfocar el input después de enviar el mensaje
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Función para renderizar las burbujas de chat con animación
  const renderMessage = (message: Message, index: number) => {
    const isUserMessage = message.role === 'user';
    
    return (
      <div
        key={index}
        className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} animate-fadeIn`}
        style={{
          animationDelay: `${index * 0.1}s`,
        }}
      >
        {!isUserMessage && (
          <div className="flex-shrink-0 mr-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            </div>
          </div>
        )}
        
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-3 mb-2 ${
            isUserMessage
              ? 'bg-blue-600 text-white rounded-tr-none'
              : 'bg-gray-100 text-gray-800 rounded-tl-none'
          }`}
        >
          <div className="text-sm">{message.content}</div>
          <div
            className={`text-xs mt-1 ${
              isUserMessage ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
        
        {isUserMessage && (
          <div className="flex-shrink-0 ml-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm text-gray-600">{user?.nombre?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-80 sm:w-96 h-[500px] max-h-[80vh]' : 'w-64 h-16'
      }`}
    >
      {/* Cabecera */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
          </div>
          <h3 className="font-medium text-sm">Asistente HealthCheck</h3>
        </div>
        <div className="flex items-center space-x-2">
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Cerrar chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-white/80 hover:text-white transition-colors p-1"
            aria-label={isExpanded ? "Minimizar chat" : "Expandir chat"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              {isExpanded ? (
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Cuerpo del chat (solo visible cuando está expandido) */}
      {isExpanded && (
        <>
          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 bg-white space-y-4 scrollbar-thin">
            {messages.map((message, index) => renderMessage(message, index))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex-shrink-0 mr-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                  </div>
                </div>
                <div className="max-w-[75%] bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 mb-2">
                  <div className="flex space-x-1 items-center h-5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de entrada */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 bg-white rounded-b-2xl">
            <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 overflow-hidden pl-4 pr-1 py-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400 outline-none"
                placeholder="Escribe tu mensaje..."
                disabled={isTyping}
              />
              <button
                type="submit"
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  input.trim() && !isTyping 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!input.trim() || isTyping}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Disclaimer o notas al pie */}
            <div className="text-xs text-center text-gray-400 mt-2">
              Este asistente está entrenado para proporcionar información sobre temas de salud
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatWidget;
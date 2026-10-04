'use client';

import { useState, useEffect } from 'react';
import ChatWidget from './ChatWidget';
import { useAuth } from '@/context/AuthContext';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const { user } = useAuth();

  // Simular mensaje no leído después de 30 segundos
  useEffect(() => {
    if (user && !isOpen) {
      const timer = setTimeout(() => {
        setHasUnreadMessages(true);
      }, 30000);
      
      return () => clearTimeout(timer);
    }
    
    // Resetear los mensajes no leídos cuando se abre el chat
    if (isOpen) {
      setHasUnreadMessages(false);
    }
  }, [user, isOpen]);

  // Si el usuario no está autenticado, no mostrar el botón
  if (!user) {
    return null;
  }

  const handleButtonClick = () => {
    setIsOpen(true);
    setHasUnreadMessages(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <ChatWidget onClose={() => setIsOpen(false)} />
      ) : (
        <div className="relative">
          <button
            onClick={handleButtonClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            aria-label="Abrir chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            
            {/* Indicador de mensajes no leídos */}
            {hasUnreadMessages && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-pulse">
                1
              </span>
            )}
          </button>
          
          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-sm rounded-lg py-1 px-3 shadow-lg">
              <div className="relative">
                <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                <span>Asistente de salud</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatButton;
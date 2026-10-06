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
            className="group relative bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 dark:from-blue-800 dark:via-blue-700 dark:to-blue-900 text-white rounded-full w-16 h-16 shadow-[0_12px_32px_rgba(37,99,235,0.35)] ring-4 ring-white/40 dark:ring-slate-900/60 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-[0_16px_36px_rgba(37,99,235,0.45)]"
            aria-label="Abrir chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
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

            {hasUnreadMessages && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-[11px] font-semibold shadow-lg ring-2 ring-white">
                1
              </span>
            )}
          </button>

          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-3 pointer-events-none">
              <div className="relative bg-slate-900 text-white text-xs sm:text-sm font-medium rounded-xl px-3 py-2 shadow-[0_12px_28px_rgba(15,23,42,0.35)] whitespace-nowrap">
                <span>Asistente de salud</span>
                <div className="absolute -bottom-1.5 right-4 h-3 w-3 rotate-45 bg-slate-900 rounded-[2px]" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatButton;
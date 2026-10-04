'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  redirectToSearchPage?: boolean;
}

const SearchBar = ({ 
  onSearch, 
  placeholder = "Buscar noticias sobre salud...", 
  className = "",
  redirectToSearchPage = true
}: SearchBarProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Inicializar el estado con el query actual de los parámetros de búsqueda
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    if (onSearch) {
      onSearch(query);
    }
    
    if (redirectToSearchPage) {
      router.push(`/news?q=${encodeURIComponent(query)}`);
    }
  };

  // Efecto para actualizar el query si cambia en los parámetros de búsqueda
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  return (
    <form onSubmit={handleSubmit} className={`w-full flex ${className}`}>
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-3 sm:text-sm border-gray-300 rounded-l-md shadow-sm"
          placeholder={placeholder}
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Buscar
      </button>
    </form>
  );
};

export default SearchBar;
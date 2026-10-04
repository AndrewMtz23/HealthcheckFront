export interface ModelML {
    nombre: string;
    version: string;
    precision: number;
    recall: number;
    f1_score: number;
  }
  
  export interface Clasificacion {
    resultado: 'verdadera' | 'falsa' | 'dudosa';
    confianza: number;
    explicacion?: string;
    fecha_clasificacion: string;
    modelo?: ModelML;
  }
  
  export interface Tema {
    nombre: string;
  }
  
  export interface Fuente {
    id: number;
    nombre: string;
    url?: string;
    confiabilidad: number;
  }
  
  export interface MicrolinkData {
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
  
  export interface NewsItem {
    id: number;
    titulo: string;
    contenido: string;
    url?: string;
    fecha_publicacion?: string;
    tema?: Tema;
    fuente?: Fuente;
    clasificaciones?: Clasificacion[];
    preview?: MicrolinkData;
    userInteractions?: {
      marcar_confiable: boolean;
      marcar_dudosa: boolean;
      compartir: boolean;
    };
    interactionCounts?: {
      likes: number;
      dislikes: number;
    };
  }
  
  export interface UserInteraction {
    noticia_id: number;
    tipo_interaccion: 'marcar_confiable' | 'marcar_dudosa' | 'compartir';
  }
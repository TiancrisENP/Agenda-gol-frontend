// Cancha Types
export interface Cancha {
    id: string;
    nombre: string;
    descripcion?: string;
    ubicacion: string;
    capacidad: number;
    precioPorHora: number;
    tipo: TipoCancha;
    disponible: boolean;
    imagenUrl?: string;
    caracteristicas?: string[];
    horarioApertura?: string;
    horarioCierre?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export enum TipoCancha {
    FUTBOL_5 = 'FUTBOL_5',
    FUTBOL_7 = 'FUTBOL_7',
    FUTBOL_11 = 'FUTBOL_11',
    SINTETICA = 'SINTETICA',
    CESPED_NATURAL = 'CESPED_NATURAL'
  }
  
  export interface DisponibilidadSlot {
    fecha: string;
    horaInicio: string;
    horaFin: string;
    disponible: boolean;
    canchaId: string;
  }
  
  export interface CanchaFilters {
    tipo?: TipoCancha;
    disponible?: boolean;
    precioMin?: number;
    precioMax?: number;
    capacidadMin?: number;
    search?: string;
  }
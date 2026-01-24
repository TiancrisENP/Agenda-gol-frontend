import { fieldsClient } from './client';
import { Cancha, CanchaFilters, DisponibilidadSlot, TipoCancha } from '@/types/cancha.types';

// Backend response types
interface BackendFieldResponse {
  id: number;
  name: string;
  location: string;
  capacity: number;
  price_per_hour: number;
  description?: string | null;
  opening_time?: string | null; // Time format "HH:MM:SS"
  closing_time?: string | null; // Time format "HH:MM:SS"
  is_active?: boolean;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  created_by?: number | null;
}

/**
 * Transform backend field to frontend cancha format
 */
function transformBackendField(backendField: BackendFieldResponse): Cancha {
  // Convert time format "HH:MM:SS" to "HH:MM"
  const formatTime = (timeStr: string | null | undefined): string | undefined => {
    if (!timeStr) return undefined;
    return timeStr.substring(0, 5);
  };

  return {
    id: String(backendField.id),
    nombre: backendField.name,
    descripcion: backendField.description || undefined,
    ubicacion: backendField.location,
    capacidad: backendField.capacity,
    precioPorHora: backendField.price_per_hour,
    tipo: TipoCancha.SINTETICA, // Default type since backend doesn't have this field
    disponible: backendField.is_active ?? true,
    imagenUrl: undefined, // Backend doesn't have this field
    caracteristicas: undefined, // Backend doesn't have this field
    horarioApertura: formatTime(backendField.opening_time),
    horarioCierre: formatTime(backendField.closing_time),
    createdAt: backendField.created_at,
    updatedAt: backendField.updated_at,
  };
}

/**
 * Canchas API Service
 * Handles all cancha-related API calls
 */
export const canchasApi = {
  /**
   * Get all canchas with optional filters
   * @param filters - Optional filters for canchas
   * @returns Array of canchas
   */
  getAll: async (filters?: CanchaFilters): Promise<Cancha[]> => {
    try {
      const params = new URLSearchParams();
      
      // Backend accepts: skip, limit, is_active
      // Increase limit to get more results (backend default is 10)
      params.append('limit', '100');
      params.append('skip', '0');
      
      // Map frontend filters to backend parameters
      if (filters?.disponible !== undefined) {
        params.append('is_active', String(filters.disponible));
      }
      
      // Note: Backend doesn't support tipo, precioMin, precioMax, capacidadMin, search filters
      // These will be filtered client-side after fetching

      const queryString = params.toString();
      const url = queryString ? `/fields?${queryString}` : '/fields';
      
      const response = await fieldsClient.get(url);
      const data = response.data;
      
      // Backend returns FieldListResponse with {fields: [], total, page, size}
      let fieldsArray: BackendFieldResponse[] = [];
      
      if (data && typeof data === 'object' && 'fields' in data) {
        fieldsArray = Array.isArray(data.fields) ? data.fields : [];
      } else if (Array.isArray(data)) {
        fieldsArray = data;
      } else if (data?.data && Array.isArray(data.data)) {
        fieldsArray = data.data;
      }
      
      // Transform backend fields to frontend canchas format
      let canchas = fieldsArray.map(transformBackendField);
      
      // Apply client-side filters that backend doesn't support
      if (filters?.precioMin !== undefined) {
        canchas = canchas.filter(c => c.precioPorHora >= filters.precioMin!);
      }
      if (filters?.precioMax !== undefined) {
        canchas = canchas.filter(c => c.precioPorHora <= filters.precioMax!);
      }
      if (filters?.capacidadMin !== undefined) {
        canchas = canchas.filter(c => c.capacidad >= filters.capacidadMin!);
      }
      if (filters?.tipo !== undefined) {
        canchas = canchas.filter(c => c.tipo === filters.tipo);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        canchas = canchas.filter(c => 
          c.nombre.toLowerCase().includes(searchLower) ||
          c.ubicacion.toLowerCase().includes(searchLower) ||
          (c.descripcion && c.descripcion.toLowerCase().includes(searchLower))
        );
      }
      
      return canchas;
    } catch (error) {
      console.error('Get canchas error:', error);
      throw error;
    }
  },

  /**
   * Get cancha by ID
   * @param id - Cancha ID
   * @returns Cancha details
   */
  getById: async (id: string): Promise<Cancha> => {
    try {
      const response = await fieldsClient.get(`/fields/${id}`);
      const data = response.data?.data ?? response.data;
      return transformBackendField(data as BackendFieldResponse);
    } catch (error) {
      console.error('Get cancha error:', error);
      throw error;
    }
  },

  /**
   * Get cancha availability
   * @param id - Cancha ID
   * @param fecha - Date to check availability (YYYY-MM-DD)
   * @returns Array of available time slots
   */
  getDisponibilidad: async (id: string, fecha: string): Promise<DisponibilidadSlot[]> => {
    try {
      const response = await fieldsClient.get(`/fields/${id}/availability?date=${fecha}`);
      return (response.data?.data ?? response.data) as DisponibilidadSlot[];
    } catch (error) {
      console.error('Get disponibilidad error:', error);
      throw error;
    }
  },

  /**
   * Create new cancha (Admin only)
   * @param data - Cancha data
   * @returns Created cancha
   */
  create: async (data: Partial<Cancha>): Promise<Cancha> => {
    try {
      const response = await fieldsClient.post('/fields', data);
      return (response.data?.data ?? response.data) as Cancha;
    } catch (error) {
      console.error('Create cancha error:', error);
      throw error;
    }
  },

  /**
   * Update cancha (Admin only)
   * @param id - Cancha ID
   * @param data - Updated cancha data
   * @returns Updated cancha
   */
  update: async (id: string, data: Partial<Cancha>): Promise<Cancha> => {
    try {
      const response = await fieldsClient.put(`/fields/${id}`, data);
      return (response.data?.data ?? response.data) as Cancha;
    } catch (error) {
      console.error('Update cancha error:', error);
      throw error;
    }
  },

  /**
   * Delete cancha (Admin only)
   * @param id - Cancha ID
   */
  delete: async (id: string): Promise<void> => {
    try {
      await fieldsClient.delete(`/fields/${id}`);
    } catch (error) {
      console.error('Delete cancha error:', error);
      throw error;
    }
  },
};
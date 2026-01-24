import { reservationsClient } from './client';
import { Reserva, CreateReservaData, UpdateReservaData, ReservaFilters } from '@/types/reserva.types';

/**
 * Reservas API Service
 * Handles all reserva-related API calls
 */
export const reservasApi = {
  /**
   * Get all reservas for current user with optional filters
   * @param filters - Optional filters for reservas
   * @returns Array of reservas
   */
  getMisReservas: async (filters?: ReservaFilters): Promise<Reserva[]> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.estado) params.append('estado', filters.estado);
      if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
      if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
      if (filters?.canchaId) params.append('canchaId', filters.canchaId);

      const queryString = params.toString();
      const url = queryString ? `/reservations/my?${queryString}` : '/reservations/my';
      
      const response = await reservationsClient.get(url);
      const data = response.data;
      
      // Backend returns ReservationListResponse with {reservations: [], total, page, size}
      if (data && typeof data === 'object' && 'reservations' in data) {
        return Array.isArray(data.reservations) ? data.reservations : [];
      }
      
      // If it's already an array, return it
      if (Array.isArray(data)) {
        return data;
      }
      
      // If it has nested data.data, try that
      if (data?.data) {
        return Array.isArray(data.data) ? data.data : [];
      }
      
      // Default to empty array
      return [];
    } catch (error) {
      console.error('Get mis reservas error:', error);
      throw error;
    }
  },

  /**
   * Get all reservas (Admin only)
   * @param filters - Optional filters for reservas
   * @returns Array of all reservas
   */
  getAll: async (filters?: ReservaFilters): Promise<Reserva[]> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.estado) params.append('estado', filters.estado);
      if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
      if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
      if (filters?.canchaId) params.append('canchaId', filters.canchaId);

      const queryString = params.toString();
      const url = queryString ? `/reservations?${queryString}` : '/reservations';
      
      const response = await reservationsClient.get(url);
      const data = response.data;
      
      // Backend returns ReservationListResponse with {reservations: [], total, page, size}
      if (data && typeof data === 'object' && 'reservations' in data) {
        return Array.isArray(data.reservations) ? data.reservations : [];
      }
      
      // If it's already an array, return it
      if (Array.isArray(data)) {
        return data;
      }
      

      if (data?.data) {
        return Array.isArray(data.data) ? data.data : [];
      }
      
      // Default to empty array
      return [];
    } catch (error) {
      console.error('Get all reservas error:', error);
      throw error;
    }
  },

  /**
   * Get reserva by ID
   * @param id - Reserva ID
   * @returns Reserva details
   */
  getById: async (id: string): Promise<Reserva> => {
    try {
      const response = await reservationsClient.get(`/reservations/${id}`);
      return (response.data?.data ?? response.data) as Reserva;
    } catch (error) {
      console.error('Get reserva error:', error);
      throw error;
    }
  },

  /**
   * Create new reserva
   * @param data - Reserva data
   * @returns Created reserva
   */
  create: async (data: CreateReservaData): Promise<Reserva> => {
    try {
      const response = await reservationsClient.post('/reservations', data);
      return (response.data?.data ?? response.data) as Reserva;
    } catch (error) {
      console.error('Create reserva error:', error);
      throw error;
    }
  },

  /**
   * Update reserva
   * @param id - Reserva ID
   * @param data - Updated reserva data
   * @returns Updated reserva
   */
  update: async (id: string, data: UpdateReservaData): Promise<Reserva> => {
    try {
      const response = await reservationsClient.put(`/reservations/${id}`, data);
      return (response.data?.data ?? response.data) as Reserva;
    } catch (error) {
      console.error('Update reserva error:', error);
      throw error;
    }
  },

  /**
   * Cancel reserva
   * @param id - Reserva ID
   * @returns Cancelled reserva
   */
  cancel: async (id: string): Promise<Reserva> => {
    try {
      const response = await reservationsClient.post(`/reservations/${id}/cancel`);
      return (response.data?.data ?? response.data) as Reserva;
    } catch (error) {
      console.error('Cancel reserva error:', error);
      throw error;
    }
  },

  /**
   * Delete reserva (Admin only)
   * @param id - Reserva ID
   */
  delete: async (id: string): Promise<void> => {
    try {
      await reservationsClient.delete(`/reservations/${id}`);
    } catch (error) {
      console.error('Delete reserva error:', error);
      throw error;
    }
  },
};
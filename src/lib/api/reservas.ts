import { reservationsClient } from './client';
import {
  Reserva,
  CreateReservaData,
  UpdateReservaData,
  ReservaFilters,
  EstadoReserva,
} from '@/types/reserva.types';

interface BackendReservation {
  id: number;
  user_id: number;
  field_id: number;
  start_time: string;
  end_time: string;
  duration_hours: number;
  field_name: string;
  field_location: string;
  total_price: number;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toBackendStatus(estado?: EstadoReserva): string | undefined {
  if (estado === EstadoReserva.CONFIRMADA) return 'confirmada';
  if (estado === EstadoReserva.CANCELADA) return 'cancelada';
  return undefined;
}

function toFrontendStatus(status: string): EstadoReserva {
  if (status === 'cancelada') return EstadoReserva.CANCELADA;
  return EstadoReserva.CONFIRMADA;
}

function durationHours(horaInicio: string, horaFin: string): number {
  const [startHour, startMin] = horaInicio.split(':').map(Number);
  const [endHour, endMin] = horaFin.split(':').map(Number);
  return (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
}

function transformReservation(reservation: BackendReservation): Reserva {
  const start = new Date(reservation.start_time);
  const end = new Date(reservation.end_time);

  return {
    id: String(reservation.id),
    userId: String(reservation.user_id),
    canchaId: String(reservation.field_id),
    fecha: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    horaInicio: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    horaFin: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
    estado: toFrontendStatus(reservation.status),
    precioTotal: reservation.total_price,
    notasAdicionales: reservation.notes || undefined,
    cancha: {
      nombre: reservation.field_name,
      ubicacion: reservation.field_location,
      tipo: '',
    },
    createdAt: reservation.created_at,
    updatedAt: reservation.updated_at,
  };
}

function extractReservations(data: any): BackendReservation[] {
  if (data && typeof data === 'object' && Array.isArray(data.reservations)) {
    return data.reservations;
  }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function applyClientFilters(reservas: Reserva[], filters?: ReservaFilters): Reserva[] {
  return reservas.filter((reserva) => {
    if (filters?.estado && reserva.estado !== filters.estado) return false;
    if (filters?.canchaId && reserva.canchaId !== filters.canchaId) return false;
    if (filters?.fechaInicio && reserva.fecha < filters.fechaInicio) return false;
    if (filters?.fechaFin && reserva.fecha > filters.fechaFin) return false;
    return true;
  });
}

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
      params.append('limit', '100');
      params.append('skip', '0');

      const status = toBackendStatus(filters?.estado);
      if (status) params.append('status', status);

      const response = await reservationsClient.get(`/reservations/my?${params.toString()}`);
      const reservas = extractReservations(response.data).map(transformReservation);
      return applyClientFilters(reservas, filters);
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
      params.append('limit', '100');
      params.append('skip', '0');

      const status = toBackendStatus(filters?.estado);
      if (status) params.append('status', status);
      if (filters?.canchaId) params.append('field_id', filters.canchaId);

      const response = await reservationsClient.get(`/reservations/?${params.toString()}`);
      const reservas = extractReservations(response.data).map(transformReservation);
      return applyClientFilters(reservas, filters);
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
      const data = response.data?.data ?? response.data;
      return transformReservation(data as BackendReservation);
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
      const payload = {
        field_id: Number(data.canchaId),
        start_time: `${data.fecha}T${data.horaInicio}:00`,
        duration_hours: durationHours(data.horaInicio, data.horaFin),
        notes: data.notasAdicionales ?? null,
      };
      const response = await reservationsClient.post('/reservations/', payload);
      const created = response.data?.data ?? response.data;
      return transformReservation(created as BackendReservation);
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
      const payload: Record<string, unknown> = {};

      if (data.fecha && data.horaInicio) {
        payload.start_time = `${data.fecha}T${data.horaInicio}:00`;
      }
      if (data.horaInicio && data.horaFin) {
        payload.duration_hours = durationHours(data.horaInicio, data.horaFin);
      }
      if (data.notasAdicionales !== undefined) {
        payload.notes = data.notasAdicionales;
      }

      const response = await reservationsClient.put(`/reservations/${id}`, payload);
      const updated = response.data?.data ?? response.data;
      return transformReservation(updated as BackendReservation);
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
      await reservationsClient.post(`/reservations/${id}/cancel`, {});
      return await reservasApi.getById(id);
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

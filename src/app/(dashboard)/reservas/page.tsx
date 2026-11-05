'use client';

import React, { useState, useEffect } from 'react';
import { Reserva, EstadoReserva } from '@/types/reserva.types';
import { reservasApi } from '@/lib/api/reservas';
import { ReservaCard } from '@/components/reservas/ReservaCard';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Calendar, RefreshCw } from 'lucide-react';
import { ApiError } from '@/lib/api/client';

/**
 * Reservas Page
 * Lists user's reservations with filtering by status
 */
export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<EstadoReserva | 'TODAS'>('TODAS');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fetch reservas
  const fetchReservas = async () => {
    setIsLoading(true);
    setError(null);

    const filters = estadoFilter !== 'TODAS' ? { estado: estadoFilter } : undefined;

    const load = () => reservasApi.getMisReservas(filters);
    const canRetry = (err: unknown) =>
      err instanceof ApiError &&
      (err.status === 0 || err.status === 502 || err.status === 503 || err.message.includes('Reintentar'));

    try {
      try {
        setReservas(await load());
      } catch (err) {
        if (!canRetry(err)) throw err;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setReservas(await load());
      }
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : 'Error al cargar las reservas. Por favor, intenta nuevamente.';
      setError(errorMessage);
      console.error('Error fetching reservas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load reservas on mount and when filter changes
  useEffect(() => {
    fetchReservas();
  }, [estadoFilter]);

  // Handle cancel reservation
  const handleCancel = async (reserva: Reserva) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    setCancellingId(reserva.id);

    try {
      await reservasApi.cancel(reserva.id);
      
      // Refresh reservas
      await fetchReservas();
      
      alert('Reserva cancelada exitosamente');
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : 'Error al cancelar la reserva. Por favor, intenta nuevamente.';
      alert(errorMessage);
      console.error('Error cancelling reserva:', err);
    } finally {
      setCancellingId(null);
    }
  };

  // Handle edit reservation
  const handleEdit = (reserva: Reserva) => {
    // TODO: Open edit modal
    console.log('Edit reserva:', reserva);
  };

  // Group reservas by status - ensure reservas is always an array
  const reservasArray = Array.isArray(reservas) ? reservas : [];
  const reservasActivas = reservasArray.filter(
    (r) => r.estado === EstadoReserva.CONFIRMADA || r.estado === EstadoReserva.PENDIENTE
  );
  const reservasCanceladas = reservasArray.filter((r) => r.estado === EstadoReserva.CANCELADA);
  const reservasCompletadas = reservasArray.filter((r) => r.estado === EstadoReserva.COMPLETADA);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus reservas de canchas
          </p>
        </div>

        <Button variant="primary" onClick={fetchReservas} disabled={isLoading}>
          <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex gap-1 overflow-x-auto">
        {[
          { label: 'Todas', value: 'TODAS', count: reservasArray.length },
          { label: 'Activas', value: EstadoReserva.CONFIRMADA, count: reservasActivas.length },
          { label: 'Canceladas', value: EstadoReserva.CANCELADA, count: reservasCanceladas.length },
          { label: 'Completadas', value: EstadoReserva.COMPLETADA, count: reservasCompletadas.length },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setEstadoFilter(tab.value as any)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              estadoFilter === tab.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs opacity-75">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error al cargar las reservas</p>
            <p className="text-sm mt-1">{error}</p>
            <Button variant="ghost" size="sm" onClick={fetchReservas} className="mt-2">
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reservas Grid */}
      {!isLoading && !error && reservas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservas.map((reserva) => (
            <ReservaCard
              key={reserva.id}
              reserva={reserva}
              onCancel={handleCancel}
              onEdit={handleEdit}
              showActions={
                reserva.estado === EstadoReserva.CONFIRMADA ||
                reserva.estado === EstadoReserva.PENDIENTE
              }
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && reservasArray.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes reservas
            {estadoFilter !== 'TODAS' && ` ${estadoFilter.toLowerCase()}`}
          </h3>
          <p className="text-gray-600 mb-4">
            Explora nuestras canchas disponibles y haz tu primera reserva
          </p>
          <Button variant="primary" onClick={() => (window.location.href = '/canchas')}>
            Ver Canchas
          </Button>
        </div>
      )}
    </div>
  );
}
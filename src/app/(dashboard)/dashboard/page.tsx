'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { reservasApi } from '@/lib/api/reservas';
import { canchasApi } from '@/lib/api/canchas';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Calendar, MapPin, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Reserva, EstadoReserva } from '@/types/reserva.types';
import { Cancha } from '@/types/cancha.types';
import Link from 'next/link';

/**
 * Dashboard Page
 * Overview of user statistics and recent activity
 */
export default function DashboardPage() {
  const { user, loadUser } = useAuthStore();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [reservasData, canchasData] = await Promise.all([
          reservasApi.getMisReservas().catch(() => []),
          canchasApi.getAll().catch(() => []),
        ]);

        setReservas(Array.isArray(reservasData) ? reservasData : []);
        setCanchas(Array.isArray(canchasData) ? canchasData : []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics - ensure arrays are always arrays
  const reservasArray = Array.isArray(reservas) ? reservas : [];
  const canchasArray = Array.isArray(canchas) ? canchas : [];
  
  const reservasActivas = reservasArray.filter(
    (r) => r.estado === EstadoReserva.CONFIRMADA || r.estado === EstadoReserva.PENDIENTE
  ).length;

  const reservasPendientes = reservasArray.filter(
    (r) => r.estado === EstadoReserva.PENDIENTE
  ).length;

  const totalGastado = reservasArray
    .filter((r) => r.estado !== EstadoReserva.CANCELADA)
    .reduce((sum, r) => sum + (r.precioTotal || 0), 0);

  const canchasDisponibles = canchasArray.filter((c) => c.disponible).length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Bienvenido{user?.nombre ? `, ${user.nombre}` : ''}!
        </h1>
        <p className="text-gray-600 mt-1">
          Aquí está un resumen de tu actividad reciente
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Reservas Activas */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Reservas Activas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{reservasActivas}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Reservas Pendientes */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{reservasPendientes}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Gastado */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Gastado</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatPrice(totalGastado)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Canchas Disponibles */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Canchas Disponibles</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{canchasDisponibles}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reservations */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          {reservasActivas > 0 ? (
            <div className="space-y-4">
              {reservasArray
                .filter(
                  (r) => r.estado === EstadoReserva.CONFIRMADA || r.estado === EstadoReserva.PENDIENTE
                )
                .slice(0, 5)
                .map((reserva) => (
                  <div
                    key={reserva.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {reserva.cancha?.nombre || 'Cancha'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {reserva.fecha} • {reserva.horaInicio} - {reserva.horaFin}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatPrice(reserva.precioTotal || 0)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                          reserva.estado === EstadoReserva.CONFIRMADA
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {reserva.estado}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No tienes reservas activas</p>
              <Link
                href="/canchas"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
              >
                Explorar canchas
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
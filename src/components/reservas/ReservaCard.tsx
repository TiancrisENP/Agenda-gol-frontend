'use client';

import React from 'react';
import { Reserva, EstadoReserva } from '@/types/reserva.types';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Calendar, Clock, DollarSign, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReservaCardProps {
  reserva: Reserva;
  onCancel?: (reserva: Reserva) => void;
  onEdit?: (reserva: Reserva) => void;
  showActions?: boolean;
}

/**
 * Reserva Card Component
 * Displays reservation information in a card format
 */
export const ReservaCard: React.FC<ReservaCardProps> = ({
  reserva,
  onCancel,
  onEdit,
  showActions = true,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  };

  const getEstadoColor = (estado: EstadoReserva) => {
    switch (estado) {
      case EstadoReserva.CONFIRMADA:
        return 'bg-green-100 text-green-800';
      case EstadoReserva.PENDIENTE:
        return 'bg-yellow-100 text-yellow-800';
      case EstadoReserva.CANCELADA:
        return 'bg-red-100 text-red-800';
      case EstadoReserva.COMPLETADA:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancel = reserva.estado === EstadoReserva.CONFIRMADA || 
                    reserva.estado === EstadoReserva.PENDIENTE;

  return (
    <Card hover>
      <CardContent className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {reserva.cancha?.nombre || 'Cancha'}
            </h3>
            {reserva.cancha?.ubicacion && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {reserva.cancha.ubicacion}
              </div>
            )}
          </div>
          
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getEstadoColor(reserva.estado)}`}>
            {reserva.estado}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-700">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formatDate(reserva.fecha)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-700">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              {reserva.horaInicio} - {reserva.horaFin}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-700">
            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-semibold text-green-600">
              {formatPrice(reserva.precioTotal)}
            </span>
          </div>

          {reserva.notasAdicionales && (
            <div className="flex items-start text-sm text-gray-700">
              <FileText className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
              <span className="flex-1">{reserva.notasAdicionales}</span>
            </div>
          )}
        </div>

        {/* Cancha Type */}
        {reserva.cancha?.tipo && (
          <div>
            <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {reserva.cancha.tipo.replace(/_/g, ' ')}
            </span>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter>
          <div className="flex gap-2 w-full">
            {onEdit && canCancel && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(reserva)}
                className="flex-1"
              >
                Editar
              </Button>
            )}
            
            {onCancel && canCancel && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onCancel(reserva)}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
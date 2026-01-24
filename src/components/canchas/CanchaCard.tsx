'use client';

import React from 'react';
import { Cancha } from '@/types/cancha.types';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Users, DollarSign, Clock } from 'lucide-react';

interface CanchaCardProps {
  cancha: Cancha;
  onReserve?: (cancha: Cancha) => void;
  onViewDetails?: (cancha: Cancha) => void;
}

/**
 * Cancha Card Component
 * Displays cancha information in a card format
 */
export const CanchaCard: React.FC<CanchaCardProps> = ({
  cancha,
  onReserve,
  onViewDetails,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card hover className="h-full flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-green-400 to-green-600 rounded-t-lg overflow-hidden">
        {cancha.imagenUrl ? (
          <img
            src={cancha.imagenUrl}
            alt={cancha.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <MapPin className="w-16 h-16 opacity-50" />
          </div>
        )}
        
        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              cancha.disponible
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {cancha.disponible ? 'Disponible' : 'No disponible'}
          </span>
        </div>
      </div>

      <CardContent className="flex-1 pt-4">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {cancha.nombre}
        </h3>

        {/* Description */}
        {cancha.descripcion && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {cancha.descripcion}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span>{cancha.ubicacion}</span>
          </div>

          <div className="flex items-center text-sm text-gray-700">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span>Capacidad: {cancha.capacidad} personas</span>
          </div>

          <div className="flex items-center text-sm text-gray-700">
            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-semibold text-green-600">
              {formatPrice(cancha.precioPorHora)}/hora
            </span>
          </div>

          {cancha.horarioApertura && cancha.horarioCierre && (
            <div className="flex items-center text-sm text-gray-700">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <span>
                {cancha.horarioApertura} - {cancha.horarioCierre}
              </span>
            </div>
          )}
        </div>

        {/* Type Badge */}
        {cancha.tipo && (
          <div className="mt-4">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {cancha.tipo.replace(/_/g, ' ')}
            </span>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="border-t-0">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          {onViewDetails && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewDetails(cancha)}
              className="flex-1 w-full sm:w-auto"
            >
              Ver Detalles
            </Button>
          )}
          
          {onReserve && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onReserve(cancha)}
              disabled={!cancha.disponible}
              className="flex-1 w-full sm:w-auto"
            >
              {cancha.disponible ? 'Reservar Ahora' : 'No Disponible'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
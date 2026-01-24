'use client';

import React, { useState, useEffect } from 'react';
import { Cancha, CanchaFilters } from '@/types/cancha.types';
import { canchasApi } from '@/lib/api/canchas';
import { CanchaCard } from '@/components/canchas/CanchaCard';
import { CreateReservaModal } from '@/components/reservas/CreateReservaModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Filter, AlertCircle, MapPin } from 'lucide-react';
import { ApiError } from '@/lib/api/client';

/**
 * Canchas Page
 * Lists all available canchas with filtering and reservation
 */
export default function CanchasPage() {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CanchaFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal state
  const [selectedCancha, setSelectedCancha] = useState<Cancha | null>(null);
  const [showReservaModal, setShowReservaModal] = useState(false);

  // Fetch canchas
  const fetchCanchas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await canchasApi.getAll({
        ...filters,
        search: searchTerm || undefined,
      });
      setCanchas(data);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : 'Error al cargar las canchas. Por favor, intenta nuevamente.';
      setError(errorMessage);
      console.error('Error fetching canchas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load canchas on mount and when filters change
  useEffect(() => {
    fetchCanchas();
  }, [filters]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCanchas();
  };

  // Handle filter change
  const handleFilterChange = (key: keyof CanchaFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // Handle reserve - Open modal
  const handleReserve = (cancha: Cancha) => {
    if (!cancha.disponible) {
      alert('Esta cancha no está disponible en este momento');
      return;
    }
    setSelectedCancha(cancha);
    setShowReservaModal(true);
  };

  // Handle view details
  const handleViewDetails = (cancha: Cancha) => {
    // Show cancha details in an alert for now
    alert(`
      📋 DETALLES DE LA CANCHA
      
      Nombre: ${cancha.nombre}
      Ubicación: ${cancha.ubicacion}
      Capacidad: ${cancha.capacidad} personas
      Precio: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cancha.precioPorHora)}/hora
      Tipo: ${cancha.tipo}
      ${cancha.descripcion ? `\nDescripción: ${cancha.descripcion}` : ''}
      ${cancha.horarioApertura && cancha.horarioCierre ? `\nHorario: ${cancha.horarioApertura} - ${cancha.horarioCierre}` : ''}
    `);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowReservaModal(false);
    setSelectedCancha(null);
    // Refresh canchas to update availability
    fetchCanchas();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Canchas Disponibles</h1>
          <p className="text-gray-600 mt-1">
            Encuentra la cancha perfecta para tu partido
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por nombre o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <Button type="submit" variant="primary" className="sm:w-auto">
            Buscar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto"
          >
            <Filter className="w-5 h-5 sm:mr-2" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disponibilidad
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.disponible === undefined ? '' : String(filters.disponible)}
                onChange={(e) =>
                  handleFilterChange(
                    'disponible',
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )
                }
              >
                <option value="">Todas</option>
                <option value="true">Disponibles</option>
                <option value="false">No disponibles</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Mínimo
              </label>
              <Input
                type="number"
                placeholder="0"
                value={filters.precioMin || ''}
                onChange={(e) =>
                  handleFilterChange('precioMin', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Máximo
              </label>
              <Input
                type="number"
                placeholder="1000000"
                value={filters.precioMax || ''}
                onChange={(e) =>
                  handleFilterChange('precioMax', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Error al cargar las canchas</p>
            <p className="text-sm mt-1">{error}</p>
            <Button variant="ghost" size="sm" onClick={fetchCanchas} className="mt-2">
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <div className="bg-white p-4 sm:p-6 rounded-b-lg border border-gray-200">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Canchas Grid */}
      {!isLoading && !error && canchas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {canchas.map((cancha) => (
            <CanchaCard
              key={cancha.id}
              cancha={cancha}
              onReserve={handleReserve}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && canchas.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron canchas
          </h3>
          <p className="text-gray-600">
            Intenta ajustar tus filtros de búsqueda
          </p>
        </div>
      )}

      {/* Create Reserva Modal */}
      {selectedCancha && (
        <CreateReservaModal
          isOpen={showReservaModal}
          onClose={handleCloseModal}
          cancha={selectedCancha}
        />
      )}
    </div>
  );
}
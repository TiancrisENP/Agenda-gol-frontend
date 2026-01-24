'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Cancha } from '@/types/cancha.types';
import { CreateReservaData } from '@/types/reserva.types';
import { reservasApi } from '@/lib/api/reservas';
import { canchasApi } from '@/lib/api/canchas';
import { ApiError } from '@/lib/api/client';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateReservaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cancha: Cancha;
}

/**
 * Create Reserva Modal
 * Modal para crear una nueva reserva con validación y disponibilidad
 */
export const CreateReservaModal: React.FC<CreateReservaModalProps> = ({
  isOpen,
  onClose,
  cancha,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    fecha: '',
    horaInicio: '',
    horaFin: '',
    notasAdicionales: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    fecha?: string;
    horaInicio?: string;
    horaFin?: string;
  }>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fecha: '',
        horaInicio: '',
        horaFin: '',
        notasAdicionales: '',
      });
      setValidationErrors({});
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  // Load available slots when date changes
  useEffect(() => {
    if (formData.fecha) {
      loadAvailableSlots();
    }
  }, [formData.fecha]);

  const loadAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const slots = await canchasApi.getDisponibilidad(cancha.id, formData.fecha);
      const times = slots
        .filter(slot => slot.disponible)
        .map(slot => slot.horaInicio);
      setAvailableSlots(times);
    } catch (err) {
      console.error('Error loading slots:', err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear global error
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    
    // Validar fecha
    if (!formData.fecha) {
      errors.fecha = 'La fecha es requerida';
    } else {
      const selectedDate = new Date(formData.fecha);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.fecha = 'No puedes reservar en fechas pasadas';
      }
      
      // Validar máximo 30 días de anticipación
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);
      if (selectedDate > maxDate) {
        errors.fecha = 'No puedes reservar con más de 30 días de anticipación';
      }
    }
    
    // Validar hora inicio
    if (!formData.horaInicio) {
      errors.horaInicio = 'La hora de inicio es requerida';
    }
    
    // Validar hora fin
    if (!formData.horaFin) {
      errors.horaFin = 'La hora de fin es requerida';
    }
    
    // Validar que hora fin sea después de hora inicio
    if (formData.horaInicio && formData.horaFin) {
      const [startHour, startMin] = formData.horaInicio.split(':').map(Number);
      const [endHour, endMin] = formData.horaFin.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (endMinutes <= startMinutes) {
        errors.horaFin = 'La hora de fin debe ser posterior a la hora de inicio';
      }
      
      // Validar duración (1 o 2 horas)
      const duration = endMinutes - startMinutes;
      if (duration !== 60 && duration !== 120) {
        errors.horaFin = 'La reserva debe ser de 1 o 2 horas';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const reservaData: CreateReservaData = {
        canchaId: cancha.id,
        fecha: formData.fecha,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        notasAdicionales: formData.notasAdicionales || undefined,
      };
      
      await reservasApi.create(reservaData);
      
      setSuccess(true);
      
      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        onClose();
        router.push('/reservas');
      }, 1500);
      
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Error al crear la reserva. Por favor, intenta nuevamente.';
      setError(errorMessage);
      console.error('Create reserva error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calcular precio estimado
  const calculatePrice = () => {
    if (!formData.horaInicio || !formData.horaFin) return 0;
    
    const [startHour, startMin] = formData.horaInicio.split(':').map(Number);
    const [endHour, endMin] = formData.horaFin.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const durationHours = (endMinutes - startMinutes) / 60;
    
    return cancha.precioPorHora * durationHours;
  };

  const estimatedPrice = calculatePrice();

  // Generar opciones de hora
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 10; hour <= 22; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      options.push(`${hourStr}:00`);
    }
    return options;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reservar ${cancha.nombre}`}
      size="lg"
    >
      {success ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¡Reserva Creada!
          </h3>
          <p className="text-gray-600">
            Redirigiendo a tus reservas...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Información de la cancha */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">{cancha.nombre}</h4>
            <p className="text-sm text-gray-600">{cancha.ubicacion}</p>
            <p className="text-sm font-semibold text-blue-600 mt-2">
              {formatPrice(cancha.precioPorHora)}/hora
            </p>
          </div>

          {/* Error global */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Fecha */}
            <Input
              type="date"
              name="fecha"
              label="Fecha"
              value={formData.fecha}
              onChange={handleChange}
              error={validationErrors.fecha}
              icon={<Calendar className="w-5 h-5" />}
              required
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            />

            {/* Hora inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Inicio <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Clock className="w-5 h-5" />
                </div>
                <select
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!formData.fecha || loadingSlots}
                >
                  <option value="">Seleccionar hora</option>
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              {validationErrors.horaInicio && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.horaInicio}</p>
              )}
            </div>

            {/* Hora fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Fin <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Clock className="w-5 h-5" />
                </div>
                <select
                  name="horaFin"
                  value={formData.horaFin}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!formData.horaInicio}
                >
                  <option value="">Seleccionar hora</option>
                  {generateTimeOptions()
                    .filter(time => time > formData.horaInicio)
                    .map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                </select>
              </div>
              {validationErrors.horaFin && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.horaFin}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                La reserva debe ser de 1 o 2 horas
              </p>
            </div>

            {/* Notas adicionales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Adicionales (Opcional)
              </label>
              <textarea
                name="notasAdicionales"
                value={formData.notasAdicionales}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Reserva para partido de cumpleaños"
              />
            </div>

            {/* Precio estimado */}
            {estimatedPrice > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Precio Total Estimado:
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {formatPrice(estimatedPrice)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <ModalFooter className="mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Crear Reserva
            </Button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
};
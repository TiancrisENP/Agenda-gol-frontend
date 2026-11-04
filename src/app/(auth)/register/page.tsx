'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from "next/navigation";
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, User, Phone, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Register Page
 * User registration page
 */
export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.password) {
      setFormError('Por favor, completa todos los campos obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await register({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono || undefined,
      });
      
      // Redirect to reservas page on success
      router.push('/reservas');
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : 'Error al registrar usuario. Por favor, intenta nuevamente.';
      setFormError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">AgendaGol</h1>
          <p className="text-gray-600">Sistema de Reservas de Canchas</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="mb-6">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">
              Crear Cuenta
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Completa el formulario para registrarte
            </p>
          </div>

          {/* Error Message */}
          {(formError || error) && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{formError || error}</p>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                name="nombre"
                label="Nombre"
                placeholder="Juan"
                value={formData.nombre}
                onChange={handleChange}
                icon={<User className="w-5 h-5" />}
                required
                disabled={isLoading}
                autoComplete="given-name"
              />

              <Input
                type="text"
                name="apellido"
                label="Apellido"
                placeholder="Pérez"
                value={formData.apellido}
                onChange={handleChange}
                icon={<User className="w-5 h-5" />}
                required
                disabled={isLoading}
                autoComplete="family-name"
              />
            </div>

            <Input
              type="email"
              name="email"
              label="Correo Electrónico"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail className="w-5 h-5" />}
              required
              disabled={isLoading}
              autoComplete="email"
            />

            <Input
              type="tel"
              name="telefono"
              label="Teléfono (Opcional)"
              placeholder="+1234567890"
              value={formData.telefono}
              onChange={handleChange}
              icon={<Phone className="w-5 h-5" />}
              disabled={isLoading}
              autoComplete="tel"
            />

            <Input
              type="password"
              name="password"
              label="Contraseña"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock className="w-5 h-5" />}
              required
              disabled={isLoading}
              autoComplete="new-password"
              helperText="Mínimo 6 caracteres"
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirmar Contraseña"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={<Lock className="w-5 h-5" />}
              required
              disabled={isLoading}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              Registrarse
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, UserCircle } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { User, UserRole } from '@/types/auth.types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function displayName(user: User): string {
  return [user.nombre, user.apellido].filter(Boolean).join(' ');
}

function roleLabel(rol: UserRole): string {
  if (rol === UserRole.ADMIN) return 'Administrador';
  if (rol === UserRole.MANAGER) return 'Encargado';
  return 'Jugador';
}

/**
 * Profile page
 * Loads the signed-in user from GET /auth/me and updates the username with PATCH /auth/profile.
 */
export default function PerfilPage() {
  const updateUser = useAuthStore((state) => state.updateUser);
  const [profile, setProfile] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await authApi.getProfile();
      setProfile(data);
      setUsername(displayName(data));
      updateUser(data);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : 'Error al cargar el perfil. Por favor, intenta nuevamente.';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // The store action is stable; the profile is loaded once when the section opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = username.trim();

    if (!trimmed) {
      setSaveError('El usuario es obligatorio.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaved(false);

    try {
      const data = await authApi.updateProfile({ username: trimmed });
      setProfile(data);
      setUsername(displayName(data));
      updateUser(data);
      setSaved(true);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : 'No se pudo guardar el perfil. Por favor, intenta nuevamente.';
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi perfil</h1>
          <p className="text-gray-600 mt-1">
            Datos de la cuenta con la que reservas la cancha
          </p>
        </div>

        <Button variant="primary" onClick={fetchProfile} disabled={isLoading}>
          <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error al cargar el perfil</p>
            <p className="text-sm mt-1">{error}</p>
            <Button variant="ghost" size="sm" onClick={fetchProfile} className="mt-2">
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {isLoading && !profile && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      )}

      {profile && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <UserCircle className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{displayName(profile)}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Correo</dt>
              <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Rol</dt>
              <dd className="mt-1 text-sm text-gray-900">{roleLabel(profile.rol)}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Estado</dt>
              <dd className="mt-1 text-sm text-gray-900">{profile.activo ? 'Activa' : 'Inactiva'}</dd>
            </div>
          </dl>

          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <Input
              label="Usuario"
              name="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setSaved(false);
              }}
              helperText="Es el nombre que el servicio de autenticación guarda en la cuenta."
            />

            {saveError && (
              <p className="text-sm text-red-600">{saveError}</p>
            )}
            {saved && (
              <p className="text-sm text-emerald-700">Perfil actualizado.</p>
            )}

            <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving}>
              Guardar usuario
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

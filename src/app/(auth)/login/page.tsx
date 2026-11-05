'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from "next/navigation";
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

/**
 * Login Page
 * User authentication page
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!email || !password) {
      setFormError('Por favor, completa todos los campos');
      return;
    }

    try {
      await login({ email, password });
      // Redirect to reservas page on success
      router.push('/reservas');
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : 'Error al iniciar sesión. Por favor, intenta nuevamente.';
      setFormError(message);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
      <section className="relative overflow-hidden bg-[#0e3b2e] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 84px, transparent 84px 168px)',
          }}
        />
        <div className="pointer-events-none absolute inset-5 sm:inset-8 border border-white/20">
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 sm:h-40 sm:w-40" />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50" />
          <div className="absolute inset-y-[18%] left-0 w-[16%] border-y border-r border-white/20" />
          <div className="absolute inset-y-[18%] right-0 w-[16%] border-y border-l border-white/20" />
          <div className="absolute inset-y-[34%] left-0 w-[7%] border-y border-r border-white/15" />
          <div className="absolute inset-y-[34%] right-0 w-[7%] border-y border-l border-white/15" />
        </div>

        <div className="relative flex min-h-[540px] flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 lg:min-h-screen lg:px-14 lg:py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-100/80">
            AgendaGol
          </p>

          <div className="max-w-xl py-8">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              El sábado a las 7 no se improvisa.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-emerald-50/90 sm:text-lg">
              Apartas la cancha con lo que de verdad define el partido: fútbol 5, 7 u 11,
              sintética o césped, y un turno de una o dos horas.
            </p>

            <div className="mt-8 max-w-sm rounded-2xl border border-white/20 bg-[#0a2c22]/80 p-5 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-emerald-100/70">
                <span>Turno apartado</span>
                <span>Ejemplo</span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">Cancha Norte</p>
                  <p className="mt-1 text-sm text-emerald-50/80">Fútbol 7 · sintética</p>
                </div>
                <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                  Confirmada
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/15 pt-4 text-sm">
                <div>
                  <p className="text-emerald-100/60">Día</p>
                  <p className="mt-1 font-medium">Sábado</p>
                </div>
                <div>
                  <p className="text-emerald-100/60">Horario</p>
                  <p className="mt-1 font-medium">19:00 – 21:00</p>
                </div>
                <div>
                  <p className="text-emerald-100/60">Cupo</p>
                  <p className="mt-1 font-medium">14 jugadores</p>
                </div>
                <div>
                  <p className="text-emerald-100/60">Duración</p>
                  <p className="mt-1 font-medium">2 horas</p>
                </div>
              </div>
            </div>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-emerald-100/60">
              Así registra AgendaGol un turno. El valor sale del precio por hora de esa cancha.
            </p>
          </div>

          <ul className="grid gap-3 text-sm text-emerald-50/90 sm:grid-cols-3">
            <li className="rounded-xl border border-white/15 bg-black/10 px-3 py-3">
              <p className="font-semibold text-white">La cancha</p>
              <p className="mt-1 text-emerald-50/75">Fútbol 5, 7 y 11. Sintética o césped natural.</p>
            </li>
            <li className="rounded-xl border border-white/15 bg-black/10 px-3 py-3">
              <p className="font-semibold text-white">El turno</p>
              <p className="mt-1 text-emerald-50/75">Una o dos horas, de 10:00 a 22:00.</p>
            </li>
            <li className="rounded-xl border border-white/15 bg-black/10 px-3 py-3">
              <p className="font-semibold text-white">La fecha</p>
              <p className="mt-1 text-emerald-50/75">Hasta 30 días antes. Si cancelas, el horario queda libre.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="flex items-center justify-center bg-[#f3f6f4] px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Entra al vestuario</h2>
            <p className="mt-2 text-sm text-gray-600">
              Con tu cuenta ves las canchas libres y los turnos de tu equipo.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            {(formError || error) && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{formError || error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                label="Correo Electrónico"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-5 w-5" />}
                required
                disabled={isLoading}
                autoComplete="email"
              />

              <Input
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-5 w-5" />}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading}
              >
                Iniciar Sesión
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

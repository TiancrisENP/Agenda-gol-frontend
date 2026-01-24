'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

/**
 * Protected Route Component
 * Ensures user is authenticated and has required role
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/login',
}) => {
  const router = useRouter();
  const { isAuthenticated, user, loadUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Load user on mount
    loadUser();
    
    // Give it a moment to load
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [loadUser]);

  useEffect(() => {
    // Skip if still checking
    if (isChecking) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    // Check role if specified
    if (allowedRoles && user) {
      const hasRequiredRole = allowedRoles.includes(user.rol);
      
      if (!hasRequiredRole) {
        // Redirect to unauthorized page or dashboard
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isChecking, user, allowedRoles, router, fallbackPath]);

  // Show loading state
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // Check role authorization
  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
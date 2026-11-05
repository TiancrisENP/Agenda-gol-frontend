'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Root Page
 * Redirects to login or dashboard based on auth state
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    
    if (token) {
      // Redirect to dashboard if authenticated
      router.push('/dashboard');
    } else {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0e3b2e]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-200"></div>
        <p className="text-sm text-emerald-50/80">Abriendo la cancha...</p>
      </div>
    </div>
  );
}
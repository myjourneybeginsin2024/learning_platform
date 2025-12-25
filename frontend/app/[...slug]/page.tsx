'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CatchAllRoute() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // For any unmatched route, redirect based on authentication status
    if (isAuthenticated) {
      // Authenticated user goes to dashboard for any invalid route
      router.push('/dashboard');
    } else {
      // Unauthenticated user goes to home for any invalid route
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Redirecting...</h2>
        <p className="text-gray-600">Please wait.</p>
      </div>
    </div>
  );
}
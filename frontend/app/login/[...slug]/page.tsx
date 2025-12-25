'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function LoginCatchAll() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // Authenticated user trying to access any login sub-route should go to dashboard
      router.push('/dashboard');
    } else {
      // Unauthenticated user should go to main login
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Redirecting...</h2>
          <p className="text-gray-600">Please wait.</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
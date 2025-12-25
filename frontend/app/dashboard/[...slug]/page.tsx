'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardCatchAll() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // Authenticated user should go to main dashboard
      router.push('/dashboard');
    } else {
      // Unauthenticated user trying to access dashboard should go to home
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Redirecting...</h2>
          <p className="text-gray-600">Please wait.</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
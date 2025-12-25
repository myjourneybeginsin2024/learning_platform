'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect based on authentication status when hitting a 404
    if (isAuthenticated) {
      // Authenticated user hitting a 404 should go to dashboard
      router.push('/dashboard');
    } else {
      // Unauthenticated user hitting a 404 should go to landing page
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
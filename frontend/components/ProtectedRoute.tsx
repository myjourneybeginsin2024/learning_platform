'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAuth?: boolean; // true for protected routes (dashboard), false for public routes (login, register)
};

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication status and redirect accordingly
    if (requireAuth && !isAuthenticated) {
      // User is not authenticated but trying to access protected route
      router.push('/');
    } else if (!requireAuth && isAuthenticated) {
      // User is authenticated but trying to access public route (like login/register)
      router.push('/dashboard');
    }
    
    // Handle random URLs that don't match expected patterns
    // If user is not authenticated and trying to access any route other than public routes
    if (!isAuthenticated && !['/', '/login', '/register', '/auth/callback', '/favicon.ico'].includes(pathname)) {
      router.push('/');
    }
    
    // If user is authenticated and trying to access public routes
    if (isAuthenticated && ['/', '/login', '/register'].includes(pathname)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, requireAuth, router, pathname]);

  // Check if the current path should be accessible based on auth status
  if (!isAuthenticated) {
    // If not authenticated and trying to access protected routes
    if (requireAuth || !['/', '/login', '/register', '/auth/callback', '/favicon.ico'].includes(pathname)) {
      return null; // Don't render children, redirect will happen in useEffect
    }
  }
  
  if (isAuthenticated) {
    // If authenticated and trying to access public routes
    if (!requireAuth && ['/', '/login', '/register'].includes(pathname)) {
      return null; // Don't render children, redirect will happen in useEffect
    }
  }

  return <>{children}</>;
}
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, requireAuth = true }: { children: React.ReactNode; requireAuth?: boolean }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.push('/login');
    } else if (!requireAuth && isAuthenticated) {
      // Don't redirect if we are already where we want to be
      if (['/login', '/register'].includes(pathname)) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router, pathname]);

  if (isLoading) return null;

  if (requireAuth && !isAuthenticated) return null;
  if (!requireAuth && isAuthenticated && ['/login', '/register'].includes(pathname)) return null;

  return <>{children}</>;
}

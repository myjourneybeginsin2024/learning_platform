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
      router.push('/');
    } else if (!requireAuth && isAuthenticated) {
      // Don't redirect if we are already where we want to be
      if (['/login', '/register'].includes(pathname)) {
        // [MODIFIED] Use Role-Based Redirection instead of hardcoded /dashboard
        // Note: We need 'user' from useAuth which might not be destructured yet
        // Since we can't easily access user here without changing destructuring on line 8,
        // we should assume the Layout or Login page handles the specific redirect.
        // BUT, since this component FORCES redirect, we must update it.
        const target = window.localStorage.getItem('user_role') === 'super admin' ? '/superadmin'
          : window.localStorage.getItem('user_role') === 'admin' ? '/admin'
            : '/user';
        router.push(target);
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router, pathname]);

  if (isLoading) return null;

  if (requireAuth && !isAuthenticated) return null;
  if (!requireAuth && isAuthenticated && ['/login', '/register'].includes(pathname)) return null;

  return <>{children}</>;
}

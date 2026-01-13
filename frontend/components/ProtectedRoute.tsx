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
      const role = window.localStorage.getItem('user_role');
      console.log("ProtectedRoute: Redirecting logged-in user. Role:", role, "Current Path:", pathname);

      const target = (role === 'super_admin' || role === 'super admin') ? '/superadmin'
        : role === 'admin' ? '/admin'
          : '/dashboard';

      // Prevent infinite redirect loops if already on target
      if (pathname === target) return;

      router.push(target);
    }
  }, [isAuthenticated, isLoading, requireAuth, router, pathname]);

  if (isLoading) return null;

  if (requireAuth && !isAuthenticated) return null;
  if (!requireAuth && isAuthenticated && ['/login', '/register'].includes(pathname)) return null;

  return <>{children}</>;
}

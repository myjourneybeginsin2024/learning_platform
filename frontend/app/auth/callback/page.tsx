'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

export default function AuthCallback() {
  const { loginWithToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('access_token');

    async function handleCallback() {
      if (token) {
        try {
          // Use Context to login so state is updated immediately
          const user = await loginWithToken(token);

          // Role-based redirect
          // Role-based redirect
          if (user.role === 'super_admin' || user.role === 'super admin') router.push('/superadmin');
          else if (user.role === 'admin' || user.organizations?.some((org: any) => org.role === 'admin')) router.push('/admin');
          else router.push('/dashboard');
        } catch (e: any) {
          console.error(e);
          router.push(`/login?error=${encodeURIComponent(e.message || 'oauth_callback_error')}`);
        }
      } else {
        router.push('/login?error=oauth_failed');
      }
    }

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Authenticating...</p>
    </div>
  );
}

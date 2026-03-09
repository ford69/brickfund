'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [message, setMessage] = useState('Signing you in...');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const returnUrl = searchParams.get('returnUrl') || searchParams.get('redirect_uri') || '/dashboard';

    if (error) {
      setStatus('error');
      setMessage(error === 'access_denied' ? 'Sign-in was cancelled.' : `Sign-in failed: ${error}`);
      const t = setTimeout(() => {
        window.location.href = `/signin?error=${encodeURIComponent(error)}`;
      }, 2500);
      return () => clearTimeout(t);
    }

    if (!token) {
      setStatus('error');
      setMessage('No token received. Redirecting to sign in...');
      const t = setTimeout(() => {
        window.location.href = '/signin';
      }, 2000);
      return () => clearTimeout(t);
    }

    try {
      apiClient.setToken(token);
      setStatus('done');
      setMessage('Success! Redirecting...');
      window.location.href = returnUrl.startsWith('/') ? returnUrl : `/dashboard?return=${encodeURIComponent(returnUrl)}`;
    } catch {
      setStatus('error');
      setMessage('Could not complete sign-in.');
      setTimeout(() => { window.location.href = '/signin'; }, 2000);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-6">
        {status === 'loading' && (
          <div className="inline-block h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        )}
        <p className="text-muted-foreground">{message}</p>
        {status === 'error' && (
          <p className="mt-2 text-sm text-muted-foreground">You will be redirected shortly.</p>
        )}
      </div>
    </div>
  );
}

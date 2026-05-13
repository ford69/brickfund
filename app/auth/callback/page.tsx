'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';

const AUTH_CALLBACK_USER_KEY = 'auth_callback_user';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [message, setMessage] = useState('Signing you in...');
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');
    const returnUrl = searchParams.get('returnUrl') || searchParams.get('redirect_uri') || '/dashboard';
    const safeReturnUrl = returnUrl.startsWith('/') ? returnUrl : `/${returnUrl.replace(/^\//, '')}`;

    const stripSensitiveQuery = () => {
      try {
        window.history.replaceState({}, document.title, '/auth/callback');
      } catch {
        // ignore
      }
    };

    const redirectToSignIn = (signInError?: string) => {
      stripSensitiveQuery();
      const query = signInError ? `?error=${encodeURIComponent(signInError)}` : '';
      window.location.replace(`/signin${query}`);
    };

    if (error) {
      setStatus('error');
      setMessage(error === 'access_denied' ? 'Sign-in was cancelled.' : `Sign-in failed: ${error}`);
      const t = setTimeout(() => redirectToSignIn(error), 2500);
      return () => clearTimeout(t);
    }

    if (!token) {
      setStatus('error');
      setMessage('No token received. Redirecting to sign in...');
      const t = setTimeout(() => redirectToSignIn('no_token'), 2000);
      return () => clearTimeout(t);
    }

    let cancelled = false;

    const completeSignIn = async () => {
      try {
        setMessage('Saving session...');
        const tokenSaved = apiClient.persistToken(token);
        if (!tokenSaved) {
          throw new Error('token_persist_failed');
        }

        if (refreshToken) {
          apiClient.persistRefreshToken(refreshToken);
        }

        stripSensitiveQuery();

        setMessage('Verifying session...');
        const response = await apiClient.getUserProfile();
        if (cancelled) return;

        if (response.success && response.data) {
          try {
            sessionStorage.setItem(AUTH_CALLBACK_USER_KEY, JSON.stringify(response.data));
          } catch {
            // AuthProvider will fall back to getUserProfile using the persisted token.
          }

          setStatus('done');
          setMessage('Success! Redirecting...');
          window.location.replace(safeReturnUrl);
          return;
        }

        apiClient.clearToken();
        setStatus('error');
        setMessage('Could not load your account. Redirecting to sign in...');
        setTimeout(() => redirectToSignIn('profile_failed'), 2000);
      } catch {
        if (cancelled) return;
        apiClient.clearToken();
        setStatus('error');
        setMessage('Could not complete sign-in. Redirecting...');
        setTimeout(() => redirectToSignIn('callback_failed'), 2000);
      }
    };

    void completeSignIn();
    return () => {
      cancelled = true;
    };
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

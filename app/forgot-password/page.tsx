'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await apiClient.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err: unknown) {
      const status = (err as Error & { status?: number }).status;
      if (status === 503) {
        setError('We could not send the reset email right now. Please try again later.');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/accra-1.jpg')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-brand-blue-950/60" aria-hidden />
      <div className="relative z-10 max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Building2 className="h-9 w-9 sm:h-10 sm:w-10 text-primary" />
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-sm">
              BrickFund
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-sm">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-white/90">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <Card className="border border-border rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Reset password</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {submitted ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
                  If an account exists for that email, we sent a password reset link. Check your inbox
                  and spam folder. The link expires in 1 hour.
                </div>
                <Link
                  href="/signin"
                  className="inline-flex items-center text-sm font-medium text-primary hover:opacity-90"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to sign in
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      Email address
                    </Label>
                    <div className="mt-1.5 relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 rounded-lg border-border h-11"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:opacity-90 text-primary-foreground h-11 rounded-lg font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send reset link'}
                  </Button>
                </form>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  <Link href="/signin" className="font-medium text-primary hover:opacity-90">
                    Back to sign in
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

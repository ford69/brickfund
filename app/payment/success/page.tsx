'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

const PaymentSuccessPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reference = searchParams.get('reference');
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    if (reference && paymentId) {
      verifyPayment(reference, paymentId);
    } else if (reference) {
      verifyPayment(reference, '');
    } else {
      setError('Missing payment reference');
      setLoading(false);
    }
  }, [reference, paymentId]);

  const verifyPayment = async (ref: string, _pId: string) => {
    try {
      const response = await apiClient.verifyPayment(ref);

      if (response.success) {
        setPayment(response.data as Record<string, unknown>);
      } else {
        setError('Payment verification failed');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground text-sm">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-destructive/10">
              <svg
                className="h-8 w-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-foreground">Payment Verification Failed</h2>
            <p className="mt-2 text-muted-foreground text-sm">{error}</p>
            <Button
              onClick={() => router.push('/projects')}
              className="mt-6 bg-primary hover:opacity-90 text-primary-foreground rounded-xl px-6 h-11"
            >
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const paymentData = payment?.payment as { paystackReference?: string; currency?: string; amount?: number; projectId?: string } | undefined;
  const investmentData = payment?.investment as { expectedReturn?: number } | undefined;
  const purchaseData = payment?.purchase as { item?: { name?: string } } | undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="bg-card border border-border rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
            <svg
              className="h-10 w-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-foreground tracking-tight">Payment Successful!</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            {payment?.purchase
              ? 'Your marketplace purchase has been confirmed.'
              : 'Your investment has been confirmed.'}
          </p>

          {payment && (
            <div className="mt-6 text-left bg-muted/50 rounded-xl p-4 border border-border">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-medium text-foreground truncate">
                    {(paymentData?.paystackReference as string) || reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium text-foreground">
                    {paymentData?.currency || 'GHS'}{' '}
                    {paymentData?.amount ? (paymentData.amount / 100).toLocaleString() : '0'}
                  </span>
                </div>
                {payment?.investment && investmentData ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Return:</span>
                    <span className="font-medium text-primary">
                      {paymentData?.currency || 'GHS'}{' '}
                      {investmentData.expectedReturn?.toLocaleString() ?? 'N/A'}
                    </span>
                  </div>
                ) : null}
                {payment?.purchase && purchaseData ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Item:</span>
                    <span className="font-medium text-foreground">
                      {purchaseData.item?.name ?? 'Marketplace Item'}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {payment?.purchase ? (
              <>
                <p className="text-sm text-muted-foreground mb-2">What would you like to do next?</p>
                <Button
                  onClick={() => router.push('/marketplace')}
                  className="w-full bg-primary hover:opacity-90 text-primary-foreground rounded-xl h-11 font-medium"
                >
                  Continue shopping
                </Button>
                <Button
                  onClick={() => router.push('/owner-dashboard')}
                  variant="outline"
                  className="w-full rounded-xl border-border hover:bg-accent h-11"
                >
                  Return to dashboard
                </Button>
                <a
                  href="/marketplace/purchases"
                  className="block text-center text-sm text-primary hover:opacity-90 mt-3 font-medium"
                >
                  View purchase history
                </a>
              </>
            ) : (
              <>
                {paymentData?.projectId && (
                  <Button
                    onClick={() => router.push(`/projects/${paymentData.projectId}`)}
                    className="w-full bg-primary hover:opacity-90 text-primary-foreground rounded-xl h-11 font-medium"
                  >
                    View Project
                  </Button>
                )}
                <Button
                  onClick={() => router.push('/investments')}
                  variant="outline"
                  className="w-full rounded-xl border-border hover:bg-accent h-11"
                >
                  My Investments
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

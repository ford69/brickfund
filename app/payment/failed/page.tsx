'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const PaymentFailedPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference = searchParams.get('reference');
  const status = searchParams.get('status');
  const source = searchParams.get('source'); // 'investment' | 'marketplace'
  const role = searchParams.get('role');

  const getStatusMessage = (status: string | null) => {
    switch (status) {
      case 'failed':
        return 'Your payment was declined. Please try again.';
      case 'abandoned':
        return 'Payment was cancelled. You can try again when ready.';
      default:
        return 'Payment could not be completed. Please try again.';
    }
  };

  const isMarketplace = source === 'marketplace';
  const isInvestment = source === 'investment';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-card border border-border rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10">
            <svg
              className="h-10 w-10 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-foreground">Payment Failed</h2>
          <p className="mt-2 text-muted-foreground text-sm">{getStatusMessage(status)}</p>

          {reference && (
            <div className="mt-4 text-sm text-muted-foreground">
              Reference: {reference}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <Button
              onClick={() => router.back()}
              className="w-full bg-primary hover:opacity-90 text-primary-foreground rounded-xl h-11 font-medium"
            >
              Try again
            </Button>
            {isMarketplace ? (
              <>
                <Button
                  onClick={() => router.push('/marketplace')}
                  variant="outline"
                  className="w-full rounded-xl border-border hover:bg-accent h-11"
                >
                  Continue shopping
                </Button>
                <Button
                  onClick={() => router.push('/marketplace/purchases')}
                  variant="ghost"
                  className="w-full rounded-xl h-11 text-muted-foreground"
                >
                  My orders
                </Button>
              </>
            ) : (
              <Button
                onClick={() => router.push('/projects')}
                variant="outline"
                className="w-full rounded-xl border-border hover:bg-accent h-11"
              >
                Back to projects
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;

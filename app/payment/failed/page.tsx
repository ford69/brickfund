'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const PaymentFailedPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference = searchParams.get('reference');
  const status = searchParams.get('status');

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Failed</h2>
          <p className="mt-2 text-gray-600">{getStatusMessage(status)}</p>

          {reference && (
            <div className="mt-4 text-sm text-gray-500">
              Reference: {reference}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <Button
              onClick={() => router.back()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </Button>
            <Button
              onClick={() => router.push('/projects')}
              variant="outline"
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;

'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const PaymentCancelledPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentId = searchParams.get('paymentId');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
            <svg className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Cancelled</h2>
          <p className="mt-2 text-gray-600">
            You cancelled the payment process. No charges were made.
          </p>

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

export default PaymentCancelledPage;

'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

const PaymentSuccessPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const reference = searchParams.get('reference');
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    if (reference && paymentId) {
      verifyPayment(reference, paymentId);
    } else if (reference) {
      // If only reference is provided, still try to verify
      verifyPayment(reference, '');
    } else {
      setError('Missing payment reference');
      setLoading(false);
    }
  }, [reference, paymentId]);

  const verifyPayment = async (ref: string, pId: string) => {
    try {
      const response = await apiClient.verifyPayment(ref);
      
      if (response.success) {
        setPayment(response.data);
      } else {
        setError('Payment verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-red-900">Payment Verification Failed</h2>
            <p className="mt-2 text-red-700">{error}</p>
            <Button
              onClick={() => router.push('/projects')}
              className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Successful!</h2>
          <p className="mt-2 text-gray-600">Your investment has been confirmed.</p>

          {/* Payment Details */}
          {payment && (
            <div className="mt-6 text-left bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-semibold">{payment.payment?.paystackReference || reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">
                    {payment.payment?.currency || 'GHS'} {(payment.payment?.amount ? payment.payment.amount / 100 : 0).toLocaleString()}
                  </span>
                </div>
                {payment.investment && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Return:</span>
                    <span className="font-semibold text-green-600">
                      {payment.payment?.currency || 'GHS'} {payment.investment.expectedReturn?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 space-y-3">
            {payment?.payment?.projectId && (
              <Button
                onClick={() => {
                  const projectId = typeof payment.payment.projectId === 'string' 
                    ? payment.payment.projectId 
                    : String(payment.payment.projectId);
                  router.push(`/projects/${projectId}`);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Project
              </Button>
            )}
            <Button
              onClick={() => router.push('/investments')}
              variant="outline"
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              My Investments
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

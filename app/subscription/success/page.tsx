'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference = searchParams.get('reference');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Subscription upgrade successful
          </h2>
          <p className="mt-2 text-gray-600">
            Your payment has been confirmed. Your subscription is now active.
          </p>

          {reference && (
            <div className="mt-4 text-sm text-gray-500">Reference: {reference}</div>
          )}

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <Link href="/subscriptions/manage">
              <Button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                View subscription
              </Button>
            </Link>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Go to Dashboard
            </Button>
            <Link
              href="/subscriptions"
              className="block text-center text-sm text-blue-600 hover:underline mt-3 font-medium"
            >
              Change plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

# Paystack Payment Integration Guide - Frontend Updates

## Overview

The Paystack integration uses a **redirect-based flow** (not a popup). Users are redirected to Paystack's checkout page, complete payment there, and are then redirected back to your application.

## Payment Flow

```
1. User clicks "Invest Now" → Frontend calls POST /api/payments/initialize
2. Backend returns authorizationUrl → Frontend redirects user to authorizationUrl
3. User completes payment on Paystack checkout page
4. Paystack redirects to backend callback: /api/payments/callback?reference=xxx
5. Backend verifies payment → Redirects user to frontend success/failure page
```

## Required Frontend Updates

### 1. Update Payment Initialization (Already Correct ✅)

Your current implementation in `ProjectDetailsPage.tsx` is correct:

```typescript
const handleInvest = async () => {
  // ... validation code ...

  try {
    const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        projectId: project._id,
        amount: investmentAmount,
        currency: 'GHS', // or 'NGN', 'USD', etc.
      }),
    });

    const data = await response.json();
    
    if (data.success && data.data.authorizationUrl) {
      // ✅ CORRECT: Redirect to Paystack checkout (not popup)
      window.location.href = data.data.authorizationUrl;
    }
  } catch (err) {
    // Handle error
  }
};
```

**✅ This is already correct!** The redirect approach is the right way.

### 2. Create Payment Success Page

Create a new page component: `PaymentSuccessPage.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const reference = searchParams.get('reference');
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    if (reference && paymentId) {
      verifyPayment(reference, paymentId);
    } else {
      setError('Missing payment reference');
      setLoading(false);
    }
  }, [reference, paymentId]);

  const verifyPayment = async (ref: string, pId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payments/verify/${ref}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPayment(data.data);
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
            <button
              onClick={() => navigate('/projects')}
              className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Projects
            </button>
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
                    {payment.payment?.currency} {payment.payment?.amount?.toLocaleString()}
                  </span>
                </div>
                {payment.investment && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Return:</span>
                    <span className="font-semibold text-green-600">
                      {payment.payment?.currency} {payment.investment.expectedReturn?.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate(`/projects/${payment?.payment?.projectId || ''}`)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Project
            </button>
            <button
              onClick={() => navigate('/investments')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              My Investments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
```

### 3. Create Payment Failed Page

Create: `PaymentFailedPage.tsx`

```typescript
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentFailedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
            <button
              onClick={() => navigate(-1)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
```

### 4. Create Payment Cancelled Page

Create: `PaymentCancelledPage.tsx`

```typescript
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentCancelledPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
            <button
              onClick={() => navigate(-1)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelledPage;
```

### 5. Create Payment Error Page (Optional but Recommended)

Create: `PaymentErrorPage.tsx`

```typescript
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentErrorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const message = searchParams.get('message') || 'An unexpected error occurred';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Error</h2>
          <p className="mt-2 text-gray-600">{message}</p>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate('/projects')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Projects
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentErrorPage;
```

### 6. Update Router Configuration

Add the new routes to your React Router:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProjectDetailsPage from './components/ProjectDetailsPage';
import PaymentSuccessPage from './components/PaymentSuccessPage';
import PaymentFailedPage from './components/PaymentFailedPage';
import PaymentCancelledPage from './components/PaymentCancelledPage';
import PaymentErrorPage from './components/PaymentErrorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... other routes ... */}
        <Route path="/projects/:id" element={<ProjectDetailsPage />} />
        
        {/* Payment callback pages */}
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/failed" element={<PaymentFailedPage />} />
        <Route path="/payment/cancelled" element={<PaymentCancelledPage />} />
        <Route path="/payment/error" element={<PaymentErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Updated API Response Structure

The initialize payment endpoint now returns:

```json
{
  "success": true,
  "message": "Payment initialized successfully. Redirect user to authorizationUrl to complete payment.",
  "data": {
    "paymentId": "...",
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "...",
    "reference": "...",
    "amount": 10000,
    "currency": "GHS",
    "redirectRequired": true  // ← New field indicating redirect is needed
  }
}
```

## Important Notes

1. **Redirect, Not Popup**: Always use `window.location.href` to redirect (not `window.open()`)

2. **Backend Handles Verification**: The backend callback endpoint (`/api/payments/callback`) automatically verifies the payment and redirects users to your frontend pages. You don't need to verify on the frontend, but you can optionally call `/api/payments/verify/:reference` for additional confirmation.

3. **URL Structure**: Make sure your frontend routes match:
   - Success: `/payment/success?reference=xxx&paymentId=xxx`
   - Failed: `/payment/failed?reference=xxx&status=xxx`
   - Cancelled: `/payment/cancelled?paymentId=xxx`
   - Error: `/payment/error?message=xxx`

4. **Environment Variables**: Ensure your backend has the correct `FRONTEND_URL` set:
   ```env
   FRONTEND_URL=http://localhost:3000  # or your production URL
   ```

5. **Loading States**: Show a loading state when redirecting to Paystack:
   ```typescript
   const [processing, setProcessing] = useState(false);
   
   const handleInvest = async () => {
     setProcessing(true);
     // ... initialize payment ...
     // Redirect happens automatically
   };
   ```

## Testing

1. **Test Success Flow**: Complete a payment with test card `4084084084084081`
2. **Test Failure**: Use invalid card or cancel payment
3. **Test Cancellation**: Click cancel on Paystack checkout
4. **Test Error Handling**: Disconnect network or use invalid data

## Summary of Changes Needed

- ✅ Payment initialization (already correct - uses redirect)
- ⚠️ Create `/payment/success` page component
- ⚠️ Create `/payment/failed` page component  
- ⚠️ Create `/payment/cancelled` page component
- ⚠️ Create `/payment/error` page component (optional)
- ⚠️ Add routes to React Router
- ⚠️ Update currency to match your Paystack account (GHS, NGN, etc.)

The main change is creating the callback pages that users will be redirected to after payment completion!

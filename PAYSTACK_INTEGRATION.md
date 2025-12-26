# Paystack Payment Integration

This document outlines the Paystack payment integration for processing investment transactions.

## Frontend Implementation

The frontend has been updated to:
1. Load Paystack inline.js script
2. Initialize payment through backend API
3. Open Paystack payment popup
4. Verify payment after successful transaction
5. Handle payment callbacks and errors

## Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

For production, use:
```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
```

## Backend API Endpoints Required

### 1. Initialize Payment
**POST** `/api/payments/initialize`

Initialize a Paystack payment transaction.

**Request Body:**
```json
{
  "projectId": "project_id",
  "amount": 100000,  // Amount in kobo/pesewas (smallest currency unit)
  "email": "user@example.com",
  "metadata": {
    "projectId": "project_id",
    "projectTitle": "Project Name",
    "userId": "user_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "access_code",
    "reference": "payment_reference"
  }
}
```

**Backend Implementation:**
1. Create a pending investment record in the database
2. Initialize Paystack transaction using Paystack API
3. Store the payment reference linked to the investment
4. Return authorization URL and reference to frontend

**Example Backend Code (Node.js/Express):**
```javascript
const axios = require('axios');

router.post('/payments/initialize', authenticate, async (req, res) => {
  try {
    const { projectId, amount, email, metadata } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!projectId || !amount || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create pending investment
    const investment = await Investment.create({
      userId,
      projectId,
      amount: amount / 100, // Convert from kobo to main currency
      status: 'pending',
      investmentDate: new Date()
    });

    // Initialize Paystack payment
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount,
        reference: `INV-${investment._id}-${Date.now()}`,
        metadata,
        callback_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Store payment reference
    investment.paymentReference = paystackResponse.data.data.reference;
    await investment.save();

    res.json({
      success: true,
      data: {
        authorization_url: paystackResponse.data.data.authorization_url,
        access_code: paystackResponse.data.data.access_code,
        reference: paystackResponse.data.data.reference
      }
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize payment'
    });
  }
});
```

### 2. Verify Payment
**GET** `/api/payments/verify/:reference`

Verify a Paystack payment transaction.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "success",
    "investment": {
      "_id": "investment_id",
      "status": "confirmed",
      ...
    },
    "transaction": {
      "reference": "payment_reference",
      "amount": 100000,
      "status": "success",
      ...
    }
  }
}
```

**Backend Implementation:**
1. Verify payment with Paystack API using reference
2. If payment is successful:
   - Update investment status to 'confirmed' or 'active'
   - Update project raised amount
   - Create transaction record
   - Send confirmation notification
3. Return verification result

**Example Backend Code:**
```javascript
router.get('/payments/verify/:reference', authenticate, async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const transaction = paystackResponse.data.data;

    if (transaction.status !== 'success') {
      return res.json({
        success: false,
        data: {
          status: transaction.status,
          message: 'Payment not successful'
        }
      });
    }

    // Find investment by reference
    const investment = await Investment.findOne({ paymentReference: reference });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Update investment if not already confirmed
    if (investment.status === 'pending') {
      investment.status = 'confirmed';
      investment.paymentDate = new Date(transaction.paid_at);
      await investment.save();

      // Update project raised amount
      await Project.findByIdAndUpdate(investment.projectId, {
        $inc: { raisedAmount: investment.amount },
        $inc: { investorCount: 1 }
      });

      // Create transaction record
      await Transaction.create({
        userId: investment.userId,
        projectId: investment.projectId,
        type: 'investment',
        amount: investment.amount,
        status: 'completed',
        reference: reference,
        date: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        status: 'success',
        investment,
        transaction
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
  }
});
```

## Paystack Webhook (Recommended)

For more reliable payment verification, implement a webhook endpoint:

**POST** `/api/payments/webhook`

Paystack will send webhook events to this endpoint. Handle the `charge.success` event to automatically verify payments.

**Example:**
```javascript
router.post('/payments/webhook', async (req, res) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash === req.headers['x-paystack-signature']) {
    const event = req.body;

    if (event.event === 'charge.success') {
      const { reference, amount, customer } = event.data;

      // Update investment status
      const investment = await Investment.findOne({ paymentReference: reference });
      if (investment && investment.status === 'pending') {
        investment.status = 'confirmed';
        investment.paymentDate = new Date();
        await investment.save();

        // Update project
        await Project.findByIdAndUpdate(investment.projectId, {
          $inc: { raisedAmount: investment.amount, investorCount: 1 }
        });
      }
    }
  }

  res.sendStatus(200);
});
```

## Backend Environment Variables

Add to your backend `.env` file:

```env
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
FRONTEND_URL=http://localhost:3000
```

For production:
```env
PAYSTACK_SECRET_KEY=sk_live_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
FRONTEND_URL=https://yourdomain.com
```

## Payment Flow

1. User clicks "Invest Now"
2. Frontend calls `/api/payments/initialize` with investment details
3. Backend creates pending investment and initializes Paystack transaction
4. Frontend receives authorization URL and reference
5. Paystack popup opens for payment
6. User completes payment
7. Paystack callback triggers verification
8. Frontend calls `/api/payments/verify/:reference`
9. Backend verifies with Paystack and updates investment status
10. User is redirected to dashboard

## Error Handling

The frontend handles:
- Payment initialization failures
- Payment cancellation
- Payment verification failures
- Network errors

All errors are displayed via toast notifications.

## Testing

Use Paystack test keys for development:
- Test Public Key: `pk_test_...`
- Test Secret Key: `sk_test_...`

Test card numbers:
- Success: `4084084084084081`
- Decline: `5060666666666666666`
- Insufficient funds: `5060666666666666667`

## Security Notes

1. Never expose secret keys in frontend code
2. Always verify webhook signatures
3. Validate payment amounts on backend
4. Use HTTPS in production
5. Implement rate limiting on payment endpoints
6. Log all payment transactions for audit

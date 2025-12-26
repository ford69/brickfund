# Backend Requirements for Subscription & Monetization Model

This document outlines all backend requirements needed to implement the BrickFund subscription and monetization system.

## 1. Database Models

### 1.1 Subscription Model (`src/models/Subscription.ts`)

```typescript
interface Subscription {
  _id: ObjectId;
  userId: ObjectId; // Reference to User
  tier: 'starter' | 'pro' | 'growth' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentReference?: string; // Paystack reference for subscription payment
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Required Fields:**
- `userId`: Required, references User model
- `tier`: Required, enum
- `status`: Required, enum
- `startDate`: Required, Date
- `endDate`: Required, Date
- `autoRenew`: Required, boolean, default: true

**Indexes:**
- `userId` (for quick lookups)
- `status` + `endDate` (for expiration checks)
- `tier` (for analytics)

### 1.2 Subscription Add-On Model (`src/models/SubscriptionAddOn.ts`)

```typescript
interface SubscriptionAddOn {
  _id: ObjectId;
  userId: ObjectId;
  projectId?: ObjectId; // Optional, for project-specific add-ons
  addOnType: 'featured_boost' | 'marketing_push' | 'branding_customization';
  status: 'active' | 'expired';
  startDate: Date;
  endDate?: Date; // Required for time-based add-ons (featured_boost)
  paymentReference?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Required Fields:**
- `userId`: Required
- `addOnType`: Required, enum
- `status`: Required, enum
- `startDate`: Required, Date

**Indexes:**
- `userId`
- `projectId` (for project-specific add-ons)
- `status` + `endDate` (for expiration checks)

### 1.3 Update User Model

Add subscription-related fields:
```typescript
interface User {
  // ... existing fields
  subscriptionId?: ObjectId; // Reference to active subscription
  subscriptionTier?: 'starter' | 'pro' | 'growth' | 'enterprise';
}
```

## 2. API Endpoints

### 2.1 Subscription Plans Endpoints

#### GET `/api/subscriptions/plans`
**Description:** Get all available subscription plans

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tier": "starter",
      "name": "Starter",
      "price": 0,
      "duration": 21,
      "durationLabel": "21 days",
      "maxProjects": 1,
      "features": ["..."],
      "costRank": "Free Trial"
    },
    // ... other plans
  ]
}
```

#### GET `/api/subscriptions/current`
**Description:** Get current user's subscription

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "tier": "pro",
    "status": "active",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-04-01T00:00:00Z",
    "autoRenew": true,
    "paymentReference": "..."
  }
}
```

#### POST `/api/subscriptions`
**Description:** Create a new subscription (start trial or purchase)

**Authentication:** Required

**Request Body:**
```json
{
  "tier": "starter" | "pro" | "growth" | "enterprise"
}
```

**Response (Free Trial):**
```json
{
  "success": true,
  "data": {
    "subscription": { /* subscription object */ }
  }
}
```

**Response (Paid Plan):**
```json
{
  "success": true,
  "data": {
    "subscription": { /* subscription object */ },
    "paymentUrl": "https://checkout.paystack.com/..."
  }
}
```

#### PATCH `/api/subscriptions/:subscriptionId`
**Description:** Update subscription (auto-renew, tier upgrade)

**Authentication:** Required

**Request Body:**
```json
{
  "autoRenew": true,
  "tier": "growth" // Optional, for upgrades
}
```

#### POST `/api/subscriptions/:subscriptionId/cancel`
**Description:** Cancel subscription (sets status to 'cancelled', keeps active until endDate)

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": { /* updated subscription */ }
}
```

### 2.2 Add-Ons Endpoints

#### GET `/api/subscriptions/add-ons`
**Description:** Get all available add-ons

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "type": "featured_boost",
      "name": "Featured Boost",
      "price": 25,
      "duration": 7,
      "description": "..."
    },
    // ... other add-ons
  ]
}
```

#### POST `/api/subscriptions/add-ons/purchase`
**Description:** Purchase an add-on

**Authentication:** Required

**Request Body:**
```json
{
  "addOnType": "featured_boost",
  "projectId": "..." // Optional, for project-specific add-ons
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "addOn": { /* add-on object */ },
    "paymentUrl": "https://checkout.paystack.com/..." // If payment required
  }
}
```

#### GET `/api/subscriptions/add-ons/current`
**Description:** Get user's active add-ons

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    { /* add-on objects */ }
  ]
}
```

#### GET `/api/subscriptions/check-feature/:feature`
**Description:** Check if user has access to a specific feature

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "allowed": true,
    "reason": "User has active Pro subscription"
  }
}
```

## 3. Business Logic & Services

### 3.1 Subscription Service (`src/services/subscriptionService.ts`)

**Functions Needed:**

1. **`createSubscription(userId, tier)`**
   - Create subscription record
   - For free tier: Set status to 'trial', calculate endDate (21 days)
   - For paid tiers: Initialize payment, return payment URL
   - Update user's subscriptionId and subscriptionTier

2. **`getUserSubscription(userId)`**
   - Get active subscription for user
   - Check if expired and update status if needed

3. **`updateSubscription(subscriptionId, updates)`**
   - Update subscription fields (autoRenew, tier)
   - Handle tier upgrades (prorate if needed)

4. **`cancelSubscription(subscriptionId)`**
   - Set status to 'cancelled'
   - Keep active until endDate
   - Disable autoRenew

5. **`checkSubscriptionExpiration()`**
   - Cron job to check and expire subscriptions
   - Update status from 'active' to 'expired'
   - Notify users before expiration (7 days, 3 days, 1 day)

6. **`canCreateProject(userId, currentProjectCount)`**
   - Check subscription limits
   - Return boolean and reason if denied

7. **`getFeatureLimits(subscription)`**
   - Return feature access based on tier
   - Used for feature gating

### 3.2 Add-On Service (`src/services/addOnService.ts`)

**Functions Needed:**

1. **`purchaseAddOn(userId, addOnType, projectId?)`**
   - Create add-on record
   - Initialize payment if required
   - Set expiration dates for time-based add-ons

2. **`getUserAddOns(userId)`**
   - Get all active add-ons for user

3. **`checkAddOnExpiration()`**
   - Cron job to expire add-ons
   - Update status from 'active' to 'expired'

4. **`isProjectFeatured(projectId)`**
   - Check if project has active featured boost

### 3.3 Payment Integration

**Paystack Integration for Subscriptions:**

1. **Subscription Payment Flow:**
   - Create subscription record with status 'pending'
   - Initialize Paystack payment
   - Store payment reference
   - On callback: Update subscription status to 'active', set dates

2. **Add-On Payment Flow:**
   - Similar to subscription payment
   - Activate add-on on successful payment

3. **Recurring Payments (Future):**
   - Set up Paystack subscription plans
   - Handle webhook callbacks for renewals

## 4. Middleware & Feature Gating

### 4.1 Subscription Middleware (`src/middleware/subscriptionMiddleware.ts`)

**Functions:**

1. **`requireSubscription(tier?)`**
   - Check if user has active subscription
   - Optionally check minimum tier
   - Return 403 if not subscribed

2. **`checkProjectLimit()`**
   - Check if user can create more projects
   - Used in project creation endpoint

3. **`checkFeatureAccess(feature)`**
   - Check if user has access to specific feature
   - Return 403 with upgrade message if denied

### 4.2 Update Project Creation Endpoint

**Modify:** `POST /api/projects`

**Add:**
- Check subscription status
- Check project limit
- Return appropriate error if limit reached

**Example:**
```typescript
// In project controller
const subscription = await subscriptionService.getUserSubscription(userId);
const projectCount = await Project.countDocuments({ developer: userId });

if (!canCreateProject(subscription, projectCount)) {
  return res.status(403).json({
    success: false,
    message: 'Project limit reached. Please upgrade your subscription.',
    upgradeUrl: '/subscriptions'
  });
}
```

## 5. Investment Fee Calculation

### 5.1 Update Investment/Payment Endpoints

**Modify:** `POST /api/payments/initialize`

**Add Fee Calculation:**
```typescript
const investmentFeePercentage = 2.5; // Configurable, 2-3%
const investmentFee = Math.round(amount * (investmentFeePercentage / 100));
const netAmount = amount - investmentFee;

// Store fee in payment record
payment.fee = investmentFee;
payment.feePercentage = investmentFeePercentage;
payment.netAmount = netAmount;
```

**Update Payment Model:**
```typescript
interface Payment {
  // ... existing fields
  fee?: number;
  feePercentage?: number;
  netAmount?: number; // Amount after fee deduction
}
```

### 5.2 Fee Distribution

**Track Platform Revenue:**
- Create revenue tracking model/collection
- Record all fees collected
- Generate revenue reports

## 6. Cron Jobs & Scheduled Tasks

### 6.1 Subscription Expiration Check

**Schedule:** Daily at midnight

**Tasks:**
- Find subscriptions expiring in 7 days, 3 days, 1 day
- Send email notifications
- Expire subscriptions past endDate
- Update user subscription status

### 6.2 Add-On Expiration Check

**Schedule:** Daily at midnight

**Tasks:**
- Expire time-based add-ons (featured_boost)
- Update project featured status
- Notify users before expiration

### 6.3 Subscription Renewal (Future)

**Schedule:** Daily

**Tasks:**
- Check subscriptions with autoRenew = true
- Process renewals for active subscriptions
- Handle payment failures

## 7. Email Notifications

### 7.1 Subscription Emails

**Templates Needed:**
1. **Trial Started:** Welcome email for free trial
2. **Subscription Activated:** Confirmation for paid subscription
3. **Expiring Soon (7 days):** Reminder to renew
4. **Expiring Soon (3 days):** Urgent reminder
5. **Expiring Soon (1 day):** Final reminder
6. **Subscription Expired:** Notification of expiration
7. **Subscription Cancelled:** Confirmation of cancellation
8. **Subscription Renewed:** Confirmation of renewal

### 7.2 Add-On Emails

**Templates Needed:**
1. **Add-On Purchased:** Confirmation
2. **Add-On Expiring:** Reminder (for time-based)
3. **Add-On Expired:** Notification

## 8. Analytics & Reporting

### 8.1 Subscription Analytics

**Endpoints:**
- `GET /api/admin/subscriptions/stats` - Subscription statistics
- `GET /api/admin/subscriptions/revenue` - Revenue reports
- `GET /api/admin/subscriptions/churn` - Churn analysis

**Metrics to Track:**
- Active subscriptions by tier
- Monthly recurring revenue (MRR)
- Churn rate
- Conversion rate (trial to paid)
- Average revenue per user (ARPU)

### 8.2 Investment Fee Analytics

**Track:**
- Total fees collected
- Fees by time period
- Average fee per transaction
- Fee trends

## 9. Configuration

### 9.1 Environment Variables

```env
# Subscription Pricing
SUBSCRIPTION_STARTER_PRICE=0
SUBSCRIPTION_STARTER_DURATION=21
SUBSCRIPTION_PRO_PRICE=199
SUBSCRIPTION_PRO_DURATION=90
SUBSCRIPTION_GROWTH_PRICE=299
SUBSCRIPTION_GROWTH_DURATION=180
SUBSCRIPTION_ENTERPRISE_PRICE=499
SUBSCRIPTION_ENTERPRISE_DURATION=365

# Investment Fee
INVESTMENT_FEE_PERCENTAGE=2.5
INVESTMENT_FEE_MIN=2
INVESTMENT_FEE_MAX=3

# Add-Ons Pricing
ADDON_FEATURED_BOOST_PRICE=25
ADDON_FEATURED_BOOST_DURATION=7
ADDON_MARKETING_PUSH_PRICE=49
ADDON_BRANDING_CUSTOMIZATION_PRICE=99
```

## 10. Testing Requirements

### 10.1 Unit Tests

- Subscription creation (all tiers)
- Subscription expiration logic
- Feature limit calculations
- Project limit checks
- Fee calculations

### 10.2 Integration Tests

- Subscription purchase flow
- Add-on purchase flow
- Project creation with limits
- Payment callbacks
- Expiration cron jobs

### 10.3 E2E Tests

- Complete subscription signup flow
- Project creation with subscription limits
- Add-on purchase and activation
- Subscription renewal

## 11. Security Considerations

1. **Payment Security:**
   - Verify Paystack webhooks
   - Validate payment references
   - Never trust client-side payment data

2. **Subscription Access:**
   - Always verify subscription on server
   - Don't rely on client-side checks
   - Rate limit subscription endpoints

3. **Feature Gating:**
   - Enforce limits server-side
   - Validate tier access for premium features

## 12. Migration Scripts

### 12.1 Existing Users Migration

**Script:** `src/scripts/migrateExistingUsers.ts`

**Tasks:**
- Assign default 'starter' trial to existing developers
- Set trial expiration (21 days from migration date)
- Update user subscription references

## 13. API Documentation Updates

Update API documentation to include:
- All subscription endpoints
- Add-on endpoints
- Feature access requirements
- Investment fee structure

## Summary Checklist

- [ ] Create Subscription model
- [ ] Create SubscriptionAddOn model
- [ ] Update User model with subscription fields
- [ ] Implement subscription service
- [ ] Implement add-on service
- [ ] Create all subscription endpoints
- [ ] Create all add-on endpoints
- [ ] Add subscription middleware
- [ ] Update project creation with limits
- [ ] Implement fee calculation in payments
- [ ] Set up cron jobs for expiration
- [ ] Create email templates
- [ ] Add analytics endpoints
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Create migration scripts
- [ ] Update API documentation

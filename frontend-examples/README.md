# Frontend Examples for BrickFund API

This directory contains example React components for integrating with the BrickFund backend API.

## Components

### 1. ProjectsListingPage.tsx
A complete projects listing page component that:
- Fetches and displays all active projects
- Supports filtering by category, ROI range, and search
- Includes pagination
- Shows project cards with images, funding progress, ROI, and key details
- Navigates to project details page on click

### 2. ProjectDetailsPage.tsx
A detailed project view component that:
- Displays full project information
- Shows image gallery
- Displays financial details, timeline, and risk assessment
- Includes investment form with Paystack integration
- Shows funding progress and investor count

## Setup Instructions

### 1. Install Dependencies
```bash
npm install react react-dom react-router-dom
# or
yarn add react react-dom react-router-dom
```

### 2. Environment Variables
Create a `.env` file in your frontend project:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. API Endpoints Used

#### Get All Projects
```
GET /api/projects?page=1&limit=12&status=active&category=residential&minROI=5&maxROI=20&search=keyword
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Family Mall",
      "shortDescription": "...",
      "category": "commercial",
      "location": {
        "city": "Lagos",
        "state": "Lagos",
        "address": "..."
      },
      "images": ["url1", "url2"],
      "primaryImage": "url1",
      "targetAmount": 3000000,
      "raisedAmount": 500000,
      "fundingProgress": 16.67,
      "remainingAmount": 2500000,
      "roi": 12,
      "investmentTerm": 24,
      "status": "active",
      "investorCount": 5,
      "daysRemaining": 180,
      "developer": {
        "firstName": "John",
        "lastName": "Doe",
        "companyName": "ABC Developers"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "pages": 5
  }
}
```

#### Get Single Project
```
GET /api/projects/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Family Mall",
    "description": "Full description...",
    "shortDescription": "Short description...",
    "category": "commercial",
    "location": {
      "address": "123 Main St",
      "city": "Lagos",
      "state": "Lagos",
      "zipCode": "100001",
      "country": "Nigeria"
    },
    "images": ["url1", "url2", "url3"],
    "primaryImage": "url1",
    "targetAmount": 3000000,
    "raisedAmount": 500000,
    "remainingAmount": 2500000,
    "fundingProgress": 16.67,
    "minimumInvestment": 10000,
    "maximumInvestment": 500000,
    "roi": 12,
    "investmentTerm": 24,
    "distributionSchedule": "quarterly",
    "status": "active",
    "investorCount": 5,
    "totalInvested": 500000,
    "daysRemaining": 180,
    "canInvest": true,
    "developer": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "companyName": "ABC Developers",
      "averageRating": 4.5,
      "totalProjects": 10
    },
    "highlights": ["Highlight 1", "Highlight 2"],
    "financials": {
      "totalProjectCost": 3000000,
      "projectedReturn": 360000,
      "expectedCompletion": "2025-12-31T00:00:00.000Z"
    },
    "timeline": [
      {
        "phase": "Planning",
        "status": "completed",
        "startDate": "2024-01-01",
        "endDate": "2024-03-31",
        "description": "Planning phase completed"
      }
    ],
    "riskAssessment": {
      "level": "medium",
      "factors": ["Market risk", "Construction delays"],
      "mitigation": ["Insurance coverage", "Experienced team"]
    },
    "tags": ["commercial", "retail"],
    "investors": [
      {
        "userId": {
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "amount": 100000,
        "investedAt": "2024-01-15T00:00:00.000Z",
        "status": "active"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

#### Initialize Payment (for investment)
```
POST /api/payments/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "project_id",
  "amount": 10000,
  "currency": "NGN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "paymentId": "...",
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "...",
    "reference": "...",
    "amount": 10000,
    "currency": "NGN"
  }
}
```

## Authentication

The components check for an authentication token in `localStorage.getItem('token')`. If a token exists, it's included in the `Authorization` header:

```typescript
const token = localStorage.getItem('token');
const headers: HeadersInit = {
  'Content-Type': 'application/json',
};
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

## Routing Setup

Add these routes to your React Router configuration:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProjectsListingPage from './components/ProjectsListingPage';
import ProjectDetailsPage from './components/ProjectDetailsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/projects" element={<ProjectsListingPage />} />
        <Route path="/projects/:id" element={<ProjectDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Styling

The components use Tailwind CSS classes. Make sure Tailwind CSS is installed and configured in your project:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Customization

### API Base URL
Update the `API_BASE_URL` constant in each component or use environment variables:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### Currency Formatting
The components use USD formatting. To change the currency, modify the `formatCurrency` function:

```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
```

## Error Handling

Both components include error handling:
- Loading states with spinners
- Error messages with retry buttons
- 404 handling for project details
- Validation for investment amounts

## Notes

- The components are example implementations and may need adjustments based on your specific frontend framework and design system
- Make sure CORS is properly configured on the backend to allow requests from your frontend domain
- The payment flow redirects to Paystack's checkout page. After payment, users should be redirected back to your app
- Consider adding loading skeletons instead of spinners for better UX
- Add error boundaries for better error handling
- Consider implementing optimistic updates for better perceived performance




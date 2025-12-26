# Admin Dashboard Backend API Endpoints

This document outlines all the backend API endpoints that need to be implemented to support the admin dashboard functionality.

## Base URL
All endpoints are prefixed with `/api/admin`

## Authentication
All endpoints require admin authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Get Admin Dashboard Statistics
**GET** `/admin/dashboard/stats`

Returns comprehensive statistics for the admin dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalInvestors": 120,
    "totalDevelopers": 30,
    "totalProjects": 45,
    "pendingProjects": 5,
    "pendingAccountApprovals": 3,
    "activeProjects": 35,
    "totalFundsRaised": 2500000,
    "totalInvestments": 180,
    "recentActivity": [
      {
        "title": "New project submitted",
        "description": "Project 'Luxury Apartments' submitted by John Doe",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 2. Get All Users
**GET** `/admin/users`

Get all users with optional filtering and pagination.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `role` (string, optional): Filter by role ('user', 'developer', 'admin')
- `kycStatus` (string, optional): Filter by KYC status ('pending', 'verified', 'rejected')
- `search` (string, optional): Search by name or email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "kycStatus": "verified",
      "isActive": true,
      "isEmailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### 3. Update User Status
**PATCH** `/admin/users/:userId/status`

Activate or deactivate a user account.

**Request Body:**
```json
{
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "isActive": true,
    ...
  }
}
```

### 4. Update User (Admin)
**PUT** `/admin/users/:userId`

Update user information (admin only).

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "user",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "firstName": "John",
    ...
  }
}
```

### 5. Delete User
**DELETE** `/admin/users/:userId`

Delete a user account permanently.

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 6. Get All Projects (Admin)
**GET** `/admin/projects`

Get all projects with optional filtering.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `status` (string, optional): Filter by status ('draft', 'pending', 'active', 'funded', 'completed', 'cancelled')
- `category` (string, optional): Filter by category
- `search` (string, optional): Search by title or description

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "project_id",
      "title": "Luxury Apartments",
      "description": "...",
      "status": "pending",
      "developer": {
        "_id": "dev_id",
        "firstName": "Jane",
        "lastName": "Smith",
        "companyName": "ABC Developers"
      },
      "targetAmount": 500000,
      "createdAt": "2024-01-10T00:00:00Z",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### 7. Approve Project
**POST** `/admin/projects/:projectId/approve`

Approve a pending project and make it active.

**Request Body:**
```json
{
  "reason": "Project meets all requirements" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "project_id",
    "status": "active",
    ...
  }
}
```

### 8. Reject Project
**POST** `/admin/projects/:projectId/reject`

Reject a pending project.

**Request Body:**
```json
{
  "reason": "Incomplete documentation" // required
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "project_id",
    "status": "rejected",
    ...
  }
}
```

### 9. Update Project Status
**PATCH** `/admin/projects/:projectId/status`

Update project status (alternative to approve/reject).

**Request Body:**
```json
{
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "project_id",
    "status": "active",
    ...
  }
}
```

### 10. Get Pending Account Approvals
**GET** `/admin/accounts/pending`

Get all accounts pending approval.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "developer",
      "status": "pending",
      "companyName": "ABC Developers",
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "pages": 1
  }
}
```

### 11. Approve Account
**POST** `/admin/accounts/:accountId/approve`

Approve a pending account registration.

**Request Body:**
```json
{
  "reason": "Account verified" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "status": "approved",
    "isActive": true,
    ...
  }
}
```

### 12. Reject Account
**POST** `/admin/accounts/:accountId/reject`

Reject a pending account registration.

**Request Body:**
```json
{
  "reason": "Invalid information provided" // required
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "status": "rejected",
    "isActive": false,
    ...
  }
}
```

## Database Models Required

### User Model
Should include:
- `status` field: 'pending' | 'approved' | 'rejected' (for account approval workflow)
- `isActive` field: boolean (for account activation/deactivation)
- `role` field: 'user' | 'developer' | 'admin'
- `kycStatus` field: 'pending' | 'verified' | 'rejected'

### Project Model
Should include:
- `status` field: 'draft' | 'pending' | 'active' | 'funded' | 'completed' | 'cancelled' | 'rejected'
- `developer` field: Reference to User model
- `reviewHistory` field (optional): Array of review actions with timestamps and admin notes

## Middleware Requirements

1. **Admin Authentication Middleware**: Verify that the requesting user has admin role
2. **Rate Limiting**: Apply rate limiting to prevent abuse
3. **Input Validation**: Validate all request bodies and query parameters
4. **Error Handling**: Return consistent error responses

## Error Responses

All endpoints should return errors in this format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (user is not admin)
- `404`: Not Found
- `500`: Internal Server Error

## Notes

1. All timestamps should be in ISO 8601 format
2. Pagination should be implemented for list endpoints
3. Search functionality should support partial matches
4. Consider implementing audit logs for admin actions
5. Account approval workflow: New registrations should default to `status: 'pending'` and require admin approval before activation
6. Project approval workflow: Projects submitted by developers should default to `status: 'pending'` and require admin approval before going live

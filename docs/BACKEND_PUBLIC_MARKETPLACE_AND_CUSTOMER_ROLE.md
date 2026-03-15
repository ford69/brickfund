# Backend: Public Marketplace + Customer Role

This document lists backend changes required to support:

1. **Public marketplace** – guests can browse without logging in.
2. **Guest → signup → purchase** – guests prompted to create an account when they try to buy; after signup they are sent back to checkout or product page.
3. **Customer role** – new role for marketplace-only users (no projects, no investments).

---

## 1. Public marketplace (no auth required)

These endpoints **must not require authentication**. Allow unauthenticated GET requests.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/marketplace/items/active` | GET | List active marketplace items (with optional query: `page`, `limit`, `category`). |
| `/api/marketplace/items/:id` | GET | Get a single marketplace item by ID (for product detail page). |

- Do **not** require `Authorization` for these two.
- Return only active, public-safe fields (e.g. name, description, price, currency, category, image(s), `isActive`).
- If you currently only have `/admin/marketplace/items` and `/admin/marketplace/items/:id`, add the public routes above (or open the same data via a public path and keep admin paths for create/update/delete).

---

## 2. Purchase restriction for guests

- **POST /api/marketplace/purchase/initialize** (or your checkout/init endpoint) **must require authentication**.
- If the request has no valid token (or no token), return **401** with a clear message, e.g. `{ "success": false, "message": "Sign in or create an account to continue your purchase" }`.
- The frontend already sends guests to signup when they click “Buy Now” or “Checkout”; the backend must reject unauthenticated purchase/checkout calls.

---

## 3. User role: CUSTOMER

### Database

- **Users table** (or equivalent): support the new role.
  - **role** enum: e.g. `('admin','investor','project_owner','customer')` or `('admin','investor','owner','customer')` depending on your naming.
  - **Default role for new signups:** if the client does not send a role, default to **customer** (so marketplace-only signups are the default).
  - Frontend sends `role` as one of: `customer` | `investor` | `owner` (lowercase). Map to your DB enum (e.g. `CUSTOMER`, `PROJECT_OWNER`) as needed.

### Registration

- **POST /api/auth/register** (or your signup endpoint):
  - Accept **role** in the body: `customer` | `investor` | `owner`.
  - Validate and persist it; if invalid, either reject or default to `customer`.
  - Do **not** allow registering as `admin` via this endpoint.

### Permissions

- **Customers** may:
  - Browse marketplace (public endpoints above).
  - Add to cart / checkout / purchase (authenticated marketplace purchase endpoints).
  - View their own order/purchase history.
  - Manage their own profile (GET/PUT own profile).
- **Customers** must **not**:
  - Create or edit marketplace listings (admin/owner only).
  - Create or manage projects (owner only).
  - Invest in projects (investor only).
  - Access admin dashboards or manage other users (admin only).

Enforce these in your role middleware (e.g. reject `customer` on project-creation, investment, and admin routes).

---

## 4. Redirect after login/signup

- The frontend uses a **redirect** query param (e.g. `/signup?redirect=/checkout` or `?redirect=/marketplace/xyz`).
- Backend does **not** need to handle redirects; the frontend does that after successful login/register.
- Ensure **GET /api/users/profile** (or whatever returns the current user after login) includes **role** so the frontend can send customers to `/marketplace`, investors to `/dashboard`, owners to `/owner-dashboard`, etc.

---

## 5. Summary checklist

| Item | Action |
|------|--------|
| GET /marketplace/items/active | Public (no auth). Optional: category, page, limit. |
| GET /marketplace/items/:id | Public (no auth). Single item for product detail. |
| POST /marketplace/purchase/initialize | Require auth. Return 401 for guests. |
| User.role | Add `customer` to enum; default new users to `customer` if desired. |
| POST /auth/register | Accept `role`: `customer` \| `investor` \| `owner`. Persist and enforce. |
| Role-based access | Block `customer` from: project create, investments, admin, marketplace listing create. |
| Profile / login response | Include `role` so frontend can redirect by role. |

After these backend updates, the flows below will work end-to-end:

- **Guest** → browses `/marketplace` and `/marketplace/:id` → clicks “Buy Now” or “Checkout” → redirected to signup with “Create an account to continue your purchase” → after signup (as **Customer**) → redirected back to product page or `/checkout`.
- **Customer** → can shop, view orders, edit profile; cannot create listings, projects, or invest.

---

## 6. Cart-based checkout (Paystack)

The frontend uses a **cart**: users add items (with quantity), then go to **Checkout** and pay once via Paystack for the full cart total.

### Endpoint

| Endpoint | Method | Purpose |
|----------|--------|---------|
| **POST /marketplace/purchase/initialize-cart** | POST | Initialize Paystack payment for the **entire cart**. Requires auth (401 for guests). |

**Request body (JSON):**

```json
{
  "items": [
    { "itemId": "<marketplace item _id>", "quantity": 2 },
    { "itemId": "<another item _id>", "quantity": 1 }
  ],
  "successUrl": "https://yoursite.com/checkout/success",
  "cancelUrl": "https://yoursite.com/checkout"
}
```

**Backend should:**

1. Validate that the user is authenticated.
2. Resolve each `itemId` to a marketplace item; validate availability (e.g. `isActive`, optional stock).
3. Compute total amount (sum of `item.price * quantity` per line, in a single currency if you enforce one).
4. Create a single Paystack payment (or order) for that total; include `successUrl` and `cancelUrl` in the Paystack request if your provider supports it.
5. Return the same shape as single-item initialize, e.g.:

```json
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "reference": "unique_ref_xxx"
  }
}
```

After the user pays, Paystack will redirect to `successUrl` (with reference in query if applicable). The frontend will clear the cart and show a success message. Backend should verify the payment via your existing Paystack webhook or verify endpoint and record the order (e.g. one order with multiple line items).

---

## 7. Fulfillment settings (admin)

The frontend currently stores **delivery zones** (with **rates per vehicle**) and **pickup** in localStorage. For production, the backend should persist these.

- **Order size → vehicle:** Delivery is based on **item size/capacity**. Each marketplace item has an optional **fulfillmentTier**: `small` | `medium` | `large`. At checkout, the cart is classified: if any item is large → **Truck**; else any medium → **Mini truck**; else **Motor bike**. So large orders (e.g. iron rods) use a truck, medium a mini truck, small (e.g. nails) a motor bike.
- **GET /admin/fulfillment** (auth: admin) — Return `{ deliveryZones: [...], pickup: { ... } }`. Each delivery zone: `{ id, name, description?, rates: { motorcycle, mini_truck, truck }, currency, estimatedDaysMin?, estimatedDaysMax? }`.
- **PUT /admin/fulfillment** (auth: admin) — Accept same JSON and save.
- **Marketplace item** — Support optional **fulfillmentTier** (`small` | `medium` | `l
arge`) so admin can tag items (e.g. nails = small, lumber = large). Used only for delivery vehicle selection.
- **Initialize-cart payload** — Frontend may send `fulfillmentMethod`, `deliveryZoneId`, `deliveryAddress`, and derived **deliveryVehicle** (`motorcycle` | `mini_truck` | `truck`) so the order record can store how it will be fulfilled.

---

## 8. Order tracking

Users see **My Orders** and **Track order** with status, estimated delivery, and tracking info. The backend should support:

- **Purchase/Order model** (or extend existing):
  - `orderStatus`: `pending` | `paid` | `processing` | `shipped` | `out_for_delivery` | `delivered` | `failed` | `cancelled`.
  - `estimatedDeliveryAt`, `deliveredAt` (ISO date strings).
  - `trackingNumber`, `trackingUrl` (optional).
  - `fulfillmentMethod`, `deliveryZoneId`, `deliveryZoneName`, `deliveryAddress` (from checkout).
- **GET /marketplace/purchases/:id** (auth: owner of the order) — Return a single order with the above fields so the **Track order** page can show timeline, delivery date, and tracking.
- **GET /marketplace/purchases** — Include the new fields in each order so the **My Orders** list can show status, est. delivery, and tracking number.
- Admin (or internal process) can update `orderStatus`, `estimatedDeliveryAt`, `deliveredAt`, `trackingNumber`, `trackingUrl` as the order is fulfilled.

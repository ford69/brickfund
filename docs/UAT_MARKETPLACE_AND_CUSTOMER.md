# UAT: Marketplace & Customer User

Simple User Acceptance Testing checklist for the **public marketplace** and **Customer** role. Use this to verify flows end-to-end (frontend + backend).

---

## 1. Test environment

| Item | Value |
|------|--------|
| Base URL | _[e.g. https://staging.yoursite.com]_ |
| Test customer account | _[email / password]_ |
| Paystack | Use test keys / test card if applicable |

---

## 2. Guest (not logged in)

### 2.1 Browse marketplace

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| 1 | Open `/marketplace` | Marketplace listing loads; no login required | ☐ |
| 2 | Use category filter (e.g. Cement, Steel) | List updates to show only that category | ☐ |
| 3 | Use search (if available) | Results match search term | ☐ |
| 4 | Click an item | Product detail page opens (`/marketplace/[id]`) | ☐ |

### 2.2 Add to cart (guest)

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| 5 | On product page, click **Add to cart** | Item added; toast/feedback; cart count updates in header | ☐ |
| 6 | Open `/cart` | Cart shows the item(s); no login required to view cart | ☐ |

### 2.3 Redirect to signup when trying to buy

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| 7 | Click **Buy now** on product page (or **Proceed to checkout** from cart) | Redirected to **Sign up** with message like “Create an account to continue your purchase”; URL has `?redirect=...` (e.g. `/checkout` or product page) | ☐ |
| 8 | Complete signup as **Customer** | After signup, redirected back to `redirect` URL (e.g. checkout or product page) | ☐ |

---

## 3. Customer (signed in)

### 3.1 Browse & cart

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| 9 | As Customer, open `/marketplace` | Listing loads; no redirect to admin/dashboard | ☐ |
| 10 | Add item to cart, go to `/cart` | Cart shows items; can change quantity (+, −) and remove | ☐ |
| 11 | Click **Proceed to checkout** | Checkout page loads (`/checkout`); cart summary and totals correct | ☐ |

### 3.2 Checkout & payment

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| 12 | On checkout: choose Delivery or Pickup, enter/confirm address and phone | Form accepts input; delivery fee (if any) shown correctly | ☐ |
| 13 | Click **Pay with Paystack** (or equivalent) | Redirected to Paystack; amount matches cart total | ☐ |
| 14 | Complete payment on Paystack (success) | Redirected to success page (e.g. `/payment/success` or `/checkout/success`); cart is **empty** | ☐ |
| 15 | Repeat checkout but **cancel** or **fail** payment | Redirected to failure page; cart still has items; can retry | ☐ |

### 3.3 Orders & tracking

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| 16 | Go to **My Orders** (e.g. `/marketplace/purchases`) | List of customer’s orders; status and totals visible | ☐ |
| 17 | Click **Track** (or order detail) for an order | Order detail/tracking page opens (`/marketplace/orders/[id]`); status, line items, delivery info (if any) shown | ☐ |

### 3.4 Customer restrictions

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| 18 | As Customer, open `/admin` | Redirected away (e.g. sign-in or home); no admin access | ☐ |
| 19 | As Customer, open `/admin/marketplace` (create/edit listing) | No access; redirected or 403 | ☐ |
| 20 | As Customer, open `/dashboard` (investor) or project invest page | Redirected to marketplace or appropriate page; cannot invest | ☐ |

---

## 4. Signup / login as Customer

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| 21 | Sign up with role **Customer** (or default “marketplace customer”) | Account created; role is Customer; redirect respects `?redirect=` | ☐ |
| 22 | Sign in as Customer | Login succeeds; redirect to marketplace or `redirect` URL; no admin/investor menus | ☐ |

---

## 5. Quick regression (optional)

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| 23 | Inactive item: open product URL for an inactive item | Item not shown or “Unavailable”; may redirect to marketplace | ☐ |
| 24 | Checkout with empty cart | Proceed to checkout disabled or redirect to cart | ☐ |

---

## 6. Notes & issues

Use this section to record environment issues, bugs, or follow-ups.

| Date | Test area | Issue / note |
|------|-----------|----------------|
|     |           |               |
|     |           |               |

---

## Summary

- **Sections 2–4** are the core UAT for marketplace + Customer.
- **Section 5** is optional quick regression.
- Backend requirements are described in `BACKEND_PUBLIC_MARKETPLACE_AND_CUSTOMER.md`.

**Sign-off:** _________________   **Date:** _________________

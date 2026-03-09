# Production: "Access denied. No token provided"

If you see `{"success":false,"error":{"message":"Access denied. No token provided."}}` in production, use this checklist.

## Frontend (already handled)

- **401 handling:** On any 401 response, the app now clears the stored token and syncs auth state so the user is treated as logged out. They can sign in again.
- **Token source:** The token is read from `localStorage` only in the browser. It is **never** available during server-side rendering (SSR). No authenticated API calls are made during SSR in this app; they run in client components inside `useEffect`.

## Backend / config checklist

### 1. **Public vs protected routes**

The error means a request reached your API **without** an `Authorization: Bearer <token>` header.

- **If the request should be public** (e.g. homepage stats, featured projects, project list):  
  Your backend must **not** require a token for those routes. Only require a token for routes that need a logged-in user (e.g. `/users/profile`, `/users/investments`, `/subscriptions/current`, dashboard, etc.).
- **If the request should be protected:**  
  Then the frontend is calling it without a token. That can happen if:
  - The user is not logged in (e.g. first visit, or session cleared). The app will now clear state on 401 and show sign-in when needed.
  - The token was never sent (see CORS and SSR below).

### 2. **CORS (cross-origin)**

If the frontend and API are on different origins (e.g. `https://app.example.com` and `https://api.example.com`):

- The API must respond with:
  - `Access-Control-Allow-Origin: <frontend-origin>` (or your allowed list).
  - `Access-Control-Allow-Headers: Authorization, Content-Type` (or include `Authorization` in whatever you allow).
- Without `Authorization` in allowed headers, the browser may not send the `Authorization` header and you get "No token provided".

### 3. **No auth on server**

The Next.js app does **not** send the token when code runs on the server (e.g. during SSR or static generation), because `localStorage` is not available there. All authenticated API calls in this app are made from client components in `useEffect` after mount. If you add new code that calls the API from a Server Component or during build/SSR, those requests will not include a token; either make that route public on the backend or move the call to a client component and run it after mount.

### 4. **Token storage**

The token is stored in `localStorage` under the key `token`. If the user clears site data or uses a different device/browser, there is no token until they sign in again. That will correctly result in 401 for protected routes; the app will then clear state and show sign-in.

### 5. **API base URL**

In production, set `NEXT_PUBLIC_API_URL` to your real API base (e.g. `https://api.yourapp.com/api`) so the frontend calls the correct host. Build the frontend **after** setting this so the value is baked in.

---

**Summary:** Ensure public routes do not require a token, CORS allows the `Authorization` header, and only client-side code runs authenticated requests. The frontend now clears the token and auth state on 401 so users can sign in again.

---

## 401 on OAuth start (GET /api/auth/google)

If **GET /api/auth/google** (or `/api/auth/facebook`) returns 401 when the user clicks “Continue with Google”, your backend is requiring a token for that route. **That route must be public** — it is the first step of login; the user has no token yet. Whitelist these paths in your auth middleware so they do **not** require a token:

- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/auth/facebook`
- `GET /api/auth/facebook/callback`
- `POST /api/auth/login`
- `POST /api/auth/register`

See **docs/OAUTH_AND_KYC.md** for the full OAuth flow and the “401 on Continue with Google” section.

---

## 401 on /favicon.ico

If you see **GET https://api.brickfund.org/favicon.ico 401**, the browser is requesting the favicon from the API domain (e.g. after visiting or being redirected to the API URL). Fix by either:

- Serving a 204 No Content or 404 for `GET /favicon.ico` on the API (without requiring auth), or
- Ensuring the frontend always uses the app origin for the favicon (e.g. `<link rel="icon" href="/favicon.ico">` on `www.brickfund.org` so the browser does not ask the API for it).

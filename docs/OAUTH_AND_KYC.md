# Google & Facebook Sign-In: Recommendation for BrickFund

## Recommendation: **Yes, add social sign-in — with KYC unchanged**

Add **Google** (and optionally **Facebook**) sign-in as an **optional** account-creation method. **KYC and approval stay mandatory** for investors and developers; social login only changes how the account is created.

| Question | Answer |
|----------|--------|
| Add Google/Facebook sign-in? | **Yes**, as an optional sign-in/sign-up method. |
| Does it replace KYC? | **No.** Same KYC and approval flows. |
| When is the user “verified”? | Only after your own KYC/approval — not because they used Google or Facebook. |

---

## ⚠️ 401 on “Continue with Google” / GET /api/auth/google

If you see **401 Unauthorized** or **"Access denied. No token provided"** when users click “Continue with Google” (or Facebook), the cause is that **your API is requiring a token for the OAuth start route**. That route is the first step of login — the user does **not** have a token yet.

**Backend fix:** Do **not** run “require auth” (or “require token”) middleware on these routes. They must be **public** (no `Authorization` header required):

| Method | Path | Must be public? |
|--------|------|------------------|
| GET | `/api/auth/google` | **Yes** |
| GET | `/api/auth/google/callback` | **Yes** |
| GET | `/api/auth/facebook` | **Yes** |
| GET | `/api/auth/facebook/callback` | **Yes** |
| POST | `/api/auth/login` | **Yes** |
| POST | `/api/auth/register` | **Yes** |

Whitelist these paths in your auth middleware so they are excluded from the “require token” check. Only protect routes that need a logged-in user (e.g. `/api/users/profile`, `/api/users/investments`, etc.).

---

## What the frontend already does

- **“Continue with Google” / “Continue with Facebook”**  
  Redirects the browser to your existing API base with:
  - `GET {API_BASE}/auth/google?redirect_uri={origin}/auth/callback&returnUrl=/dashboard`  
  - `GET {API_BASE}/auth/facebook?redirect_uri=...&returnUrl=...`  
  (`returnUrl` is optional; default is `/dashboard`.)

- **`/auth/callback` page**  
  After your backend redirects back here with `?token=JWT&returnUrl=...` (or `?error=...`), the frontend stores the token and redirects the user to `returnUrl` or `/dashboard`. No frontend changes are required for OAuth.

So you only need to **implement the OAuth flow in your existing API backend** as below.

---

## Flow and design for your existing API

### High-level flow

```
User clicks "Continue with Google"
    → Frontend redirects to: GET /api/auth/google?redirect_uri=https://yourapp.com/auth/callback&returnUrl=/dashboard
    → Your backend redirects to Google (with your backend callback URL in redirect_uri)
    → User signs in / consents on Google
    → Google redirects to: GET /api/auth/google/callback?code=...&state=...
    → Your backend exchanges code for tokens, gets profile, finds/creates user, issues JWT
    → Your backend redirects to: https://yourapp.com/auth/callback?token=JWT&returnUrl=/dashboard
    → Frontend stores token, redirects to /dashboard
```

Same flow for Facebook, with `/api/auth/facebook` and `/api/auth/facebook/callback`.

---

### 1. Endpoints to add (under your existing API base, e.g. `/api`)

| Method | Path | Purpose |
|--------|------|--------|
| GET | `/auth/google` | Start Google OAuth: redirect user to Google. |
| GET | `/auth/google/callback` | Google redirects here with `code`; exchange for tokens, get profile, create/link user, redirect to frontend with JWT. |
| GET | `/auth/facebook` | Start Facebook OAuth: redirect user to Facebook. |
| GET | `/auth/facebook/callback` | Facebook redirects here with `code`; same as Google callback. |

No changes to existing `POST /auth/login`, `POST /auth/register`, or `GET /users/profile` are required for the OAuth flow to work, as long as OAuth users get a JWT in the same format and profile returns the same user shape.

---

### 2. State parameter (pass frontend params through the provider)

The frontend sends `redirect_uri` and `returnUrl` to your backend. Google/Facebook will call your callback with a `state` that you must pass through.

- **Encode (in `/auth/google` and `/auth/facebook`):**  
  Build a string that contains the frontend callback URL and return path, e.g.  
  `state = base64url(JSON.stringify({ redirect_uri: req.query.redirect_uri, returnUrl: req.query.returnUrl || '/dashboard' }))`.  
  Use this exact `state` when redirecting to Google/Facebook.

- **Decode (in callbacks):**  
  When Google/Facebook call your callback with `?code=...&state=...`, decode `state` to get back `redirect_uri` and `returnUrl`. Use `redirect_uri` as the base for the final redirect and append `?token=...&returnUrl=...` (or `?error=...`).

This way you don’t need server-side sessions; the frontend’s desired destination is carried in `state`.

---

### 3. Google: redirect to Google (start OAuth)

**Request:** `GET /auth/google?redirect_uri={frontend_callback}&returnUrl={path}`

**Your logic:**

1. Read `redirect_uri` and `returnUrl` from query (default `redirect_uri` to your frontend base + `/auth/callback` if missing).
2. Build `state` as in §2.
3. Backend callback URL must be **your** API URL, e.g.  
   `https://your-api.com/api/auth/google/callback`  
   (must match exactly what you register in Google Cloud Console).
4. Redirect the user (302) to:
   ```
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id={GOOGLE_CLIENT_ID}
     &redirect_uri={YOUR_BACKEND_CALLBACK_URL}
     &response_type=code
     &scope=openid+email+profile
     &state={state}
     &access_type=offline
     &prompt=consent
   ```

**Config:** In Google Cloud Console (APIs & Credentials), create an OAuth 2.0 Client ID (Web). Add to “Authorized redirect URIs”: your backend callback URL (e.g. `https://your-api.com/api/auth/google/callback`). Put Client ID and Client Secret in env (e.g. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).

---

### 4. Google: callback (exchange code → user → JWT → redirect)

**Request:** `GET /auth/google/callback?code=...&state=...` (or `?error=...`)

**Your logic:**

1. If `error` is present, decode `state` to get `redirect_uri`, then redirect to `{redirect_uri}?error=access_denied` (or the error value). Stop.
2. Decode `state` → `redirect_uri`, `returnUrl`.
3. Exchange `code` for tokens:
   - `POST https://oauth2.googleapis.com/token`  
   - Body (application/x-www-form-urlencoded):  
     `grant_type=authorization_code`, `client_id`, `client_secret`, `redirect_uri` (your backend callback URL), `code`.
   - Parse JSON; get `access_token`.
4. Get profile:
   - `GET https://www.googleapis.com/oauth2/v2/userinfo`  
   - Header: `Authorization: Bearer {access_token}`  
   - Parse JSON: `id`, `email`, `name`, `picture`.
5. Find or create user:
   - Look up by `(providerId = profile.id AND authProvider = 'google')` **or** by `email`.
   - If found: optionally update `authProvider`, `providerId`, `avatarUrl`, `isEmailVerified`; no new KYC/approval.
   - If not found: create user with `email`, name (split `name` into firstName/lastName), `authProvider: 'google'`, `providerId: profile.id`, `avatarUrl: picture`, `isEmailVerified: true`, `role: 'investor'` (or your default). No password required for OAuth-only users.
6. Issue JWT with the same format as your existing login (same claims, e.g. `userId` or `sub`).
7. Redirect (302) to:  
   `{redirect_uri}?token={jwt}&returnUrl={returnUrl}`  
   (use the `redirect_uri` from step 2; it’s the frontend’s `/auth/callback` URL).

**User model:** Add (if not already) `authProvider` ('email' | 'google' | 'facebook') and `providerId` (string). Keep `password` optional so OAuth-only users don’t need one.

---

### 5. Facebook: redirect to Facebook (start OAuth)

**Request:** `GET /auth/facebook?redirect_uri=...&returnUrl=...`

**Your logic:**

1. Same as Google: read `redirect_uri`, `returnUrl`, build `state` (§2).
2. Backend callback URL: e.g. `https://your-api.com/api/auth/facebook/callback` (must match Facebook app config).
3. Redirect (302) to:
   ```
   https://www.facebook.com/v18.0/dialog/oauth?
     client_id={FACEBOOK_APP_ID}
     &redirect_uri={YOUR_BACKEND_CALLBACK_URL}
     &state={state}
     &scope=email,public_profile
   ```

**Config:** In Facebook for Developers, create an app, add “Facebook Login” product. In “Valid OAuth Redirect URIs” add your backend callback URL. Use App ID and App Secret as `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` in env.

---

### 6. Facebook: callback (exchange code → user → JWT → redirect)

**Request:** `GET /auth/facebook/callback?code=...&state=...`

**Your logic:**

1. If `error`, decode `state` and redirect to `{redirect_uri}?error=...`. Stop.
2. Decode `state` → `redirect_uri`, `returnUrl`.
3. Exchange `code`:
   - `GET https://graph.facebook.com/v18.0/oauth/access_token?client_id=...&client_secret=...&redirect_uri=...&code=...`
   - Parse JSON; get `access_token`.
4. Get profile:
   - `GET https://graph.facebook.com/v18.0/me?fields=id,name,email,picture.type(large)&access_token=...`
   - Parse: `id`, `name`, `email`, `picture.data.url`.
5. Find or create user (same strategy as Google): by `(providerId, authProvider: 'facebook')` or by `email`; create if missing with `authProvider: 'facebook'`, `providerId`, optional `avatarUrl`, `isEmailVerified: true`, default role.
6. Issue JWT (same as existing login).
7. Redirect to `{redirect_uri}?token={jwt}&returnUrl={returnUrl}`.

---

### 7. Errors and edge cases

- **Missing or invalid `code`:** Redirect to `{redirect_uri}?error=no_code` (or similar).
- **Token exchange or profile request fails:** Redirect to `{redirect_uri}?error=token_exchange_failed` (or `profile_failed`).
- **Profile has no email:** Redirect with `?error=no_email` (required for your user model).
- **Google/Facebook not configured:** Redirect with `?error=google_not_configured` or `facebook_not_configured`.
- **Existing email user signs in with Google/Facebook:** Either link the account (set `authProvider`/`providerId` on existing user) or return a clear error and ask them to use email login; linking is better UX.

Use the same `redirect_uri` from `state` for all error redirects so the frontend always lands on `/auth/callback` and can show a message or redirect to sign-in.

---

### 8. Implementation checklist (your existing API)

- [ ] Add env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, and a single `FRONTEND_URL` (e.g. `https://yourapp.com`) for default `redirect_uri` when not provided.
- [ ] User model: add `authProvider` (e.g. `'email' | 'google' | 'facebook'`), `providerId` (string); make `password` optional.
- [ ] Implement `GET /auth/google`: build state, redirect to Google with your backend callback URL and scope `openid email profile`.
- [ ] Implement `GET /auth/google/callback`: decode state, exchange code, get profile, find/create user, issue JWT, redirect to `{redirect_uri}?token=...&returnUrl=...`.
- [ ] Implement `GET /auth/facebook` and `GET /auth/facebook/callback` (same pattern).
- [ ] In Google Cloud Console: add your backend callback URL to OAuth client redirect URIs.
- [ ] In Facebook app: add your backend callback URL to Valid OAuth Redirect URIs.
- [ ] Ensure existing `GET /users/profile` (or equivalent) returns the same user shape for OAuth users and that your JWT works with it (frontend already uses this after storing the token).

No frontend changes are required; the flow and design above are for your existing API only.

# Backend flows: Profile (picture + edit) and Browse Projects (Ghana locations)

Use this to implement or fix the backend for the BrickFund frontend.

---

## 1. Profile picture (avatar) upload

**Frontend behaviour:** When the user chooses a profile image, the app calls (in order):

1. **POST /api/users/profile/avatar**  
   - Body: `multipart/form-data` with a file field (`file` or `avatar`).  
   - Expected response (any of):  
     - `{ success: true, data: { user } }` with full user (including `avatarUrl`), or  
     - `{ success: true, data: { url } }` or `{ url }` (avatar URL).  
   - If the backend returns a `url`, the frontend then calls **PUT /api/users/profile** with `{ avatarUrl: url }`.

2. **Fallback: POST /api/documents**  
   - If `/users/profile/avatar` is not implemented or returns an error, the frontend tries:  
   - Body: `multipart/form-data` with `files` (the image) and `category: 'avatar'`.  
   - Expected response: array of objects with `url` or `fileUrl` (e.g. `[{ url: "https://..." }]`).  
   - Frontend then calls **PUT /api/users/profile** with `{ avatarUrl: <that url> }`.

**Why it works locally but not in production:**  
In production, either:

- **POST /api/users/profile/avatar** is not implemented or returns 404/5xx, and  
- **POST /api/documents** is also missing or returns 404.

**Backend implementation options (pick one):**

**Option A – Avatar endpoint (recommended)**  
- Add **POST /api/users/profile/avatar**.  
- In the handler: require auth, read the uploaded file from the request, upload to your storage (e.g. S3, Cloudinary), get the public URL.  
- Update the current user: `user.avatarUrl = url`; save.  
- Respond with `{ success: true, data: { user } }` or `{ success: true, data: { url } }`.

**Option B – Documents endpoint**  
- Add **POST /api/documents** (or ensure it exists).  
- Accept `multipart/form-data` with `files` and optional `category`.  
- Upload file(s) to storage, then return `{ success: true, data: [{ url: "https://..." }] }` (or your existing document response shape that includes a URL).  
- Ensure **PUT /api/users/profile** accepts `avatarUrl` and persists it on the user.

**User model:**  
- Must have a field such as `avatarUrl` (string) that is returned in **GET /api/users/profile** and can be set via **PUT /api/users/profile** (and optionally by POST /api/users/profile/avatar).

---

## 2. User profile update (edit profile)

**Frontend behaviour:**  
- The profile edit form does **not** send `firstName`, `lastName`, or `email` (those fields are read-only).  
- On save it sends only editable fields, for example:  
  `phone`, `dateOfBirth`, `address`, `city`, `state`, `zipCode`, `country`, `bio`.

**Endpoint:** **PUT /api/users/profile**

- Require authentication (e.g. JWT).  
- Body: JSON with optional fields, e.g.  
  `phone`, `dateOfBirth`, `address`, `city`, `state`, `zipCode`, `country`, `bio`, `companyName`, `avatarUrl`.  
- Backend should:  
  - Identify the current user from the token.  
  - Update **only** the allowed fields on the user document.  
  - **Do not** allow updating `firstName`, `lastName`, or `email` from this endpoint (ignore them if sent, or return 400).  
- Return the updated user (same shape as **GET /api/users/profile**), e.g. `{ success: true, data: user }`.

**User model (extended profile):**  
If you want to support all fields the frontend sends, the user document should allow (in addition to core auth fields):  
`phone`, `dateOfBirth`, `address`, `city`, `state`, `zipCode`, `country`, `bio`, `companyName`, `avatarUrl`.  
If some of these are not in your schema yet, add them or ignore them in the PUT handler.

**"Invalid updates" from the backend:**  
If the frontend gets **"Update failed, Invalid updates"**, the backend is rejecting the payload. Common causes:

- **Mongoose:** You may be using an allow-list (e.g. `allowedUpdates`) that does not include the fields the frontend sends, or the User schema does not define those paths. Fix: add the allowed fields to your User schema and to any update allow-list, or strip unknown fields and only update the ones you allow (e.g. `phone`, `dateOfBirth`, `address`, `city`, `state`, `zipCode`, `country`, `bio`).
- **Validation:** A validator might be failing (e.g. format of `dateOfBirth` or required fields). Ensure PUT only updates optional fields and that validation allows them.

---

## 3. Browse projects – filter by location (Ghana cities)

**Frontend behaviour:**  
- The “Browse projects” page sends a `location` query parameter when the user selects a location (e.g. `GET /api/projects?location=Accra`).  
- The location dropdown is a fixed list of Ghana cities, e.g.:  
  All Locations, Accra, Kumasi, Tamale, Sekondi-Takoradi, Ashaiman, Tema, Teshie, Cape Coast, Obuasi, Tema Metropolitan, Koforidua, Wa, Sunyani, Ho, Bolgatanga.  
- Value sent is the city name (e.g. `Accra`, `Kumasi`).

**Backend implementation:**  
- **GET /api/projects** (or your equivalent list endpoint) should accept an optional query parameter `location` (string).  
- When `location` is present and not `"all"`:  
  - Filter projects where the stored location matches the given value.  
  - Typical project location shape: `location: { address, city, state, zipCode, country }`.  
  - Filter by `location.city` (e.g. `location.city === locationParam` or case-insensitive match).  
  - Optionally also match `location.state` or a normalized/canonical name if you store regions differently.  
- Return the filtered list as you already do for other filters (category, status, search).

**No new endpoints are required**; only add or adjust the `location` filter logic in your existing projects list handler.

---

## Summary

| Feature | Frontend | Backend |
|--------|----------|---------|
| Profile picture | POST /users/profile/avatar or POST /documents + PUT /users/profile | Implement avatar and/or documents upload; user model has `avatarUrl`; PUT /users/profile accepts `avatarUrl`. |
| Edit profile | PUT /users/profile with phone, address, city, state, zipCode, country, bio, etc. (no firstName, lastName, email) | PUT /users/profile updates only allowed fields; ignore or reject firstName, lastName, email. |
| Browse by location | GET /projects?location=Accra (Ghana city name) | GET /projects accepts `location` and filters by `location.city` (or equivalent). |

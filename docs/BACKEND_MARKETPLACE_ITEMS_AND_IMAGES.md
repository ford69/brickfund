# Backend: Marketplace Items & Multi-Image Gallery

This document describes what the backend must implement for marketplace item create/update and **multi-image support**, so the admin UI (create/edit) and public product page work correctly.

---

## 1. Item model (persistence)

Store and return:

| Field | Type | Notes |
|-------|------|--------|
| `images` | `string[]` | **Required for gallery.** Array of image URLs. Order matters: first = primary. |
| `image` or `imageUrl` | `string` | **Optional.** Primary image URL. Should equal `images[0]` when `images` is present. Kept for backward compatibility and list/card views. |
| `fulfillmentTier` | `'small' \| 'medium' \| 'large'` | **Optional.** Used at checkout to choose delivery vehicle: small → motor bike, medium → mini truck, large → truck (e.g. nails = small, iron rods = large). |
| (other fields) | … | name, description, category, price, currency, sku, brand, stock, unitType, unitLabel, unitSize, tags, isActive, etc. |

- **Always persist `images`** when the client sends it (create or update).
- If the client sends only `image` (single URL), you may set `images = [image]` and treat it as a one-item gallery.
- **GET item** (single and list): return both `images` (full array) and `image`/`imageUrl` (primary) so the product gallery and list thumbnails work.

---

## 2. Create item

**Endpoint:** `POST /admin/marketplace/items`  
**Body:** JSON (Content-Type: `application/json`).

Accept at least:

- **Required:** `name`, `description`, `category`, `price`, `currency`, `stock` (number).
- **Optional:** `sku`, `brand`, `unitType`, `unitLabel`, `unitSize` (number), `fulfillmentTier` (`small` | `medium` | `large`), `tags` (string array), `isActive` (boolean, default true).
- **Images:**
  - `images` (string array) – full gallery URLs. **If present, persist as-is.**
  - `image` (string) – primary image URL. If `images` is not sent but `image` is, set `images = [image]`.

The frontend now creates items **only via this JSON endpoint**. It uploads image files to your document/upload API first, then sends the returned URLs in `images` and `image`. You do **not** need to accept multipart for create unless you want to keep a legacy `POST .../with-image` for other clients.

**Response:** Return the created item with `images` and `image`/`imageUrl` populated.

---

## 3. Update item

**Endpoint:** `PUT /admin/marketplace/items/:id`  
**Body:** JSON.

Accept the same fields as create (all optional for update). For images:

- **`images`** (string array): replace the item’s full gallery with this array. First element is the primary image.
- **`image`** (string): set primary image. If `images` is also sent, `image` should match `images[0]` or you can derive primary from `images[0]`.

**Contract:** The frontend sends the **full** `images` array on save (existing URLs + any new URLs from uploads). Backend should **replace** the stored `images` with the received array (not merge with existing), so that removed images are dropped and order is preserved.

**Response:** Return the updated item with `images` and primary image.

---

## 4. File upload (for images)

The admin UI uploads image **files** to your existing document upload API, then adds the returned URL(s) to the item’s `images` array.

- **Endpoint:** e.g. `POST /documents` (or `/upload`) with `FormData`: `files` (file(s)), `category` (e.g. `'marketplace'`).
- **Response:** Array of objects with at least one of `url` or `fileUrl` per file.

No change required to item create/update if this already returns a URL; the frontend uses that URL in `images` and `image`.

---

## 5. GET item / list (public and admin)

- **GET /marketplace/items/:id** (public) and **GET /admin/marketplace/items/:id** (admin):  
  Return the item with:
  - `images`: string[] (full gallery)
  - `image` or `imageUrl`: string (primary; e.g. `images[0]`)

- **GET /marketplace/items/active** and **GET /admin/marketplace/items** (list):  
  Include `image`/`imageUrl` (and optionally `images`) so list and cards can show a thumbnail. Product detail page uses `images` for the gallery.

---

## 6. Summary checklist

| Item | Action |
|------|--------|
| Item model | Store `images: string[]` and primary `image`/`imageUrl`. |
| POST /admin/marketplace/items | Accept JSON with `images[]` and `image`; persist `images` and set primary from `images[0]` or `image`. |
| PUT /admin/marketplace/items/:id | Accept JSON with `images[]`; **replace** stored gallery with received array. |
| GET item (single) | Return `images` and primary image. |
| GET item list | Return at least primary image for thumbnails. |
| File upload | Existing document/upload API returning URL per file is enough; frontend uses URLs in `images`. |

Once the backend persists and returns `images` (and primary) as above, the admin multi-image gallery (add/remove/set primary) and the public product gallery will work end-to-end.

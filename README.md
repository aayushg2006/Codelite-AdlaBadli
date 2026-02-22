# GeoSwap (Adla-Badli)

GeoSwap is a mobile-first hyperlocal reuse platform that combines AI-assisted listing, intent-based swap matching, and in-chat deal closure.

It helps nearby users exchange or sell items faster while reducing waste by:
- surfacing nearby items within 5 km,
- detecting mutual swap intent automatically,
- moving users into chat with proposal and negotiation tools,
- and closing deals with a finalized rate that is reflected in history.

---

## 1. Problem Statement

Most local marketplaces are search-driven and manual:
- users must keep searching repeatedly,
- matching needs are often missed even when two users are ideal swap partners,
- and transactions are poorly tracked from negotiation to closure.

This causes low trust, low conversion, and unnecessary churn.

---

## 2. Solution Overview

GeoSwap introduces an intent-matching engine on top of a standard local feed:
- AI extracts listing details from a photo.
- Nearby items are discovered through geospatial queries.
- Wishlist + listing signals are cross-matched to identify mutual swap opportunities.
- Smart notifications open direct chat.
- Swap requests, rate proposals, accept/reject actions, and deal-closed events are persisted in chat.
- Closed listings are automatically removed from feed and smart notifications.

---

## 3. Product Demo

Replace these placeholders with your hackathon assets:

- Demo Video: `https://drive.google.com/file/d/1Inher9WmU6K8Q8Zpkp8o-9Hy2OdGnfxE/view?usp=drive_link`
- Hosted Prototype: `https://codelite-adla-badli.vercel.app`
- Pitch Deck / Presentation: `https://www.canva.com/design/DAHB_vZ_CvE/ZcIynTxZRbKVsqVzkZjO7Q/edit?utm_content=DAHB_vZ_CvE&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton`

---

## 4. Key Features (Implemented)

### User and Identity
- Email/password auth via Supabase.
- Optional Google OAuth.
- User profile sync into `public.users` on login/signup.

### AI-Assisted Listing
- Upload image to Supabase Storage.
- Backend AI scan (`Gemini`) extracts:
  - item name,
  - category,
  - suggested INR price,
  - estimated weight.
- Listing is inserted with geolocation into Supabase using RPC.

### Local Feed (5 km)
- Geofenced nearby listings via `get_items_within_radius`.
- Search filter on the feed.
- Wishlist toggle from feed cards.
- Closed listings (`sold`, `swapped`) filtered out.

### Smart Swap Notifications
- AI match card generated from mutual intent:
  - your wishlist contains their item,
  - their wishlist contains your item,
  - both users are within 5 km.
- Smart notification panel with unread state.
- Click actions open chat directly for the matched listing.
- Closed listing updates auto-prune feed + smart notifications in realtime.

### Chat and Negotiation
- Auto-create or open existing chat for listing + buyer/seller pair.
- Real-time message updates (Supabase Realtime).
- In-chat swap proposal modal:
  - listed-item dropdown,
  - sell/give comparison,
  - request submission.
- Seller incoming swap request card:
  - requester,
  - offer vs your item,
  - accept/reject actions.

### Final Rate + Deal Closure
- In-chat final rate proposal workflow.
- Counterparty can accept/reject rate proposal.
- Accepted rate persists as timeline event.
- Deal closure event persists in chat.
- Accepted swap marks listings as `swapped`.
- Seller close flow can mark listing `sold` with final rate.

### Profile + History
- Profile tabs:
  - My Listings (active only),
  - My Wishlist,
  - History.
- History aggregates:
  - swap status (pending/completed/rejected),
  - buy/sell outcomes from deal events,
  - final rate where available.

### Chat Notifications
- Bottom nav chat badge shows unread incoming message count.
- Per-chat read checkpoints stored locally and updated when chat is opened.

---

## 5. Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Lucide Icons
- Supabase JS SDK

### Backend
- Node.js + Express
- Supabase JS SDK
- Google Generative AI SDK (Gemini)
- CORS, dotenv

### Platform Services
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Realtime
- PostGIS (for geospatial radius logic via RPC)

---

## 6. System Architecture

```text
┌───────────────────────────────────────────────────────────────────┐
│                           React Frontend                          │
│  - Home feed, smart notifications, chat, profile/history         │
│  - Realtime listeners (messages + listing status updates)         │
└───────────────┬───────────────────────────────────────────────────┘
                │ REST + Supabase Client SDK
                ▼
┌───────────────────────────────────────────────────────────────────┐
│                       Express Backend API                          │
│  /api/scan                     /api/items/nearby                  │
│  /api/listings/ai-webhook      /api/swaps/smart-matches           │
│  /api/swaps/propose            /api/swaps/:id/respond             │
│  /api/chats/:id/rate/respond   /api/listings/:id/mark-sold        │
└───────────────┬───────────────────────────────────────────────────┘
                │ Supabase SDK + RPC
                ▼
┌───────────────────────────────────────────────────────────────────┐
│                           Supabase                                 │
│  Auth, Postgres tables, Storage bucket, Realtime channels         │
│  RPC: get_items_within_radius, insert_listing_with_location       │
└───────────────────────────────────────────────────────────────────┘
                │
                ▼
          Google Gemini (AI scan/extraction)
```

---

## 7. Core Workflows

### A. AI Listing Workflow
1. User uploads an image in Add Item.
2. Image is stored in Supabase Storage.
3. Backend `/api/scan` runs Gemini extraction.
4. User confirms extracted fields.
5. Backend `/api/listings/ai-webhook` inserts geotagged listing via RPC.
6. Listing appears in nearby feed for users in radius.

### B. Smart Swap Match Workflow
1. User adds wishlist items.
2. Home calls `/api/swaps/smart-matches` periodically.
3. Backend computes mutual intent:
   - user wants seller's listing,
   - seller wants one of user's listings,
   - seller is within 5 km.
4. Notification card is shown.
5. User opens matched chat from notification CTA.

### C. Swap Proposal Workflow
1. Buyer opens listing chat and taps `Propose`.
2. Buyer selects offered listing and sends request.
3. Backend creates row in `matches` with `pending`.
4. Seller sees incoming request card in chat.
5. Seller accepts/rejects.
6. Swap event is written into chat timeline.
7. On acceptance, both listings are marked `swapped`.

### D. Final Rate Workflow
1. User proposes final rate in chat.
2. Counterparty accepts/rejects proposal.
3. Rate event is persisted in chat timeline.
4. On accepted rate, listing is closed (sold path) and deal event is recorded.
5. Final amount appears in profile history.

### E. Closed Listing Cleanup Workflow
1. Listing status changes to `sold` or `swapped`.
2. Backend filters closed listings from nearby feed and smart match generation.
3. Frontend realtime listener removes closed listing from:
   - local feed cards,
   - smart notification panel.

---

## 8. API Reference (Current)

### Public/Hybrid
- `POST /api/scan`
  - AI metadata extraction from image URL.
- `GET /api/items/nearby?lat=<>&lon=<>`
  - Returns active nearby listings within 5 km.
- `GET /api/swaps/smart-matches?user_id=<>&lat=<>&lon=<>`
  - Returns smart mutual swap notifications.
- `POST /api/listings/ai-webhook`
  - Creates geotagged listing (supports auth header pass-through).

### Authenticated (`Bearer <Supabase Access Token>`)
- `POST /api/swaps/propose`
  - Body: `{ desired_listing_id, offered_listing_id }`
- `PUT /api/swaps/:id/respond`
  - Body: `{ response: "accept" | "reject" }`
- `PUT /api/chats/:id/rate/respond`
  - Body: `{ response: "accept" | "reject", proposal_id }`
- `PUT /api/listings/:id/mark-sold`
  - Body: `{ final_rate }`

---

## 9. Data Model (Tables Used)

This project currently relies on these Supabase tables:
- `users` (id, username, avatar_url, ...)
- `listings` (id, user_id, title, category, price, status, ai_metadata, location, ...)
- `wishlists` (user_id, desired_item)
- `chats` (id, buyer_id, seller_id, listing_id, ...)
- `messages` (id, chat_id, sender_id, content, created_at, ...)
- `matches` (id, user_1_id, user_2_id, listing_1_id, listing_2_id, status, ...)

Event payloads are encoded into `messages.content` with prefixes:
- `__SWAP_EVENT__`
- `__RATE_EVENT__`
- `__DEAL_EVENT__`

---

## 10. Local Setup

## Prerequisites
- Node.js 18+ (Node 20 recommended)
- npm
- Supabase project (Auth + DB + Storage + Realtime)
- Gemini API key

## Environment Variables

### Backend (`.env` in repo root and/or `backend/.env`)
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `GEMINI_API_KEY`
- `PORT` (optional, default `3000`)

### Frontend (`frontend/React_01/.env`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Run Backend
From repository root:
```bash
npm install
node server.js
```

Or from `backend` folder:
```bash
cd backend
npm install
npm start
```

## Run Frontend
```bash
cd frontend/React_01
npm install
npm run dev
```

## Lint/Build
```bash
cd frontend/React_01
npm run lint
npm run build
```

---

## 11. Supabase RPC Requirements

Required RPC functions:
- `get_items_within_radius(user_lat, user_lon, radius_meters)`
- `insert_listing_with_location(title, category, price, ai_metadata, user_id, user_lat, user_lon)`

Reference SQL file:
- `backend/supabase_insert_listing_with_location.sql`

---

## 12. Repository Structure

```text
.
├── server.js                       # Main backend entry (actively used)
├── middleware/
│   └── auth.js                     # Supabase JWT auth middleware
├── backend/
│   ├── server.js                   # Mirror backend entry
│   ├── package.json
│   └── supabase_insert_listing_with_location.sql
└── frontend/React_01/
    ├── src/App.jsx                 # App-level nav, auth/session, unread chat badge
    ├── src/pages/Home.jsx          # Local feed + smart notifications
    ├── src/pages/AddItem.jsx       # AI listing flow
    ├── src/pages/ChatList.jsx      # Conversation list
    ├── src/pages/ChatRoom.jsx      # Swap + rate + deal workflow
    ├── src/pages/Profile.jsx       # Listings, wishlist, history
    ├── src/components/feed/
    ├── src/components/notifications/
    ├── src/components/ui/
    └── src/lib/supabaseClient.js
```

---


## 13. Known Gaps / Next Steps

- Add persistent notification table (currently computed live).
- Add server-side read receipts for messages.
- Add payment integration for non-swap purchases.
- Add admin moderation and listing quality checks.
- Add analytics dashboard (conversion, avg negotiation time, CO2 saved).

---

## 14. Team / Credits

- Team Name: Code Bandits
- Members: Aayush Gupta, Soham Jain, Gyaneshwar Jha, Vedant Bist


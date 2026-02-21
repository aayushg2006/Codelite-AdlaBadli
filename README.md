# GeoSwap (Adla Badli)

GeoSwap is a mobile-first local marketplace app for buying, swapping, and low-waste exchange.
This repository currently contains:
- A React frontend app (`frontend/React_01`)
- A Node/Express API entry (`server.js`) integrated with Supabase RPC

This README documents the current implemented features, file structure, and system architecture.

## Current Features

### 1. Onboarding and Auth
- Simplified entry screen with app name and `Get Started`.
- Auth page with tabbed `Sign In` / `Sign Up`.
- Sign-up form fields:
  - Username
  - Password
  - Mobile Number
  - Email ID

### 2. Home Feed
- Local feed with search bar filtering in-page items.
- Rupee pricing format (`INR`) across cards.
- Item cards with heart/favorite behavior.
- Favorites sync to Profile Wishlist.

### 3. AI Notification System (Frontend, Backend-Ready)
- Header bell icon with unread badge count.
- Notification dropdown with smooth open/close animation.
- Smart swap notification cards:
  - `AI Match` badge
  - Title/message/distance
  - `View Swap` action
  - `Propose Swap` quick action
- Unread notifications are marked as read when dropdown opens (local state + async placeholder service).

### 4. Chat and Swap UX
- Chat screen with contextual item card.
- Three-dots menu with floating seller contact popup:
  - Phone
  - Email
  - Outside-click close
- Buyer POV:
  - Product description section
  - `Propose` button opens modal
  - Modal includes listed item selector and `Sell <-> Give` comparison
  - `Send Request` action
- Seller POV:
  - Incoming swap request card
  - Comparison view
  - `Accept` / `Reject` actions

### 5. Add Item
- AI scan simulation block.
- Item form supports:
  - Title
  - Category
  - Suggested Price
  - Estimated Weight (kg)
  - Description

### 6. Profile and Order History
- Profile dashboard with impact stats.
- Listings and Wishlist tabs.
- Header now includes `Order History` button (replaced old level badge).
- Slide-up order history panel:
  - Grouped by date
  - Filter tabs: All / Swaps / Purchases
  - Swap transaction details (`You Gave -> You Received`)
  - Buy transaction details (seller + amount)
  - Status chips (`COMPLETED` / `CANCELLED`)

## Project Structure (Current)

```text
.
|-- server.js                         # Main API entry (Express + Supabase RPC)
|-- controllers/
|   `-- listingsController.js         # Scaffold (currently empty)
|-- middleware/
|   `-- auth.js                       # Scaffold (currently empty)
|-- routes/
|   `-- listings.js                   # Scaffold (currently empty)
|-- backend/
|   |-- package.json                  # Backend dependency manifest
|   `-- server.js                     # Scaffold (currently empty)
`-- frontend/
    |-- package.json
    |-- package-lock.json
    `-- React_01/
        |-- package.json
        |-- src/
        |   |-- App.jsx               # Top-level app state and screen switching
        |   |-- index.css             # Global styling and scrollbar behavior
        |   |-- data/
        |   |   `-- mockData.js
        |   |-- lib/
        |   |   |-- helpers.js        # Shared helpers (e.g., INR formatting)
        |   |   `-- supabaseClient.js
        |   |-- services/
        |   |   |-- notificationService.js
        |   |   `-- orderHistoryService.js
        |   |-- pages/
        |   |   |-- Entry.jsx
        |   |   |-- Auth.jsx
        |   |   |-- Home.jsx
        |   |   |-- AddItem.jsx
        |   |   |-- ChatRoom.jsx
        |   |   `-- Profile.jsx
        |   `-- components/
        |       |-- feed/
        |       |   `-- LocalFeed.jsx
        |       |-- layout/
        |       |   |-- Header.jsx
        |       |   |-- CurvedHeader.jsx
        |       |   |-- FlatHeader.jsx
        |       |   `-- BottomNav.jsx
        |       |-- notifications/
        |       |   |-- NotificationBell.jsx
        |       |   |-- NotificationDropdown.jsx
        |       |   `-- SmartSwapNotificationCard.jsx
        |       |-- profile/
        |       |   |-- ProfileHeader.jsx
        |       |   |-- OrderHistoryPage.jsx
        |       |   |-- TransactionCard.jsx
        |       |   |-- SwapTransactionDetails.jsx
        |       |   `-- BuyTransactionDetails.jsx
        |       `-- ui/
        |           |-- ItemCard.jsx
        |           |-- ChatBubble.jsx
        |           `-- StatCard.jsx
        `-- ...
```

## System Architecture

## High-Level
```text
[React UI Components]
        |
        v
[Page State + Local App State]
        |
        v
[Frontend Services Layer]
  - notificationService
  - orderHistoryService
        |
        v
[Backend APIs (current / future)]        <- - -
                                              |
        |                                     |
        v                                     |
[Supabase (RPC, tables, auth)] --> N8N AI Automation models
```

### Frontend Architecture
- `App.jsx` controls:
  - auth stage
  - active tab
  - selected chat item
  - shared wishlist IDs
- Page-level responsibilities:
  - `Home`: feed + notifications integration
  - `ChatRoom`: messaging + swap workflows
  - `Profile`: impact view + order history panel
- Service layer abstracts async data access:
  - `fetchNotifications`, `markNotificationAsRead`
  - `fetchOrderHistory`

### Backend/API Architecture (Current State)
- Primary API entry: `server.js` at repo root.
- Current endpoints:
  - `GET /api/items/nearby`
  - `POST /api/listings/ai-webhook`
  - `POST /api/swaps/propose`
- Supabase usage:
  - RPC calls for geospatial listing queries/inserts
  - matches/listings table operations for swap proposals

### Backend Integration Readiness
Frontend is structured so mock services can be replaced with real APIs without refactoring UI components:
- Notifications:
  - replace `fetchNotifications()` with `GET /notifications`
  - replace `markNotificationAsRead(id)` with `PATCH /notifications/:id`
- Order History:
  - replace `fetchOrderHistory()` with `GET /transactions`
  - add pagination/filter params later (`type`, `status`, `page`)

## Local Development

### Frontend
```bash
cd frontend/React_01
npm install
npm run dev
```

### Frontend quality checks
```bash
cd frontend/React_01
npm run lint
npm run build
```

### Backend (current API entry)
Set environment variables before running:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `PORT` (optional)

Run:
```bash
node server.js
```

## Notes
- Some backend scaffold files (`backend/server.js`, `routes/listings.js`, `controllers/listingsController.js`, `middleware/auth.js`) are currently placeholders and can be used for the next backend refactor.
- Frontend features are functional with mock service data and are organized for straightforward backend wiring.

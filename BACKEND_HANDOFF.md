# Exam Arena — Backend Handoff / API Spec

This document describes the features we've built on the frontend that need backend integration, plus the exact API contracts the frontend expects.

- **Repo**: https://github.com/Udayraj-Sahu/ExamArena
- **Branch**: `mobile/dashboard-glassmorphism`
- **Frontend stack**: Next.js 14 (App Router, static export) + Capacitor (Android) + Zustand (local persistence) + React Query
- **Mock mode**: `NEXT_PUBLIC_API_MOCK !== "false"` defaults to mock. All endpoints below must be reachable at `{API_BASE_URL}/api/v1/...`.

---

## 1. Invite / Referral (with affiliate code)

### Status
- Frontend has a **client-side mock** of the referral system:
  - Generates a per-user code locally (e.g. `ARENA-X7K2M9QD`) and stores it in `localStorage` (`exam-arena-referral`).
  - Tracks `invitesSent` and `friendsJoined` locally (counters are cosmetic until wired to backend).
- UI lives in `src/components/dashboard/invite-card.tsx`.

### Frontend expectations (API contract)

| Endpoint | Method | Auth | Request | Response |
|---|---|---|---|---|
| `POST /api/v1/referral/code` | POST | Bearer | `{}` | `{ code: string }` — issue idempotently; return existing code if one already exists for the user |
| `GET /api/v1/referral/me` | GET | Bearer | — | `{ code: string, invitesSent: number, friendsJoined: number, xpEarned: number }` |
| `POST /api/v1/referral/redeem` | POST | Bearer (or pre-auth on signup) | `{ code: string }` | `{ success: boolean, message?: string }` |
| `GET /api/v1/referral/notification` | GET | Bearer | — | `{ joined: boolean, friendName?: string }` — tells the app when a friend joined so it can grant XP + trigger a success UI |

### Backend responsibilities
1. **Issue the code server-side** — do NOT trust the client-generated code. Normalize to `{PREFIX}-{XXXXXXX}` (e.g. from first name, or a fixed brand prefix). Must be unique and idempotent per user.
2. **Attach referral on signup**: new user signs up with a referral code → store `referredBy` on their user record.
3. **Reward rules** (please confirm exact values — the frontend will display whatever you return):
   - XP to referrer (e.g. +50 XP per friend).
   - XP to referee (e.g. +25 XP).
   - Defer award until the referee completes a meaningful action (e.g. finishes onboarding or first sprint) to prevent abuse. Confirm the trigger.
4. **Anti-abuse**:
   - A code can only be redeemed once per referee (dedupe by email/phone/device id).
   - Optional: cap total rewards per user per day.
   - Rate-limit the redeem endpoint.

### Frontend integration points
- `src/stores/referral-store.ts` — currently local; replace code generation + counters with API calls (`POST /referral/code` on first render, `GET /referral/me` to hydrate).
- `src/app/dashboard/page.tsx` / `src/components/dashboard/invite-card.tsx` — reads `code`, `invitesSent`, `friendsJoined` from the store. Copy button calls `POST /referral/redeem`-adjacent share metrics; Share uses Web Share API / Capacitor native share.

---

## 2. WhatsApp Web-style "Scan to login on web"

### Status
- A **self-contained demo** lives at `/auth` (`src/app/auth/page.tsx`).
- Currently: shows a QR-style frame + a pairing code, and a "Simulate scan" button that logs in locally via a mocked `setToken`. **No real backend yet** — the QR is cosmetic and login is mocked.

### Real flow the backend must provide
A **web ↔ app pairing coordinator** with short-lived sessions:

| Endpoint | Method | Auth | Request | Response / Description |
|---|---|---|---|---|
| `POST /api/v1/pairing/session` | POST | none (web) | `{ scope?: string }` | `{ sessionId, code, expiresAt }` — create session; `code` is rendered as QR on the web page |
| `GET /api/v1/pairing/session/:id` | GET | none (web) | — | `{ status: "pending" \| "scanned" \| "approved" \| "expired", token?, refreshToken? }` — web polls every ~2–3s |
| `POST /api/v1/pairing/session/:id/scan` | POST | Bearer (app) | `{ code: string }` | Marks session `scanned` |
| `POST /api/v1/pairing/session/:id/approve` | POST | Bearer (app) | `{ code: string }` | Confirms pairing; backend issues access + refresh tokens **bound to the web session** |
| `POST /api/v1/pairing/session/:id/revoke` | POST | Bearer (web or app) | `{}` | Revokes an approved/paired session (logout from linked device) |
| `GET /api/v1/pairing/sessions` | GET | Bearer | — | List of the user's active linked device sessions (for a "devices" management screen) |

### Session model (backend suggestion)
```
pairing_session {
  id            uuid
  code          string   // short, 6-8 chars, human typeable
  status        enum     // pending | scanned | approved | expired
  user_id       uuid     // null until approved
  expires_at    timestamp // ~120s TTL
  created_at    timestamp
}
```

### Security notes for backend
- **Short TTL** (~120 seconds) — one-time code, unguessable.
- **Rate-limit** the status poll endpoint.
- On `approve`, issue a **fresh** access token bound to the web session — do NOT reuse the phone app's token.
- **Cap device sessions** per user (e.g. max 5); expose list/revoke.
- QR content = a link the phone parses, e.g. `https://{host}/pair?code={code}` (or a deep link `examarena://pair?code=...`).

### Frontend integration points
- `src/app/auth/page.tsx` — replace the mocked QR/pairing with:
  1. `POST /pairing/session` on mount → get `code` → render real QR.
  2. Poll `GET /pairing/session/:id` until `approved`.
  3. On `approved`, use returned `token`/`refreshToken` → call `setToken` in `src/stores/auth-store.ts`.
- `src/stores/auth-store.ts` already has `setToken(token)` / `setRefreshToken(token)` / `loginWithFirebase`. The `/auth` page should land authenticated users on `/dashboard`.

---

## 3. General notes for integration

- **CORS**: static web export needs CORS enabled on the API for whatever host the web build is served from.
- **Error format**: return structured errors, e.g. `{ error: { code: string, message: string } }` with proper HTTP status codes. The frontend will map these to UI states (especially for pairing: `expired`, `invalid`, `already_used`).
- **Auth header**: frontend sends `Authorization: Bearer <token>`.
- **Storage**: web/app persist `token`/`refreshToken` in localStorage (`exam-arena-auth`) and in Capacitor Preferences. Keep refresh-token rotation in mind.

---

## Priority order for the backend team
1. **Referral** (`code`, `me`, `redeem`) — small, high value, unblocks the invite card.
2. **Pairing** (`session`, `scan`, `approve`, `revoke`, `sessions`) — needed for real scan-to-login.

If you need the exact frontend request/response mocks or want to change any field names, tell us and we'll align the schemas.

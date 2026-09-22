# Exam Arena — Backend Handoff / API Spec

This is the **single canonical handoff** for the backend team. It describes **every** feature built on the frontend that needs backend integration, with the exact API contracts the frontend expects.

- **Repo**: https://github.com/Udayraj-Sahu/ExamArena
- **Branch**: `feature/renderer-runtime`
- **Frontend stack**: Next.js 14 (App Router, static export) + Capacitor 8 (Android) + Zustand (local persistence) + React Query (TanStack) + Firebase Client SDK
- **Mock mode**: `NEXT_PUBLIC_API_MOCK !== "false"` defaults to mock. When set to `false` (with `NEXT_PUBLIC_API_URL` set), every service hits the endpoints below at `{API_BASE_URL}/api/v1/...`.

---

## 0. Integration Conventions (read first)

- **Base URL**: all paths use `/api/v1/` prefix. Configure `NEXT_PUBLIC_API_URL` (no trailing `/api/v1` — that's added by `src/services/api.ts`).
- **Auth header**: `Authorization: Bearer <token>` on all endpoints except the auth + web-pairing endpoints.
- **Response format**: return JSON directly — **no wrapper envelope**.
- **Errors**: return proper HTTP status codes; for pairing use structured `{ error: { code, message } }`. The frontend throws `ApiError(status, message)`.
- **Pagination**: not required — return full arrays.
- **Domain filtering**: `?domain=` is optional on tagged endpoints — return all data if absent. The frontend passes `vedic-math | gmat | cat | gre | banking`.
- **Loading/Empty/Error**: the frontend already handles all three states. Return `[]` / `null` gracefully.
- **CORS**: static web export needs CORS enabled on the API host.

### Auth flow (Firebase)
Frontend signs in with the **Firebase Client SDK** (`signInWithPopup` for Google, `signInWithPhoneNumber` for Phone), then sends the idToken to the backend, which verifies it via Firebase Admin SDK.

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| POST | `/api/v1/auth/google` | – | `{ idToken }` | `{ user: User, token, refreshToken }` |
| POST | `/api/v1/auth/phone` | – | `{ idToken }` | `{ user: User, token, refreshToken }` |
| POST | `/api/v1/auth/refresh` | – | `{ refreshToken }` | `{ token }` (auto-called on 401) |

Legacy (will be deprecated): `POST /api/v1/auth/login` `{ email, password }` → `{ user, token }`.

```ts
type User = { id: string; name: string; email: string; role: string };
```

> **Important**: these two Firebase auth endpoints (`/auth/google`, `/auth/phone`) must be built first — nothing else works in non-mock mode without them.

---

## 1. Invite / Referral (with affiliate code)

### Status
- Frontend has a **client-side mock**: generates a code locally (e.g. `ARENA-X7K2M9QD`) stored in `localStorage` (`exam-arena-referral`); tracks `invitesSent` / `friendsJoined` locally (cosmetic until wired).
- UI: `src/components/dashboard/invite-card.tsx` (reads `code`, `invitesSent`, `friendsJoined`; Copy button + Web Share / Capacitor share).

### API contract

| Endpoint | Method | Auth | Request | Response |
|---|---|---|---|---|
| `POST /api/v1/referral/code` | POST | Bearer | `{}` | `{ code: string }` — issue idempotently; return existing code if present |
| `GET /api/v1/referral/me` | GET | Bearer | — | `{ code, invitesSent, friendsJoined, xpEarned }` |
| `POST /api/v1/referral/redeem` | POST | Bearer (or pre-auth signup) | `{ code: string }` | `{ success, message? }` |
| `GET /api/v1/referral/notification` | GET | Bearer | — | `{ joined: boolean, friendName? }` — tells app a friend joined (grant XP + success UI) |

### Backend responsibilities
1. **Issue the code server-side** — do NOT trust the client-generated code. Normalize to `{PREFIX}-{XXXXXXX}`. Unique + idempotent per user.
2. **Attach referral on signup**: store `referredBy` on the referee's user record.
3. **Reward rules** (confirm values — frontend displays whatever you return): e.g. +50 XP referrer, +25 XP referee; defer award until referee finishes a meaningful action (onboarding / first sprint).
4. **Anti-abuse**: one redeem per referee (dedupe by email/phone/device id); optional daily cap; rate-limit redeem.

### Frontend integration
- `src/stores/referral-store.ts` — replace local generation/counters with `POST /referral/code` + `GET /referral/me`.
- `src/components/dashboard/invite-card.tsx`: headers above.

---

## 2. WhatsApp-style "Scan to login on web" (Pairing + Linked Devices)

### Status
**Fully implemented frontend** (mock + backend-ready). Three UIs:

- **Web** — `/auth` (`src/app/auth/page.tsx`): creates session on mount, renders QR + 8-char code, live ~2-min countdown, **polls every 2.5s** until `approved`, surface `pending` → `scanned` ("Device detected") → `expired`, then `setToken`/`setRefreshToken` → redirect `/dashboard`.
- **App** — `/dashboard/scan-to-login` (`src/app/dashboard/scan-to-login/page.tsx`): enter code → `scanned` (shows detected device) → confirm → `approved`. (Camera QR scanning is a future nicety; code entry is the primary input.)
- **Device management** — `/dashboard/settings/linked-devices` (`src/app/dashboard/settings/linked-devices/page.tsx`): list linked sessions, two-tap revoke (log out), and "Link a new device" → `/dashboard/scan-to-login`.

### How the mock works (until backend is live)
`src/services/pairing.ts` branches on `IS_MOCK`. Mock coordinator lives in `src/lib/mock/pairing.ts` (in-memory, shared by `/auth` + `/dashboard/scan-to-login` in one browser). Test locally: open `/auth` in one tab, `/dashboard/scan-to-login` in another, enter the code, tap Continue → Confirm login → `/auth` approves and logs in. Cross-device sharing is impossible in mock (client memory) — **backend replaces this**.

### API contract

| Endpoint | Method | Auth | Request | Response / Description |
|---|---|---|---|---|
| `POST /api/v1/pairing/session` | POST | none (web) | `{ scope?: string }` | `{ sessionId, code, status, expiresAt, createdAt }` |
| `GET /api/v1/pairing/session/:id` | GET | none (web) | — | `{ sessionId, code, status, expiresAt, createdAt }` — web polls ~2–3s |
| `POST /api/v1/pairing/session/:id/scan` | POST | Bearer (app) | `{ code }` | Marks `scanned`; **resolve session from code** server-side |
| `POST /api/v1/pairing/session/:id/approve` | POST | Bearer (app) | `{ code }` | Confirms; returns `{ token, refreshToken, sessionId }` — fresh web-bound tokens |
| `POST /api/v1/pairing/session/:id/revoke` | POST | Bearer (web/app) | `{}` | Logout from linked device |
| `GET /api/v1/pairing/sessions` | GET | Bearer | — | List active linked sessions (Linked Devices screen) |

Exact shapes (`src/lib/types/pairing.ts`):
```ts
type PairingStatus = "pending" | "scanned" | "approved" | "expired";
type PairingSession = { sessionId: string; code: string; status: PairingStatus; expiresAt: string; createdAt: string };
type PairingApproval = { token: string; refreshToken: string; sessionId: string };
```

Suggested model:
```
pairing_session { id uuid; code string(8, no 0/O/1/I); status enum; user_id uuid|null; device_name string; expires_at timestamp(~120s); created_at }
```

### Security
- **Short TTL** (~120s), one-time unguessable code.
- **Rate-limit** the status poll (web polls every 2.5s).
- On `approve`, issue a **fresh** token bound to the web session — never reuse the app's token.
- **Cap device sessions** per user (e.g. max 5); enforce on `scan`/`approve`.
- Code charset excludes ambiguous chars (0/O, 1/I); normalize to uppercase.
- QR content: `https://{host}/pair?code={code}` or deep link `examarena://pair?code=...`.

### Frontend integration (already wired)
- `src/services/pairing.ts` — `createPairingSession`, `pollPairingStatus`, `scanPairingCode`, `approvePairing`.
- `src/services/linked-devices.ts` — `getLinkedDevices` (GET `/pairing/sessions`), `revokeDevice` (POST `.../revoke`).
- `src/app/auth/page.tsx`, `src/app/dashboard/scan-to-login/page.tsx`, `src/stores/auth-store.ts` (`setToken`/`setRefreshToken`).

> **NOTE**: in the current mock, scan/approve are called with a placeholder `sessionId` (`dev-web-01`) because the mock resolves the real session from `code` internally. Production should resolve the session from `code` on `scan`/`approve`.

---

## 3. Dashboard

### API contract
```
GET /api/v1/dashboard/topics            ?domain=  → { name, value, color }[]
GET /api/v1/dashboard/radar                       → { label, value }[]
GET /api/v1/dashboard/metrics                     → { label, value, icon }[]
GET /api/v1/dashboard/stats            ?domain=   → { accuracy, questions, percentile, speed }
GET /api/v1/dashboard/streak                      → { current, xp, days: bool[], labels }
GET /api/v1/dashboard/events           ?domain=   → { title, time, tag }[]
GET /api/v1/dashboard/leaderboard                 → { rank, name, xp, me? }[]
GET /api/v1/dashboard/recent-activity  ?domain=   → { label, score, time }[]
```
Frontend: `src/services/dashboard.ts`, `src/hooks/queries/use-dashboard.ts`. Also renders the invite card (see §1).

---

## 4. Sprint

```
GET /api/v1/sprint/topics            ?domain=  → { id, label, icon, color }[]
GET /api/v1/sprint/config                       → { lengths: number[], difficulties: string[] }
GET /api/v1/sprint/session  ?topic=&length=&difficulty=&domain= → SprintSession
```
Frontend: `src/services/sprint.ts`, `src/services/sprint-session.ts`; states via `use-sprint.ts`, `use-sprint-session.ts`.

---

## 5. Practice (MCQ session, shared with Duel)

```
GET /api/v1/practice  ?topic=&length=&difficulty=  → SprintSession
```
Frontend: `src/services/practice.ts`, `use-practice.ts`.

---

## 6. Mock Exam

Mock papers are domain-keyed (`src/lib/mock/mock-exam.ts`). Runner at `/dashboard/mock/run?paper=<id>&domain=<exam>` returns a session using the same `SprintSession` shape.

```
GET /api/v1/mock-exam/papers?domain=&exam=   → MockPaper[]
GET /api/v1/mock-exam/session/:paperId?domain= → SprintSession
```
```ts
type MockPaper = {
  id: string; domain: string; title: string; shortLabel: string; description: string;
  sections: { id; label; topic; questions; minutes }[];
  totalQuestions: number; durationMinutes: number; difficulty: string; accent: string;
};
```
Frontend: `src/services/mock-exam.ts`, `use-mock-exam.ts`.

---

## 7. Flashcards

```
GET /api/v1/flashcards?domain=&topic=  → { front, back }[]
GET /api/v1/flashcards/topics?domain=  → string[]
```
Frontend: `src/services/flashcards.ts`, `use-flashcards.ts`.

---

## 8. Explorer / Subject Tree

```
GET /api/v1/subjects/tree            ?domain=       → TopicNode[] (recursive)
GET /api/v1/subjects/tree/:nodeId    ?domain=       → TopicNode | null
GET /api/v1/subjects/techniques      ?domain=       → TopicNode[] (leaf)
GET /api/v1/subjects/edges                         → TopicEdge[]
GET /api/v1/subjects/techniques/:techniqueId/prerequisites → TopicEdge[]
```
Frontend: `src/services/explorer.ts`, `use-explorer.ts`.

---

## 9. Techniques

```
GET /api/v1/techniques/:id                → Technique | null
GET /api/v1/techniques/?subject=          → Technique[]
GET /api/v1/techniques/                   → Technique[]  (note: `/api/techniques` in the service)
```
Frontend: `src/services/techniques.ts`, `use-technique.ts`.

---

## 10. Templates (Solve-Along)

```
GET /api/v1/templates/:id                        → SolveAlongTemplate | null
GET /api/v1/templates?domain=                    → SolveAlongTemplate[]
GET /api/v1/templates?category=&domain=          → SolveAlongTemplate[]
GET /api/v1/templates/categories?domain=         → string[]
POST /api/v1/template-sessions  body: { templateIds, mode } → TemplateSession
```
Frontend: `src/services/templates.ts`, `use-template-session.ts`, `use-technique.ts`. See README-BACKEND.md §"SolveAlongTemplate / TemplateSession / Technique" for full field shapes.

---

## 11. Duel

```
GET /api/v1/duel/topics?domain=     → { id, label }[]
GET /api/v1/duel/opponents          → { name, initials, level }[]
GET /api/v1/duel/result?correct=&total= → DuelResult
```
```ts
type DuelResult = {
  yourScore: number; opponentScore: number; yourAccuracy: number; opponentAccuracy: number;
  yourTime: number; opponentTime: number; won: boolean; xpEarned: number;
};
```
Frontend: `src/services/duel.ts`, `use-duel.ts`.

---

## 12. History & Reports

```
GET /api/v1/history?domain=              → HistoryEntry[]
GET /api/v1/history/filters?domain=      → { id, label }[]
GET /api/v1/reports/summary              → { totalSprints, totalXP, avgAccuracy, bestAccuracy, totalTime }
GET /api/v1/reports/topics               → { topic, label, sprints, accuracy, xp }[]
```
```ts
type HistoryEntry = {
  id: string; topic: string; topicLabel: string; difficulty: string;
  score: number; total: number; accuracy: number; xpEarned: number;
  totalTimeSpent: number; completedAt: string;
};
```
Frontend: `src/services/history.ts`, `use-history.ts`; `src/services/reports.ts`, `use-reports.ts`.

---

## 13. Analytics

```
GET /api/v1/analytics/stats    → { totalSessions, avgScore, bestStreak, arenaRank }
GET /api/v1/analytics/weekly   → { day, pct }[]
GET /api/v1/analytics/recent   → { title, sub, time }[]
```
Frontend: `src/services/analytics.ts`, `use-analytics.ts`.

---

## 14. Profile & Settings

```
GET /api/v1/profile                    → { initials, name, badge, level, streak }
GET /api/v1/profile/stats              → { label, value }[]
GET /api/v1/profile/achievements       → { icon, label, desc, unlocked }[]
GET /api/v1/settings                   → { pushNotifications, sessionReminders, restDuration, email }
GET /api/v1/settings/subscription      → { plan: "free"|"pro", price }
```
Frontend: `src/services/profile.ts`, `use-profile.ts`; `src/services/settings.ts`. Profile edit currently flows locally (`/dashboard/profile/edit`).

---

## 15. Social — Friends & Leaderboard

```
GET /api/v1/friends             → { id, name, initials, level, streak, lastActive, xp }[]
GET /api/v1/friends/activity    → { id, friendId, type: "sprint"|"achievement"|"duel", label, time }[]
GET /api/v1/friends/requests    → Friend[]
GET /api/v1/leaderboard         → { rank, name, xp, me? }[]
```
Frontend: `src/services/friends.ts`, `use-friends.ts`; `src/services/leaderboard.ts`, `use-leaderboard.ts`.

---

## 16. Notifications, Planner, Help, Achievements, Feed, Clubs

```
GET /api/v1/notifications   → { id, type: "sprint_reminder"|"achievement"|"challenge"|"system", title, message, time, read }[]
GET /api/v1/planner/days    → { date, dayLabel, planned, completed, isToday }[]
GET /api/v1/planner/stats   → { weekStreak, totalPlanned, totalCompleted, completionRate }
GET /api/v1/help/faq        → { id, question, answer }[]
GET /api/v1/help/app-info   → { version, platform, buildNumber }
GET /api/v1/achievements    → { id, icon, label, description, unlocked, progress?, tier, category, unlockedAt? }[]
```
Frontend service/hook pairs: `notifications.ts`/`use-notifications.ts`, `planner.ts`/`use-planner.ts`, `help.ts`/`use-help.ts`, `achievements.ts`/`use-achievements.ts`. (Feed + Clubs screens are currently pure frontend mock with no API-backed service — defer until the community feature is scoped.)

---

## 17. Content Feedback (Learn / Solve-Along)

```
POST /api/v1/content/feedback  body: ContentFeedback  → ContentFeedbackResponse
```
Frontend: `src/services/content-pipeline.ts` (used for helpful/unhelpful feedback on content).

---

## 18. Offline Sync

```
POST /api/v1/sync/:key   body: mutation.payload  → same payload back
```
Frontend offline store lives in `src/services/offline/`. Return the payload so the app can confirm the write.

---

## 19. App-Level Type Shapes (shared)

### SprintSession (used by Sprint, Practice, Duel, Mock Exam)
```ts
{
  id: string; domain?: string; topic: string; topicLabel: string; difficulty: string;
  questions: { id: string; text: string; options: string[]; correctIndex: number; timeLimit: number }[];
  totalTime: number;
}
```

### TopicNode
```ts
{ id: string; label: string; children?: TopicNode[]; techniques?: Technique[] }
```

### Technique
```ts
{
  id: string; subjectId: string; topicPath: string[];
  name: string;
  quickReference: { formula: string; keyIdea: string; shortcut: string; commonMistake: string };
  levels: Partial<Record<1 | 2 | 3 | 4 | 5, DifficultyLevel>>;
}
```

### SolveAlongTemplate & TemplateSession
See README-BACKEND.md §"SolveAlongTemplate / TemplateSession" — full field shapes (concept, difficulty, expected_time, visual_scaffold, examples, key_reminders, common_mistakes; and the session/progress model).

---

## 20. General Notes & Priority Order

### Notes
- **CORS**: static web export needs CORS for the web build host.
- **Error format**: structured `{ error: { code, message } }` with proper status codes; map to UI states (pairing: `expired`, `invalid`, `already_used`).
- **Auth header**: `Authorization: Bearer <token>`.
- **Storage**: persist `token`/`refreshToken` in localStorage (`exam-arena-auth`) / Capacitor Preferences; keep refresh-token rotation in mind.

### Suggested build order
1. **Auth (Firebase)** — `/auth/google`, `/auth/phone`, `/auth/refresh`. Blocks everything.
2. **Scan-to-Login Pairing** — `session`, `scan`, `approve`, `revoke`, `sessions`. Unblocks WhatsApp-style login + Linked Devices.
3. **Referral** — `code`, `me`, `redeem`. Unblocks the invite card.
4. **Core exam content** — Sprint, Practice, Mock Exam, Flashcards, Techniques, Templates, History/Reports.
5. **Social + misc** — Friends, Leaderboard, Duel, Analytics, Notifications, Planner, Help, Achievements, Content Feedback.

If you need the exact frontend request/response mocks or want to change any field names, tell us and we'll align the schemas.

# Exam Arena — API Contract

**Frontend repo:** `github.com/Udayraj-Sahu/ExamArena` (branch: `feature/renderer-runtime`)  
**Backend repo:** `github.com/Udayraj-Sahu/ExamArena-API-` (clone at `D:\ExamArena-API\`)

## Stack
- **Framework:** FastAPI (Python 3.12+)
- **ORM:** SQLModel (SQLAlchemy + Pydantic)
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Auth:** Firebase Admin SDK (Google + Phone)
- **Deployment:** Docker Compose

---

## Auth Flow

Frontend uses **Firebase Client SDK** (`firebase` npm package) for sign-in. Backend verifies idTokens via Firebase Admin SDK.

| Step | Google | Phone |
|------|--------|-------|
| Frontend | `signInWithPopup(auth, googleProvider)` | `signInWithPhoneNumber(auth, phone, recaptchaVerifier)` |
| Frontend | gets `UserCredential.user.getIdToken()` | gets `confirmationResult.confirm(otp)` → `getIdToken()` |
| Frontend sends | `POST /api/v1/auth/google` `{ idToken }` | `POST /api/v1/auth/phone` `{ idToken }` |
| Backend does | `auth.verify_id_token(idToken)` → upsert user → return JWT pair | same |

**Important:** The frontend currently has mock auth (`IS_MOCK=true`). These two auth endpoints must be built before `NEXT_PUBLIC_API_MOCK=false` can work.

### Auth Endpoints (Firebase — primary)

| Method | Path | Request | Response |
|--------|------|---------|----------|
| POST | `/api/v1/auth/google` | `{ idToken: string }` | `{ user: User, token: string, refreshToken: string }` |
| POST | `/api/v1/auth/phone` | `{ idToken: string }` | `{ user: User, token: string, refreshToken: string }` |

### Auth Endpoints (legacy, will be deprecated)

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| POST | `/api/v1/auth/login` | `{ email, password }` | `{ user, token }` | Used by mock flow; replace once Firebase is live |
| POST | `/api/v1/auth/refresh` | `{ refreshToken }` | `{ token }` | Auto-called by frontend on 401 |

### Token Refresh Flow
On 401 response, frontend automatically:
1. Calls `POST /api/v1/auth/refresh` with `{ refreshToken }`
2. On success → stores new token, retries original request
3. On failure → throws `ApiError(401, "Session expired")`

### User type
```ts
{
  id: string;
  name: string;
  email: string;
  role: string;
}
```

---

## API Conventions

- **Base URL:** All paths use the `/api/v1/` prefix.
- **Frontend config:** Set `NEXT_PUBLIC_API_URL=http://localhost:8000` (no trailing `/api/v1` — that's part of the path in `api.ts`).
- **Auth header:** `Authorization: Bearer <token>` on all endpoints except auth.
- **Response format:** Return JSON directly. No wrapper envelope.
- **Errors:** Return appropriate HTTP status codes. Frontend throws `ApiError(status, message)`.
- **Pagination:** Not required — return full arrays.
- **Domain filtering:** `?domain=` is optional on tagged endpoints — return all data if absent.

---

## Endpoints

### Dashboard
```
GET  /api/v1/dashboard/topics              ?domain=       → { name, value, color }[]
GET  /api/v1/dashboard/radar                              → { label, value }[]
GET  /api/v1/dashboard/metrics                            → { label, value, icon }[]
GET  /api/v1/dashboard/stats                ?domain=       → { accuracy, questions, percentile, speed }
GET  /api/v1/dashboard/streak                             → { current, xp, days: bool[], labels }
GET  /api/v1/dashboard/events               ?domain=       → { title, time, tag }[]
GET  /api/v1/dashboard/leaderboard                        → { rank, name, xp, me? }[]
GET  /api/v1/dashboard/recent-activity      ?domain=       → { label, score, time }[]
```

### Sprint
```
GET  /api/v1/sprint/topics                 ?domain=       → { id, label, icon, color }[]
GET  /api/v1/sprint/config                                → { lengths: number[], difficulties: string[] }
GET  /api/v1/sprint/session                ?topic=&length=&difficulty=&domain= → SprintSession
```

### Practice
```
GET  /api/v1/practice                      ?topic=&length=&difficulty=         → SprintSession
```

### Explorer / Subject Tree
```
GET  /api/v1/subjects/tree                 ?domain=       → TopicNode[] (recursive)
GET  /api/v1/subjects/tree/:nodeId         ?domain=       → TopicNode | null
GET  /api/v1/subjects/techniques           ?domain=       → TopicNode[] (leaf only)
```

### Techniques
```
GET  /api/v1/techniques/:id                               → Technique
GET  /api/v1/techniques                    ?subject=      → Technique[]
```

### Templates (Solve-Along)
```
GET  /api/v1/templates/:id                                → SolveAlongTemplate | null
GET  /api/v1/templates                     ?domain=       → SolveAlongTemplate[]
GET  /api/v1/templates                     ?category=&domain= → SolveAlongTemplate[]
GET  /api/v1/template-categories           ?domain=       → string[]
POST /api/v1/template-sessions             body: { templateIds, mode } → TemplateSession
```

### History & Reports
```
GET  /api/v1/history                       ?domain=       → HistoryEntry[]
GET  /api/v1/history/filters               ?domain=       → { id, label }[]
GET  /api/v1/reports/summary                              → { totalSprints, totalXP, avgAccuracy, bestAccuracy, totalTime }
GET  /api/v1/reports/topics                               → { topic, label, sprints, accuracy, xp }[]
```

### Profile & Settings
```
GET  /api/v1/profile                                     → { initials, name, badge, level, streak }
GET  /api/v1/profile/stats                               → { label, value }[]
GET  /api/v1/profile/achievements                        → { icon, label, desc, unlocked }[]
GET  /api/v1/settings                                    → { pushNotifications, sessionReminders, restDuration, email }
GET  /api/v1/settings/subscription                       → { plan: "free"|"pro", price }
```

### Social (Friends, Duel, Leaderboard)
```
GET  /api/v1/friends                                     → { id, name, initials, level, streak, lastActive, xp }[]
GET  /api/v1/friends/activity                            → { id, friendId, type, label, time }[]
GET  /api/v1/friends/requests                            → Friend[]
GET  /api/v1/duel/topics                  ?domain=       → { id, label }[]
GET  /api/v1/duel/opponents                              → { name, initials, level }[]
GET  /api/v1/duel/result                  ?correct=&total= → DuelResult
GET  /api/v1/leaderboard                                 → { rank, name, xp, me? }[]
```

### Misc
```
GET  /api/v1/analytics/stats                             → { totalSessions, avgScore, bestStreak, arenaRank }
GET  /api/v1/analytics/weekly                            → { day, pct }[]
GET  /api/v1/analytics/recent                            → { title, sub, time }[]
GET  /api/v1/achievements                                → { id, icon, label, description, unlocked, progress? }[]
GET  /api/v1/notifications                               → { id, type, title, message, time, read }[]
GET  /api/v1/planner/days                                → { date, dayLabel, planned, completed, isToday }[]
GET  /api/v1/planner/stats                               → { weekStreak, totalPlanned, totalCompleted, completionRate }
GET  /api/v1/flashcards                   ?domain=&topic= → { front, back }[]
GET  /api/v1/flashcards/topics            ?domain=       → string[]
GET  /api/v1/help/faq                                    → { id, question, answer }[]
GET  /api/v1/help/app-info                               → { version, platform, buildNumber }
```

### Offline Sync
```
POST /api/v1/sync/:key                   body: mutation.payload → same payload back
```

---

## Frontend States Each Page Handles
- **Loading** — spinner/skeleton while `useQuery` fetches
- **Empty** — "Nothing here yet" message when `data` is empty array/object
- **Error** — error message with Retry button
- **Success** — renders data

Backend should return `[]` or `null` gracefully — no special error shape needed.

---

## How Integration Works

1. Frontend has `NEXT_PUBLIC_API_MOCK` env var (default `"true"`)
2. Every service file branches:
   ```ts
   if (IS_MOCK) return mockData;
   else return apiGet<Type>("/api/v1/...");
   ```
3. To switch to real API: set `NEXT_PUBLIC_API_MOCK=false` and `NEXT_PUBLIC_API_URL=http://localhost:8000`
4. No frontend code changes needed — the switch is purely env var driven

---

## How to Test End-to-End

1. `docker-compose up` (PostgreSQL + Redis + FastAPI)
2. Seed database with mock data from `src/lib/mock/` (techniques, templates, topics, sprint sessions)
3. Set `NEXT_PUBLIC_API_MOCK=false` in frontend `.env.local`
4. Set `NEXT_PUBLIC_API_URL=http://localhost:8000`
5. Visit every dashboard page — each should load from the real API

---

## Appendix: Key TypeScript Shapes

### SprintSession
```ts
{
  id: string;
  domain?: string;
  topic: string;
  topicLabel: string;
  difficulty: string;
  questions: {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
    timeLimit: number;
  }[];
  totalTime: number;
}
```

### TopicNode
```ts
{
  id: string;
  label: string;
  children?: TopicNode[];
  techniques?: Technique[];
}
```

### Technique
```ts
{
  id: string;
  subjectId: string;
  topicPath: string[];
  name: string;
  quickReference: {
    formula: string;
    keyIdea: string;
    shortcut: string;
    commonMistake: string;
  };
  levels: Partial<Record<1 | 2 | 3 | 4 | 5, DifficultyLevel>>;
}
```

### SolveAlongTemplate
```ts
{
  id: string;
  domain: string;
  concept: { technique_name: string; category: string; sub_category?: string };
  difficulty: number;         // 1-5
  expected_time: number;      // seconds
  visual_scaffold: { type: string; config?: Record<string, unknown> };
  examples: {
    problem_statement: string;
    solution: { step_num: number; operation: string; explanation?: string; highlight?: string }[];
    answer?: string;
  }[];
  key_reminders?: string[];
  common_mistakes?: string[];
}
```

### DuelResult
```ts
{
  yourScore: number;
  opponentScore: number;
  yourAccuracy: number;
  opponentAccuracy: number;
  yourTime: number;
  opponentTime: number;
  won: boolean;
  xpEarned: number;
}
```

### HistoryEntry
```ts
{
  id: string;
  topic: string;
  topicLabel: string;
  difficulty: string;
  score: number;
  total: number;
  accuracy: number;
  xpEarned: number;
  totalTimeSpent: number;
  completedAt: string;
}
```

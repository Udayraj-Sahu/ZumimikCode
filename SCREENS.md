# Exam Arena — Screen Inventory

> **Legend:** ✅ Done | 🔧 High Priority | ⏳ Medium Priority | 🗓️ Low Priority | 🏗️ Backend

---

## ✅ Done (13 Pages)

| # | Route | Screen | Features |
|---|-------|--------|----------|
| 1 | `/` | Landing Page | Hero, features, coach, testimonials, CTA |
| 2 | `/onboarding` | Onboarding Flow | 4-step: welcome carousel → goal → level → done, auth panel/modal |
| 3 | `/dashboard` | Main Dashboard | Stats, streak, radar, topic mastery, recent activity, leaderboard widget |
| 4 | `/dashboard/configure-sprint` | Sprint Config | Topic/duration/difficulty selection |
| 5 | `/dashboard/sprint` | Sprint Quiz | Timed questions, options, feedback, progress dots |
| 6 | `/dashboard/sprint/results` | Sprint Results | Score badge, stat grid, topic bar, answer review, actions |
| 7 | `/dashboard/analytics` | Analytics | Session stats, weekly bar chart, recent activity list |
| 8 | `/dashboard/profile` | Profile | Avatar, stats grid, achievement cards |
| 9 | `/dashboard/settings` | Settings | Toggles, rest cycle, delete account modal |
| 10 | `/dashboard/leaderboard` | Leaderboard | 50-entry ranking, period filter, XP bars, rank summary |
| 11 | `/dashboard/achievements` | Achievements | 12-badge grid, progress bars, summary bar |
| 12 | `/dashboard/notifications` | Notifications | 4 types, all/unread filter, mark all read |
| 13 | `/dashboard/help` | Help & About | FAQ accordion, app info, contact, legal |

---

## 🔧 High Priority — Next Up

| # | Route | Screen | Features |
|---|-------|--------|----------|
| 14 | `/dashboard/history` | Sprint History | Filterable log of past sprints, paginated, tap to re-review |
| 15 | `/dashboard/practice` | Topic Practice | Untimed mode, topic picker, immediate feedback + explanations |
| 16 | `/dashboard/planner` | Study Planner | Weekly calendar, daily goals, planned vs completed tracking |
| 17 | `/dashboard/duel` | Live Duel | Head-to-head mock duel with simulated opponent, real-time progress |

---

## ⏳ Medium Priority

| # | Route | Screen | Features |
|---|-------|--------|----------|
| 18 | `/dashboard/questions` | Question Bank | Browse all questions by topic, bookmark, per-question stats |
| 19 | `/dashboard/flashcards` | Flashcards | Formula/concept cards per topic, swipe to review |
| 20 | `/dashboard/friends` | Friends | Add friends, compare stats, send challenge requests |
| 21 | `/dashboard/reports` | Reports | PDF export, date range filter, topic breakdown |

---

## 🗓️ Low Priority / Enhancements

| # | Feature | Notes |
|---|---------|-------|
| 22 | Light/Dark Theme Toggle | Currently dark-only, add theme switcher |
| 23 | Sound Effects / Haptics | Sprint timer, correct/wrong feedback |
| 24 | First-Run Walkthrough | Guided tour of dashboard features |
| 25 | i18n (Hindi + more) | Regional language support |
| 26 | Rate & Review Prompt | App store rating |

---

## 🏗️ Backend (all currently mock)

| Layer | Status |
|-------|--------|
| Express API (~30+ endpoints) | Not started |
| PostgreSQL (users, questions, results, leaderboard, etc.) | Not started |
| Redis (session cache, real-time scores) | Not started |
| Socket.IO (live duels, push notifications) | Not started |

---

## Navigation — Sidebar Sections

```
Main:     Dashboard
Training: Sprints, Analytics, Leaderboard,                                         History, Practice
Account:  Profile, Achievements, Settings
Social:   Duel, Friends
Support:  Notifications, Help & About
Planner:  Planner
Resources: Questions, Flashcards
Reports:  Reports
```

# EXAM ARENA — Adaptive Learning Flow — Full UI Specification

## Design Tokens (from codebase)

```
COLORS:
  Background:       #0A0C0A (near-black with green tint)
  Card Background:  rgba(255,255,255,0.04) with backdrop-blur-xl
  Card Border:      rgba(255,255,255,0.08)
  Primary Accent:   #C8FF4D (lime/neon green)
  Primary Dark:     #0A0C0A (text on primary)
  Chart Green:      #34D399
  Chart Cyan:       #22D3EE
  Chart Purple:     #A78BFA / #A855F7
  Chart Yellow:     #FBBF24
  Chart Pink:       #FB7185
  Chart Red:        #FF5C5C / #EF4444
  Muted Text:       rgba(255,255,255,0.45)
  Muted Faint:      rgba(255,255,255,0.25)
  Foreground:       #FFFFFF (text)
  Success:          #34D399
  Destructive:      #EF4444
  Info Blue:        #3B82F6

TYPOGRAPHY (fluid scale):
  micro:    clamp(9px, 1vw, 10px)  — uppercase labels, tracking 0.15-0.22em
  xs:       clamp(11px, 1vw, 12px) — tab labels, small text
  sm:       clamp(12px, 1.5vw, 14px) — body secondary
  base:     clamp(13px, 2vw, 15px) — body primary, inputs
  lg:       clamp(15px, 2.5vw, 20px) — step text, section titles
  xl:       clamp(18px, 3.5vw, 28px) — page headings
  2xl:      clamp(22px, 4.5vw, 34px) — hero headings

SPACING:
  Page padding:     20px (px-5)
  Card padding:     16-20px (p-4 to p-5)
  Card gap:         12-16px (gap-3 to gap-4)
  Card border-radius: 24px (rounded-3xl)
  Button border-radius: 16px (rounded-2xl)
  Pill border-radius:  9999px (rounded-full)
  Section spacing:  20px (mt-5)
  Sub-section:      12-16px (mt-3 to mt-4)

COMPONENTS:
  Glass Card:       bg rgba(255,255,255,0.04), border rgba(255,255,255,0.08), rounded-3xl, backdrop-blur-xl
  Primary Button:   bg #C8FF4D, text #0A0C0A, font-bold, uppercase, tracking-widest, rounded-2xl, min-h 44px
  Secondary Button: bg rgba(255,255,255,0.02), border rgba(255,255,255,0.06), rounded-2xl
  Pill/Chip:        bg rgba(255,255,255,0.04), border rgba(255,255,255,0.06), rounded-full, px-3 py-1.5
  Active Pill:      bg #C8FF4D, text #0A0C0A
  Section Label:    uppercase, 9-10px, tracking 0.15-0.18em, text-muted-foreground/40-50
  Progress Bar:     h-6px, rounded-full, bg rgba(255,255,255,0.05), fill gradient

ANIMATION:
  Page transitions: opacity 0->1, y 10->0, 280ms, ease [0.22,1,0.36,1]
  Card entrance:    opacity 0->1, y 12->0, 300ms, power2.out
  Step transitions: opacity 0->1, x +/-40->0, 300ms, power2.out
  Modal entrance:   opacity 0->1 overlay, opacity 0 y+32 scale 0.97->1 350ms power3.out
  Tabs:             y -2->0, scale 1.02->1, spring stiffness 260 damping 30
```

---

## SCREEN 1: Onboarding Modal — Step 0 (Name)

**Route**: `/` (shown as full-screen modal over dashboard)

**Layout**:
- Full-screen overlay: bg black/60, backdrop-blur-sm
- Panel: max-w-md (448px), max-h-[90vh], rounded-t-3xl (mobile) / rounded-3xl (desktop), bg rgba(14,17,13,0.98), border rgba(255,255,255,0.06)

**Header** (sticky top, bg rgba(14,17,13,0.98)):
- Row: X close button (left), 5 step indicator dots (right)
- Step dots: 6px circles, inactive bg-white/5, active ring-2 ring-C8FF4D/40 bg-C8FF4D/15, completed bg-C8FF4D/10 with check icon
- Progress bar: h-1, full width, bg-white/6, fill bg-C8FF4D, width = (step+1)/total * 100%

**Content**:
- Icon: 44px rounded-2xl, bg C8FF4D/10, User icon 20px C8FF5A
- Title: "What's your first name?" — 20px font-black tracking-[-0.03em]
- Subtitle: "So we can personalise your experience" — 13px text-muted-foreground/50
- Input: full-width, rounded-2xl, border-white/6, bg-white/3, px-4 py-4, 15px font-medium, placeholder "Type your name...", focus: border-C8FF4D/30 ring-C8FF4D/20
- Helper: "Hey {name}, nice to meet you!" — 12px muted-foreground/60, name in foreground/70 font-bold

**Footer** (sticky bottom):
- Row: Back button (left, 11px bold foreground/40), Next arrow (right)
- Next: 40px circle, bg C8FF4D when enabled, text 0A0C0A, ArrowRight icon 16px
- Disabled: bg-white/6, text-muted-foreground/20, cursor-not-allowed

**State: Validation**: Next enabled when name.trim().length > 0

---

## SCREEN 2: Onboarding Modal — Step 1 (Persona)

**Content**:
- Title: "What describes you?" — 20px font-black
- Subtitle: "Pick the one that fits best" — 13px muted

**Options** (6 cards, vertical stack, gap-2):
Each card: flex row, items-center, gap-3, rounded-2xl, border, px-3.5 py-3, active: border-C8FF4D/30 bg-C8FF4D/6

| # | Icon | Label | Desc | Color |
|---|------|-------|------|-------|
| 1 | GraduationCap | Student | Currently studying | #34D399 |
| 2 | Briefcase | Working Professional | Balancing work & prep | #22D3EE |
| 3 | Search | Job Seeker | Preparing for next role | #A78BFA |
| 4 | Heart | Parent | Guiding a child | #FB7185 |
| 5 | BookOpen | Educator | Teaching & mentoring | #FBBF24 |
| 6 | Plus | Other | Something else | #8B9086 |

Each card structure:
- Icon box: 36px rounded-xl, bg color/15 when active, bg-white/4 when inactive
- Label: 12px font-bold, foreground when active, foreground/60 when inactive
- Desc: 9px muted-foreground/60
- Active indicator: 16px circle bg-C8FF4D top-right, Check icon 8px #0A0C0A

---

## SCREEN 3: Onboarding Modal — Step 2 (Goal)

**Content**:
- Title: "What brings you here?" — 20px font-black
- Subtitle: "We'll tailor content to your goal" — 13px muted

**Options** (6 cards, same layout as Step 1):

| # | Icon | Label | Desc | Color | Target Exam |
|---|------|-------|------|-------|-------------|
| 1 | Target | Prepare for CAT | MBA entrance exam | #34D399 | "cat" |
| 2 | Calculator | Prepare for GMAT | Graduate management | #22D3EE | "gmat" |
| 3 | BookOpen | Prepare for GRE | Graduate record exam | #A78BFA | "gre" |
| 4 | Zap | Master speed math | Calculation skills | #FBBF24 | "vedic-math" |
| 5 | School | Help with school stuff | Academic support | #FB7185 | "" |
| 6 | Compass | Just exploring | Seeing what's here | #8B9086 | "" |

**State: Conditional Step**:
- If goal = "Prepare for CAT/GMAT/GRE" -> next step = Temporal Window (NEW Step 3)
- If goal = "Speed Math / School / Exploring" -> skip temporal, go to Triggers (Step 3/4)

---

## SCREEN 4: Onboarding Modal — Step 3 (NEW: Temporal Window)

**Only shown when goal is an exam prep (CAT/GMAT/GRE)**

**Content**:
- Title: "When is your exam?" — 20px font-black
- Subtitle: "This helps us plan your prep timeline" — 13px muted

**Options** (3 cards, same layout):

| # | Icon | Label | Desc | Color |
|---|------|-------|------|-------|
| 1 | Clock | Taking exam this year | We'll plan with a deadline | #34D399 |
| 2 | TrendingUp | Whenever I'm prepared | Focus on mastery, no rush | #A78BFA |
| 3 | Compass | Not sure yet | Flexible, balanced approach | #22D3EE |

**Store field**: `temporalWindow: "this_year" | "whenever" | "not_sure"`

---

## SCREEN 5: Onboarding Modal — Step 3/4 (Triggers)

**Title**: "Which describe you right now?" — 20px font-black
**Subtitle**: "Pick all that apply" — 13px muted

**Grouped chips** (3 groups, vertical stack, gap-3.5):

**Life Stage** (accent #C8FF4D):
- Final Year Student · Gap Year · Career Switch · Returning to Work

**Mindset** (accent #A855F7):
- Math Anxiety · Confidence Boost · Consistency · Competition Drive

**Parenting** (accent #22C55E):
- Helping My Child · Homeschool Support · School Project

Each chip: rounded-full, px-3 py-1.5, 10px font-bold
- Inactive: bg-white/4, border-white/6, text-muted-foreground/50
- Active: bg-C8FF4D, text-0A0C0A, Check icon 8px

**Validation**: Always passable (step is optional)

---

## SCREEN 6: Onboarding Modal — Step 4/5 (Details)

**Title**: "Personal Details" — 20px font-black
**Subtitle**: "Help us personalise your journey" — 13px muted

**Gender selector**: 2 buttons side-by-side
- Male / Female: flex-1, rounded-2xl, border, py-3.5, 13px font-bold
- Active: border-FF5C5C/30 bg-FF5C5C/10 text-FF5C5C
- Inactive: border-white/6 bg-white/3 text-foreground/60

**Date of Birth**: Scroll picker
- 3 columns: DD / MM / YYYY
- Each column: 108px tall, 3 visible items, 36px per item
- Active item: 15px font-bold foreground
- Inactive: 13px muted-foreground/30
- Scroll indicators: gradient masks top/bottom
- Selection highlight: rounded-xl border, bg-white/3

---

## SCREEN 7: Onboarding Completion Screen

**Shown after**: Last step's sparkle button clicked

**Layout**: Full modal height, centered content

**Elements**:
1. **Celebration Avatar**: 80px rounded-2xl, gradient bg (purple->cyan), animated sparkle particles (6 dots orbiting)
2. **Badge**: "Profile complete" pill — rounded-full, border-C8FF4D/20 bg-C8FF4D/8, Sparkles icon, text-C8FF4D
3. **Title**: "You're all set, {name}!" — 24px font-black, name in #C8FF4D
4. **Subtitle**: "Let's start your fight" — 12px muted-foreground/40
5. **Summary card**: rounded-2xl, border-white/5, horizontal row with:
   - PERSONA: {persona value} — 8px label, 13px value
   - GOAL: {goal value} — same

**Animation**: Staggered entrance (0.08s between elements), auto-dismiss after 2.3s

---

## SCREEN 8: Persona Hook Screen 1 — The Promise

**Context**: Shown after onboarding completion for exam-prep users (or first visit to Adaptive for "Just exploring")

**Layout**: Full screen (not modal), dark bg, centered content

**Elements** (top to bottom):
1. **Exam icon**: 64px rounded-2xl, exam-specific color glow
2. **Headline**: "{Exam} Adaptive Learning" — 28px font-black, exam color accent
3. **Promise text**: "Turn dead time into an advantage" — 16px font-medium, muted-foreground/70, max-w-[320px] mx-auto
4. **Feature cards** (3 small cards, horizontal scroll):
   - "Adaptive Drills" — icon + 12px label
   - "Weakness Detection" — icon + 12px label
   - "Daily Plans" — icon + 12px label
5. **Auto-advance indicator**: 3 dots, active = exam color, others = white/20
6. **Skip button**: top-right, 12px muted-foreground/40

**Animation**: gsap fromTo opacity 0->1, y 30->0, stagger 0.1s

---

## SCREEN 9: Persona Hook Screen 2 — The Mechanic

**Elements**:
1. **Animated mastery bars**: 4 horizontal bars filling up (gsap tween)
   - Fractions: 35% -> 72%
   - Decimals: 60% -> 85%
   - Algebra: 20% -> 55%
   - Geometry: 0% -> 30%
2. **Headline**: "The engine finds invisible cracks" — 22px font-black
3. **Body**: "It adjusts difficulty based on your performance in real-time" — 14px muted-foreground/60
4. **Auto-advance**: 3 dots (dot 2 active)

---

## SCREEN 10: Persona Hook Screen 3 — The Setup

**Elements**:
1. **Calendar icon**: 48px, primary accent
2. **Headline**: "Let's build your learning path" — 22px font-black
3. **Preview cards** (2 cards stacked):
   - "Daily Adaptive Plan" — icon + description
   - "Track Your Progress" — icon + description
4. **CTA button**: "Get Started" — full-width, bg-C8FF4D, text-0A0C0A, font-bold, rounded-2xl, min-h-48px
5. **Auto-advance**: 3 dots (dot 3 active)

**On CTA click**: Dismiss -> navigate to `/learn?mode=adaptive`

---

## SCREEN 11: Adaptive Re-prompt (3-Step Mini Config)

**Context**: Shown when user visits Adaptive tab with incomplete onboarding (`!adaptiveConfigured`)

**Layout**: Replaces the "Coming soon" placeholder inside the learn page's glass card

**Step 1 — Exam Selection**:
- Title: "Which exam are you preparing for?" — 18px font-bold
- 4 pill buttons (horizontal): CAT · GMAT · GRE · Speed Math
- Each: rounded-full, px-4 py-2, 12px font-bold
- Active: bg-C8FF4D text-0A0C0A
- Inactive: bg-white/4 border-white/6 text-muted-foreground/50

**Step 2 — Temporal Window**:
- Title: "When is your exam?" — 18px font-bold
- 3 options (vertical cards): same as Screen 4

**Step 3 — Ready**:
- Title: "You're all set!" — 18px font-bold
- CTA: "Start Learning" — bg-C8FF4D, full-width

**Progress**: 3 dots at top, step indicator

---

## SCREEN 12: Adaptive Learning Dashboard (Main Screen)

**Route**: `/learn?mode=adaptive`

**Layout**: Inside the learn page's glass card (rounded-3xl, border, bg gradient)

### Section 1: Header
- **Exam badge**: pill, border-[exam-color]/30 bg-[exam-color]/5, text-[exam-color]
  - "{Exam} · {Temporal Window label}"
- **Title**: "Your Learning Path" — 20px font-bold

### Section 2: Curriculum Progress (Circular Gauge)
- **Container**: rounded-3xl, glass card
- **Circular progress**: SVG circle, 120px diameter
  - Stroke: exam color, width 8px, rounded
  - Background stroke: white/8, width 8px
  - Center text: "{percent}%" — 28px font-black
  - Subtitle: "Curriculum Preparedness" — 10px uppercase tracking-wider muted-foreground/50
- **Stats row** (below gauge):
  - Topics Mastered: "{n}/{total}" — 13px
  - Daily Streak: "{n} days" — 13px
  - Time Spent: "{n}h" — 13px

### Section 3: Today's Plan
- **Section label**: "TODAY'S PLAN" — 9px uppercase tracking-0.18em muted-foreground/40
- **Cards** (horizontal scroll, 2-3 cards):
  Each card: min-w-[160px], rounded-2xl, border, p-4
  - Card 1 (Weak Topic): border-destructive/20 bg-destructive/5
    - Label: "WEAK TOPIC" — 8px uppercase
    - Topic name: 14px font-bold
    - Current mastery: "{n}%" — 12px muted
    - CTA: "Practice" pill button
  - Card 2 (Practice): border-primary/20 bg-primary/5
    - Label: "PRACTICE SET"
    - "{n} questions" — 14px font-bold
    - "Spaced review" — 12px muted
    - CTA: "Start" pill button
  - Card 3 (Mock, if recommended): border-chart-4/20 bg-chart-4/5
    - Label: "MOCK TEST"
    - "Full-length" — 14px font-bold
    - "Every 5 sessions" — 12px muted
    - CTA: "Take" pill button

### Section 4: Topic Mastery List
- **Section label**: "YOUR TOPICS" — 9px uppercase
- **List** (vertical, gap-2):
  Each row: flex items-center, gap-3, rounded-2xl, border, px-4 py-3
  - Topic icon: 32px rounded-lg, bg color/10
  - Topic name: 13px font-semibold
  - Mastery bar: flex-1, h-2, rounded-full, bg-white/5, fill gradient color->color
  - Mastery %: 13px font-bold, color-coded
  - Status badge (if pending): "NEW" — 8px uppercase pill

### Section 5: Start Button
- Full-width primary button: "Start Today's Practice" — bg-C8FF4D, text-0A0C0A, font-bold, rounded-2xl, min-h-48px
- Below: "Based on your weak areas and exam timeline" — 11px muted-foreground/40

---

## SCREEN 13: Resume Protocol Card

**Location**: Dashboard page, below streak card, above topic mastery

**Container**: rounded-3xl, glass card, border-l-4 border-primary

**Layout**:
- Row: Resume icon (16px primary) + "Resume Protocol" — 9px uppercase tracking-wider primary/70
- **Topic**: "{Topic} -> {Subtopic}" — 14px font-semibold
- **Progress**: "{completed}/{total} questions · {time} left" — 12px muted-foreground/60
- **Timestamp**: "Last session: {relative time}" — 11px muted-foreground/40
- **Buttons row**: "Continue" (primary pill) · "Dismiss" (text, 12px muted-foreground/40)

---

## SCREEN 14: Paywall Gate (Inline)

**Context**: Shown when free user tries to add extra prep in Adaptive or extra mock

**Container**: Same size as the content being gated, with overlay

**Elements**:
- **Lock icon**: 48px, muted-foreground/25, centered
- **Title**: "Unlock {Feature Name}" — 16px font-bold
- **Description**: "Upgrade to access {description}" — 13px muted-foreground/60
- **CTA button**: "Upgrade to Pro" — bg-C8FF4D, text-0A0C0A, rounded-2xl
- **Price**: "{price}/month" — 12px muted-foreground/40

---

## SCREEN 15: Pricing Screen

**Context**: Shown in onboarding after persona hooks, or when paywall is triggered

**Layout**: Full-screen modal (same as onboarding modal)

**Content**:
1. **Title**: "Choose Your Path" — 24px font-black
2. **Subtitle**: "Unlock your full learning potential" — 14px muted-foreground/50

3. **Plan Cards** (2 side-by-side, then full-width below):

   **Free Plan**:
   - Border: border-white/8
   - Header: "Free" — 18px font-bold
   - Price: "$0" — 28px font-black
   - Period: "/month" — 12px muted
   - Features (checkmark list):
     - Topic Browser access
     - 1 Adaptive prep
     - 1 Mock paper
     - Basic analytics
   - CTA: "Current Plan" — disabled, bg-white/6

   **Single Lane Pro**:
   - Border: border-primary/30, bg-primary/5
   - Badge: "POPULAR" — 8px uppercase pill, bg-primary
   - Header: "Single Lane Pro" — 18px font-bold
   - Price: "$9.99" — 28px font-black, primary color
   - Period: "/month" — 12px muted
   - Features:
     - Everything in Free
     - 3 Adaptive preps
     - Unlimited mocks
     - Advanced analytics
     - Priority support
   - CTA: "Upgrade" — bg-C8FF4D, full-width

   **Dual Lane** (full-width, below):
   - Border: border-chart-4/20, gradient bg
   - Header: "Full Multi-Lane Bundle" — 18px font-bold
   - Price: "$14.99" — 28px font-black
   - Period: "/month"
   - Features: Everything in Pro + unlimited preps + dual-track mode
   - CTA: "Get Bundle" — gradient button

---

## Navigation Flow Diagram

```
/ (unauthenticated)
  -> Auth Page (Google / Phone)
  -> /dashboard

/dashboard
  -> "Finish your profile" card (if !isOnboarded)
    -> OnboardingModal (Steps 0->1->2->[3:temporal]->3/4->4/5)
      -> Completion Screen (2.3s)
        -> Persona Hook Screens (3 screens, auto-advance)
          -> /learn?mode=adaptive

/learn?mode=adaptive
  -> If !adaptiveConfigured:
    -> Re-prompt (3 steps inline)
      -> /learn?mode=adaptive (now configured)
  -> If adaptiveConfigured:
    -> Adaptive Dashboard
      -> "Start Today's Practice" -> /play/sprint?topic={recommended}

/play/sprint
  -> Questions -> Results
    -> Mastery update (auto)
    -> /learn?mode=adaptive (refresh plan)

/dashboard (return visit)
  -> If activeSession exists:
    -> Resume Protocol card
      -> "Continue" -> /play/sprint?resume=true
      -> "Dismiss" -> clear session
```

---

## Responsive Behavior

**Mobile (< 640px)**:
- Modal: full-width, rounded-t-3xl (bottom sheet style)
- Cards: full-width, stacked vertically
- Hook screens: full-screen, centered
- Pricing: stacked vertically (Free -> Pro -> Dual Lane)
- Adaptive dashboard: single column, topic list full-width

**Desktop (>= 640px)**:
- Modal: max-w-md centered, rounded-3xl
- Cards: side-by-side where applicable
- Pricing: Free + Pro side-by-side, Dual Lane full-width below
- Adaptive dashboard: 2-column for plan cards

---

## State Summary Per Screen

| Screen | Loading | Empty | Error | Success |
|--------|---------|-------|-------|---------|
| Name | — | Input empty, next disabled | — | Helper text appears |
| Persona | — | No selection, next disabled | — | Check indicator |
| Goal | — | No selection, next disabled | — | Check indicator |
| Temporal | — | No selection, next disabled | — | Check indicator |
| Triggers | — | Always passable | — | Chip toggles |
| Details | — | Always passable | — | Gender + DOB selected |
| Hook Screens | — | — | — | Auto-advance 3s |
| Re-prompt | — | No selection | — | Step completion |
| Adaptive Dashboard | Skeleton pulse | "Add a prep to start" | "Something went wrong" | Full dashboard |
| Resume Card | — | Hidden (no session) | — | Session details shown |
| Pricing | Skeleton | — | "Failed to load plans" | Plan cards |
| Paywall Gate | — | — | — | Lock overlay + CTA |

---

## Figma Page Structure

Organize the Figma file as follows:

### Page 1: Onboarding Flow
- Frame 1.1: Step 0 — Name
- Frame 1.2: Step 1 — Persona
- Frame 1.3: Step 2 — Goal
- Frame 1.4: Step 3 — Temporal Window (conditional)
- Frame 1.5: Step 3/4 — Triggers
- Frame 1.6: Step 4/5 — Details
- Frame 1.7: Completion Screen

### Page 2: Persona Hook Screens
- Frame 2.1: The Promise
- Frame 2.2: The Mechanic
- Frame 2.3: The Setup

### Page 3: Adaptive Re-prompt
- Frame 3.1: Step 1 — Exam Selection
- Frame 3.2: Step 2 — Temporal
- Frame 3.3: Step 3 — Ready

### Page 4: Adaptive Dashboard
- Frame 4.1: Full dashboard (mobile)
- Frame 4.2: Full dashboard (desktop)
- Frame 4.3: Circular gauge detail
- Frame 4.4: Today's Plan cards
- Frame 4.5: Topic Mastery list

### Page 5: Resume Protocol
- Frame 5.1: Resume card (collapsed)
- Frame 5.2: Resume card with session details

### Page 6: Paywall & Pricing
- Frame 6.1: Paywall gate (inline)
- Frame 6.2: Pricing screen — Free/Pro/Dual Lane
- Frame 6.3: Pricing screen (mobile stacked)

### Page 7: States & Interactions
- Frame 7.1: Loading skeletons
- Frame 7.2: Empty states
- Frame 7.3: Error states
- Frame 7.4: Hover/active states for buttons
- Frame 7.5: Disabled states

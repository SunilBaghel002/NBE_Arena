# 10_ANALYTICS_AND_TRACKING.md
## NBE Arena — Advanced Dashboard Analytics & User Activity Tracking Specification

**Document Version:** 1.0.0  
**Target Environment:** Vercel (Next.js 14 App Router) + MongoDB Atlas (Mongoose ODM)  
**Security Level:** Admin Role Protected (`role: "admin"`) for Activity Auditing  

---

## 1. Executive Summary

As NBE Arena transitions from an internal preparation utility into a commercial, B2B white-label Computer-Based Test (CBT) platform demonstrated to Indian coaching institutes and candidate cohorts, two data pillars are mandatory:
1. **Advanced Candidate Diagnostic Analytics:** A sophisticated, 11-module performance diagnostic layer on `/dashboard` that visualizes score trajectory, sectional balance, negative marking penalty leakage, and time management.
2. **Per-User Session & Activity Auditing:** Full administrative tracking on `/admin/activity` to monitor login recency, frequency, device profiles, approximate locations, and session durations across the 5 controlled users (sisters, friend, founder, test user, demo bot) and prospective institute demo accounts.

---

## 2. `LoginSession` Schema Specification

The `LoginSession` collection persists in MongoDB Atlas via Mongoose ODM. It tracks every user interaction from initial credentials authentication until terminal sign-out or inactivity timeout.

### 2.1 Mongoose Schema Definition

```typescript
// src/models/LoginSession.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoginSession extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  loginAt: Date;
  logoutAt?: Date;
  sessionDurationSeconds: number;
  ipAddress?: string;
  userAgent?: string;
  device: "Desktop" | "Mobile" | "Tablet" | "Unknown";
  approxLocation?: string | null;
  pagesVisited: string[];
  lastActivityAt: Date;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LoginSessionSchema = new Schema<ILoginSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    username: { type: String, required: true, index: true },
    loginAt: { type: Date, default: Date.now, required: true },
    logoutAt: { type: Date },
    sessionDurationSeconds: { type: Number, default: 0 },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    device: {
      type: String,
      enum: ["Desktop", "Mobile", "Tablet", "Unknown"],
      default: "Desktop"
    },
    approxLocation: { type: String, default: null },
    pagesVisited: { type: [String], default: [] },
    lastActivityAt: { type: Date, default: Date.now, required: true, index: true },
    isClosed: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

// Compound index for fast per-user timeline querying
LoginSessionSchema.index({ userId: 1, loginAt: -1 });
LoginSessionSchema.index({ isClosed: 1, lastActivityAt: -1 });

export const LoginSession: Model<ILoginSession> =
  mongoose.models.LoginSession ||
  mongoose.model<ILoginSession>("LoginSession", LoginSessionSchema);
```

### 2.2 Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId | References `User._id`. |
| `username` | String | Cached username for fast querying without population. |
| `loginAt` | Date | Exact UTC timestamp of successful NextAuth sign in. |
| `logoutAt` | Date | Timestamp of explicit logout or computed closure. |
| `sessionDurationSeconds` | Number | Total active session length in seconds. |
| `ipAddress` | String | Best-effort client IP extracted from `x-forwarded-for` or request headers. |
| `userAgent` | String | Browser and operating system user agent string. |
| `device` | Enum | Normalized device category (`Desktop`, `Mobile`, `Tablet`). |
| `approxLocation` | String | City, Country string from IP lookup (or `null` if private/unknown). |
| `pagesVisited` | String[] | Unique route breadcrumbs (e.g. `["/dashboard", "/test/nbe-mock-1"]`). |
| `lastActivityAt` | Date | Timestamp refreshed every 60 seconds by client heartbeat ping. |
| `isClosed` | Boolean | Flag indicating whether the session is terminated. |

---

## 3. Session Lifecycle State Machine

```text
               Candidate Submits Credentials (/login)
                                 │
                                 ▼
                     [NextAuth signIn Callback]
                                 │
          ┌──────────────────────┴──────────────────────┐
          ▼                                             ▼
  [Credentials Valid]                         [Credentials Invalid]
  - Create new LoginSession doc               - Reject with 401
  - Parse Device & IP                         - No session created
  - Embed sessionId in JWT session
                                 │
                                 ▼
                    [Candidate Active in App]
                    Client Heartbeat Provider:
                    Fires POST /api/session/ping every 60s
                    Payload: { sessionId, currentPage }
                                 │
                                 ▼
                    [Update LoginSession Doc]
                    - lastActivityAt = now
                    - Add currentPage to pagesVisited
                    - sessionDurationSeconds = (now - loginAt)
                                 │
          ┌──────────────────────┴──────────────────────┐
          ▼                                             ▼
  [Explicit Logout]                             [Inactivity Window]
  - User clicks "Sign Out"                      - No ping received for > 30 mins
  - Calls POST /api/session/logout              - Next ping or admin sweep marks:
  - Sets logoutAt = now                           isClosed = true
  - isClosed = true                               logoutAt = lastActivityAt
  - sessionDurationSeconds =                      sessionDurationSeconds =
    (logoutAt - loginAt)                          (lastActivityAt - loginAt)
```

### 3.1 Heartbeat Specification (`/api/session/ping`)
- **Protocol:** HTTP POST, JSON payload `{ sessionId: string, currentPage: string }`.
- **Interval:** 60 seconds interval using `setInterval` inside a lightweight React client provider (`<SessionHeartbeat />`).
- **Debouncing:** Server verifies that at least 45 seconds have elapsed since `lastActivityAt` before executing a MongoDB write.
- **Payload Size:** $< 100\text{ bytes}$ to maintain zero noticeable network impact.

### 3.2 Inactivity Timeout Rule
A session is declared inactive if no heartbeat is received for **30 continuous minutes** (1,800 seconds). The effective logout time is back-calculated to the timestamp of the last confirmed heartbeat (`lastActivityAt`).

---

## 4. Privacy & Admin-Only Security Rules

1. **Strict Separation of Privilege:**
   - Only users with `role: "admin"` may access `/admin/activity` or invoke `/api/admin/activity`.
   - Candidate users requesting these endpoints are rejected with `HTTP 403 Forbidden`.
2. **Zero PII Exposure to Peers:**
   - Candidates can never see other candidates' login sessions, IP addresses, devices, or locations.
   - Student dashboard endpoints (`/api/attempts/user`) filter strictly by `session.user.id`.
3. **No Password or Credential Logging:**
   - Passwords, bearer tokens, and raw authorization secrets are never logged in any telemetry record.
4. **Coarse-Grained Geolocation:**
   - Geolocation is strictly approximate (City, Country level only based on IP block headers). Precise coordinates (GPS latitude/longitude) are never captured.

---

## 5. Advanced Student Dashboard Modules (A through K)

All analytics metrics on `/dashboard` are pre-computed on the server from the MongoDB Atlas `Attempt` and `Question` collections, then passed as props to client Recharts components.

| Module | Component Name | Data Source | Metric / Calculation | Visualization Choice |
|--------|----------------|-------------|----------------------|----------------------|
| **A. Enhanced KPI Row** | `<EnhancedKpiRow />` | `Attempt.find({ userId })` | - Total Mocks Completed<br>- Average Net Score<br>- Best Net Score<br>- Accuracy % (`correct / attempted`)<br>- Total Practice Hours<br>- Target Gap (`avgScore - 150`) | 6 KPI stat cards with icons, delta arrows, and hover elevation |
| **B. Score Trajectory** | `<ScoreTrajectoryChart />` | Chronological `Attempt.score.netScore` | Net score per attempt over time; horizontal 150 benchmark line; filter toggles: Last 5, Last 10, All | Recharts `LineChart` + `ReferenceLine` |
| **C. Sectional Mastery** | `<SectionalMasteryCharts />` | `Attempt.score.sections` | Sectional accuracy % and sectional marks out of 50 for: Reasoning, GA, Quant, English | Recharts `RadarChart` (balance) + Horizontal `BarChart` (scores) |
| **D. Strength & Weakness** | `<StrengthWeaknessPanel />` | Aggregate sectional accuracy | Top 2 sections (Strengths) and Bottom 2 sections (Weaknesses); sectional wrong-answer rate and skipped rate | Dual cards with color-coded progress bars & danger badges |
| **E. Time Analytics** | `<TimeAnalyticsChart />` | `Attempt.timeTakenSeconds` & sectional time | Average minutes spent per section; average seconds per question; overrun flag if section > 45m | Recharts `BarChart` with 45-min threshold guide line |
| **F. Negative Marking Leakage** | `<NegativeMarkingLeakageCard />` | `Attempt.score.wrongCount` | Total marks lost (`wrongCount * 0.25`); potential score if wild guesses avoided | Recharts `BarChart` (Stacked: Gained vs Lost vs Unattempted) |
| **G. Topic/Chapter Heatmap** | `<TopicHeatmap />` | `Question.topic` & `Attempt.answers` | Accuracy % per topic tag (e.g. Syllogisms, Cloze Test, Arithmetic). Gracefully hidden if tags missing | CSS Grid Heatmap with color saturation scale |
| **H. Improvement Trend** | `<ImprovementTrendBadge />` | Last 3 attempts vs prior 3 attempts | Delta between rolling 3-attempt average and preceding 3-attempt average | Pill Badge: `"Improving ↑"`, `"Plateau →"`, `"Declining ↓"` |
| **I. Countdown / Goal** | `<CountdownGoalWidget />` | User settings / Target config | Days remaining to official exam date; target qualifying mark setting | Interactive countdown card with inline date picker |
| **J. AI Strategic Audit** | `<MultiMockReportCard />` | Multi-attempt history via Groq LLM | Synthesized strategic diagnostic report comparing multiple attempts | Prominent AI mentor card with trigger button & modal report |
| **K. Recent Attempts Table** | `<RecentAttemptsTable />` | Latest 10 `Attempt` records | Mock ID, completion date, net score, accuracy, time taken, "View Scorecard" link | Zebra-striped data table with hover states and sticky header |
| **Empty State** | `<DashboardEmptyState />` | Rendered when `attempts.length === 0` | Onboarding welcome card guiding candidate to take their first mock | Illustrated card with call-to-action button |

---

## 6. Chart Type Choices & Visual Design Rationale

### 6.1 Trajectory: `LineChart` with `ReferenceLine`
- **Why:** Score progression is inherently chronological. A continuous line chart allows candidates to see momentum, dips, and recovery at a glance.
- **Reference Line:** An amber dashed line at $y = 150$ immediately communicates the qualifying threshold.
- **Toggles:** Client buttons for Last 5, Last 10, All adjust the data slice without triggering server re-fetches.

### 6.2 Sectional Mastery: `RadarChart` + Horizontal `BarChart`
- **Why Radar:** NBE Junior Assistant requires balanced competency across all 4 sections. A radar chart visualizes shape asymmetry instantly (e.g., strong Quant but collapsed General Awareness).
- **Why Horizontal Bar:** Provides exact numeric precision for raw marks (out of 50) and displays best/weakest color highlights.

### 6.3 Negative Marking Leakage: Stacked `BarChart`
- **Why:** Negative marking is the primary reason candidates fail Indian competitive exams. Showing marks earned (Green) directly adjacent to marks destroyed by penalties (Red) provides visceral behavioral motivation to eliminate wild guessing.

### 6.4 Shared Categorical Palette
All Recharts instances use CSS variables mapped to Tailwind design tokens:
- **Reasoning:** `#2563EB` (Blue)
- **General Awareness:** `#059669` (Green)
- **Quantitative Aptitude:** `#D97706` (Amber)
- **English Comprehension:** `#7C3AED` (Violet)
- **Penalty / Leakage:** `#DC2626` (Crimson)
- **Benchmark Target:** `#0D9488` (Teal)

# Data Models — WHO sees WHAT and WHY

This folder contains the app-wide personalization system that drives the entire mobile experience. These models determine which widgets a user sees, which quick actions appear, and which apps are available — all based on the user's persona and their company's purchased SKUs.

---

## Personas (`personas.ts`)

7 personas derived from 3 properties: employment type, manager status, and admin level.

| Persona | Employment | Manager | Admin | Owner |
|---------|-----------|---------|-------|-------|
| **Hourly Operator** | Hourly | No | None | — |
| **Employee Self-Service** | Salaried | No | None | — |
| **Frontline Shift Manager** | Hourly | Yes | None | — |
| **People Manager** | Salaried | Yes | None | — |
| **Functional Admin** | Salaried | No | Partial | — |
| **Executive / Owner** | Salaried | Yes | Full | Yes |
| **Contractor** | Contractor | No | None | — |

### How Personas Are Derived

In production, a persona is computed from the user's employee record properties (employment type, has direct reports, admin permissions, company owner flag). This prototype lets you switch personas manually via the HUD panel to see how the home experience adapts.

---

## Zone Maps (in `personas.ts`)

Each persona has a **zone map** defining which widgets appear in each zone. Zones are ordered by importance:

| Zone | Purpose | Position |
|------|---------|----------|
| **Primary** | Most important widget for this persona | Top of screen |
| **Core** | Always-present functionality | Below primary |
| **Contextual** | Role-dependent extras | Below core |
| **Discovery** | App list, inbox preview | Bottom |

### Persona → Zone Map Matrix

| Persona | Primary | Core | Contextual | Discovery |
|---------|---------|------|------------|-----------|
| Hourly Operator | Shift Clock | Shortcuts | Earnings | Apps, Inbox |
| Employee Self-Service | Inbox | Shortcuts | Earnings | Apps |
| Frontline Shift Manager | Shift Clock | Shortcuts | Team Status, Earnings | Apps, Inbox |
| People Manager | Inbox | Shortcuts | Team Status, Earnings | Apps |
| Functional Admin | Admin Insights | Shortcuts | Inbox | Apps |
| Executive / Owner | Admin Insights | Shortcuts | Inbox | Apps |
| Contractor | Earnings | Shortcuts | Inbox | Apps |

**Key insight:** The Shift Clock widget only appears for hourly personas (Hourly Operator, Frontline Shift Manager). The Earnings widget adapts its content per persona — hourly workers see next paycheck + overtime, salaried see tax breakdown, contractors see pending invoices.

---

## Quick Actions (`quick-actions.ts`)

The quick actions system determines which shortcuts appear in the Shortcuts widget and the full shortcuts sheet.

### Ranking Algorithm (in plain English)

1. **Start with persona ranking** — each persona has an ordered list of preferred actions (e.g., Hourly Operator prefers: Request Time Off → Edit Availability → View Timesheet → Shift Swaps)
2. **If onboarding**, boost actions flagged `onboardingPriority` to the top (e.g., View My Benefits, View Documents, Update Bank Account)
3. **Append global fallback** — actions not in the persona ranking but still available get added in a global priority order
4. **Filter by SKU** — any action whose `requiredSkus` aren't all enabled is removed
5. **Filter by role** — actions marked `managerOnly` are hidden from non-manager personas
6. **Truncate** — the home widget shows the top 4; the full sheet shows all available

### Manager vs Self-Service

The primary distinction is manager vs non-manager:
- **Manager personas** (Frontline Shift Manager, People Manager, Functional Admin, Executive/Owner) see actions like Review Timesheets, PTO Approvals, Assign Shifts, Expense Approvals
- **Self-service personas** (Hourly Operator, Employee Self-Service, Contractor) see personal actions like Request Time Off, Submit Expense, View PTO Balances

### Action Registry

Every action in the system is defined in `ACTION_REGISTRY` with:
- `id` — unique identifier
- `label` — display text
- `route` — native app deep link path
- `product` — which product it belongs to (Time, Payroll, Benefits, Spend, HR, Travel)
- `requiredSkus` — which SKUs must be enabled (empty = always available)
- `onboardingPriority` — boosted during onboarding (optional)
- `managerOnly` — only shown to manager personas (optional)

---

## Apps & SKU Gating (`apps.ts`)

The apps model defines the full catalog of purchasable apps and their default enablement per persona.

### App Groups
- **HR**: People Directory, Chat, Time Off, Time & Attendance, Scheduling, Time (Standalone), Learn, Surveys, My Benefits, News Feed
- **Finance**: My Pay, Spend Management, Travel
- **IT**: Passwords

### How SKU Gating Works

1. Each persona has a default set of enabled SKUs (defined in `PERSONA_DEFAULT_SKUS`)
2. Enabled apps are mapped to SKU flags via `widget-helpers.ts` → `enabledAppsToSkuFlags()`
3. Quick actions are filtered: if an action requires SKU `time_off` and it's not enabled, the action is hidden
4. The Earnings widget is gated on the `my_pay` SKU (or overridden for managers who always see it)
5. The Chat tab in bottom navigation is gated on the `chat` SKU

### Toggling SKUs

In the prototype, you can toggle individual SKUs via the "Purchased SKU(s)" section in the User Intent HUD panel. This lets you simulate different company configurations (e.g., "What does Home look like for a company that only has Time & Payroll?").

---

## Shared Types (`types.ts`)

Core type definitions used across the entire app:

- `PersonaId` — union of all 7 persona identifiers
- `ZoneMapping` — shape of a persona's widget zone configuration
- `AppItem` — shape of an app in the catalog
- `SheetDetent` — bottom sheet size states (small, medium, large)
- `ActivityTab` — activity feed filter tabs

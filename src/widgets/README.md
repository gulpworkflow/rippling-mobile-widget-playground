# Widgets — The Widget Framework

Widgets are the primary building block of the mobile Home experience. This folder contains both the **framework** (reusable infrastructure) and the **implementations** (specific widgets).

---

## Widget Archetypes

Every widget must fit one of 4 system-defined types from the [Widget Design Contract](../../.cursor/rules/widget-design-contract.mdc):

| Archetype | Purpose | Structure | Example |
|-----------|---------|-----------|---------|
| **Action** | Immediate execution | Large title, single primary CTA, minimal context | Clock in, Submit timesheet |
| **Queue** | Show count + enable triage | Aggregated count, short descriptor, tap → filtered list | 3 approvals pending |
| **Status** | Passive awareness | Primary metric, supporting label, entire card tappable | This pay period: 42 hours |
| **List Preview** | Lightweight feed | Max 3 rows, no nested interactions, tap → full view | Upcoming shifts |

---

## Implementation Mapping

| Widget File | Archetype | What It Shows |
|-------------|-----------|---------------|
| `ShiftClockWidget.tsx` | Action | Today's shift time, location, teammates, breaks, position. Footer: "My schedule" + "Clock in" buttons. |
| `InboxWidget.tsx` | Queue | Pending tasks (training, surveys) with due dates. Footer: "Manage tasks" button. |
| `EarningsWidget.tsx` | Status | Pay summary with segmented bar. Adapts per persona: hourly (regular + overtime), salaried (taxes + deductions), contractor (pending + paid). |
| `ShortcutsWidget.tsx` | — (special) | Grid of 4 quick action icons. Not a card archetype — it's the persona's top-ranked actions rendered as a tappable grid. |
| `ShortcutsSheet.tsx` | — (overlay) | Full shortcuts modal. Expands from the shortcuts widget. Shows favorites, then all available actions grouped by product with search. |
| `DiscoveryAppList.tsx` | List Preview | Grouped list of enabled apps (HR, Finance, IT) with icons and labels. Not a card — renders directly in the discovery zone. |

---

## Framework (`framework/`)

### `WidgetCard.tsx` — The Base Primitive

Every card-style widget uses `WidgetCard` as its container. It provides:
- **Header**: Title (with optional chevron for navigation), meta slot (right side)
- **Body**: Content area where widget-specific content renders
- **Footer**: Action buttons (primary/secondary variants)

Props are defined in `framework/types.ts`:
- `title` — widget header text
- `actions` — array of `{ label, variant, onClick }` for footer buttons
- `surfaceVariant` / `outlineVariant` / `primaryColor` — theme-driven color overrides
- `onTitleClick` — makes the title a tappable button with a chevron

### `widget-helpers.ts` — Title & Action Logic

- `widgetIdToTitle()` — maps widget IDs to display titles, with persona-specific overrides (e.g., "Inbox queue" becomes "Priority tasks" for Employee Self-Service)
- `WIDGET_ACTIONS` — maps widget IDs to their footer button configurations
- `enabledAppsToSkuFlags()` — converts a set of enabled app IDs into SKU flags for quick action filtering

### `types.ts` — Widget Type Definitions

- `WidgetAction` — shape of a footer button (`{ label, variant?, onClick? }`)
- `WidgetCardProps` — full props interface for WidgetCard

---

## How to Add a New Widget

1. **Choose an archetype** from the design contract (Action, Queue, Status, or List Preview)
2. **Create the content component** — e.g., `src/widgets/TeamStatusWidget.tsx`
   - It receives data via props or hooks
   - It renders just the content — no card chrome
3. **Register in the zone map** — add the widget ID to the appropriate zone(s) in `data-models/personas.ts` → `PERSONA_ZONE_MAP`
4. **Add title mapping** — add the widget ID to `WIDGET_LABEL_OVERRIDES` in `widgets/framework/widget-helpers.ts`
5. **Wire into HomeScreen** — add a case for the new widget ID in the `renderWidgetContent()` function in `screens/HomeScreen.tsx`
6. **Optional: Add footer actions** — add to `WIDGET_ACTIONS` in `widget-helpers.ts`

The `WidgetCard` container handles all chrome (header, border, footer buttons). Your widget just provides the content.

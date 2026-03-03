# Quick Actions Framework: Engineering Brief

## Context

Quick Actions are the primary shortcut system on mobile Home. They give users fast access to their most relevant tasks without navigating through product apps.

Like the Widget Framework, Quick Actions has two layers:

1. **Quick Action Registry + Rendering** (framework) — product teams register actions, the system renders them
2. **Adaptive Ranking** (core home) — resolves which actions to surface based on role, product bundle, and context

This brief covers **layer 1 only**. Engineering can build the full registration, rendering, and navigation pipeline without the adaptive ranking layer. Use hardcoded action lists for development.

## The contract between layers

The adaptive layer produces an **ordered array of quick action descriptors**:

```typescript
type QuickActionDescriptor = {
  id: string;
  label: string;
  icon: string;         // icon identifier
  destination: string;  // deep link / route
};

// Adaptive layer output (not in scope):
// actionsToShow: QuickActionDescriptor[]
```

The framework renders whatever it's given, in order. It doesn't know why an action is in the list.

## What to build

### 1. Quick Action registration

Product teams register their available quick actions. Registration is declarative — teams say "this action exists" and provide metadata. They don't control where or when it appears (that's the adaptive layer's job).

```typescript
registerQuickAction({
  id: 'request_time_off',
  label: 'Request Time Off',
  icon: 'unlimited_pto_outline',
  destination: 'pto/PtoRequest',
  product: 'Time',               // owning product (for grouping in "all shortcuts")
  requiredSkus: ['time_off'],     // SKUs that must be active for this action to be available
});
```

**Registration metadata:**

| Field | Type | Purpose |
|-------|------|---------|
| id | string | Stable identifier, snake_case |
| label | string | Display text (sentence case, active voice) |
| icon | string | Pebble icon identifier (outline variant) |
| destination | string | Deep link route |
| product | string | Owning product name (grouping key) |
| requiredSkus | string[] | SKUs that must all be enabled. Empty = always available |

**What registration does NOT include:**

- Priority or ranking (that's the adaptive layer)
- Persona restrictions (adaptive layer)
- Visibility logic (adaptive layer)
- UI layout preferences (framework decides)

Product teams register all their actions. The adaptive layer decides which ones to show.

### 2. Quick Action renderer

A component that takes an ordered array and renders action items:

```typescript
<QuickActionGrid actions={actionsToShow} onActionTap={handleTap} />
```

**Rendering contract:**

- Takes an ordered array of action descriptors
- Renders each as: icon (in rounded square container) + label below
- Handles tap → navigates to destination
- Does NOT decide how many to show (the consumer passes a sliced array)
- Does NOT decide which actions to show (adaptive layer's job)

**Visual spec (from prototype):**

- Icon container: 32x32px, 8px border radius, `colorSurfaceDim` background
- Icon: outline variant, `colorOnSurface`, 20px
- Label: `typestyleV2BodyMedium`, `colorOnSurface`, centered, no letter-spacing, 19px line-height
- Grid gap: 18px
- Items flex equally across available width

### 3. "All shortcuts" sheet

A bottom sheet (using the shared BaseSheet primitive from the Widget Framework) that shows the complete list of available actions, grouped by product.

**Structure:**

```
┌──────────────────────────────────┐
│  X    All shortcuts              │  ← BaseSheet header
├──────────────────────────────────┤
│  ┌ Favorites ──────── Edit ─┐   │  ← Top widget: current featured actions
│  │ [.] [.] [.] [.]         │   │
│  └──────────────────────────┘   │
│                                  │
│  Time >                          │  ← Product group (horizontally scrollable)
│  [.] [.] [.] [.] [.]           │
│                                  │
│  Spend >                         │
│  [.] [.] [.]                    │
│                                  │
│  ...                             │
├──────────────────────────────────┤
│  🔍 Search shortcuts    ✨       │  ← Sticky footer: search + AI
└──────────────────────────────────┘
```

**Key behaviors:**

- Groups derived from action registry `product` field
- Each group is a horizontally scrollable row
- Group header is tappable (future: navigates to that product's app)
- Search filters across all actions by label
- "Favorites" section at top shows the currently featured actions
- Already prototyped — needs production hardening

### 4. Navigation integration

When a quick action is tapped, the framework navigates to its destination:

```typescript
const handleActionTap = (action: QuickActionDescriptor) => {
  navigation.navigate(action.destination);
};
```

This is simple deep linking. The framework doesn't need to understand what's at the destination — it just sends the user there.

**One exception:** Some actions may trigger in-app overlays instead of navigation (e.g. "Scan Receipt" opens the camera). Support a `destinationType` field for this:

```typescript
type DestinationType = 'navigate' | 'modal' | 'camera';
```

Default is `navigate`. Product teams specify if their action needs special handling.

### 5. SKU gating (framework-level)

The framework handles one piece of filtering that's structural, not adaptive: **SKU availability**. If a required SKU isn't active for this customer, the action shouldn't appear anywhere — not in featured actions, not in the "all shortcuts" sheet, nowhere.

```typescript
function getAvailableActions(
  registeredActions: QuickAction[],
  activeSkus: Set<string>
): QuickAction[] {
  return registeredActions.filter(action =>
    action.requiredSkus.every(sku => activeSkus.has(sku))
  );
}
```

This is a hard gate, not a ranking preference. It belongs in the framework, not the adaptive layer.

## What NOT to build

| Don't build | Why |
|-------------|-----|
| Persona-based ranking | Adaptive layer (layer 2) |
| "Which 4 actions to feature" logic | Adaptive layer |
| Manager vs. employee filtering | Adaptive layer |
| Onboarding priority boosting | Adaptive layer |
| User customization (favorites editing) | Future feature, not v1 framework |
| Usage analytics-based reranking | Future optimization |

## Existing prototype reference

The prototype (`src/data-models/quick-actions.ts`) demonstrates:

- **ACTION_REGISTRY**: 30+ registered actions with full metadata — use as seed data
- **SKU gating**: `requiredSkus` filtering works end-to-end
- **Persona rankings**: hardcoded ordered lists per persona (this is the adaptive layer mock)
- **Resolution function**: `getQuickActions()` merges persona ranking + global fallback + SKU filtering into a final ordered list
- **UI rendering**: `ShortcutsWidget.tsx` renders a grid, `ShortcutsSheet.tsx` renders the "all shortcuts" sheet with product grouping, search, and favorites

The adaptive layer logic (persona rankings, manager filtering, onboarding priority) is mixed into the prototype for demo purposes. In production, separate it: the framework owns registration + rendering + SKU gating. The adaptive layer owns ranking.

## Testing strategy

Use a hardcoded array of 8-10 actions spanning 3 products to validate:

```typescript
const DEV_ACTIONS: QuickActionDescriptor[] = [
  { id: 'request_time_off', label: 'Request Time Off', icon: 'pto_outline', destination: 'pto/PtoRequest' },
  { id: 'submit_expense', label: 'Submit Expense', icon: 'receipt_outline', destination: 'spend/ManualExpense' },
  { id: 'view_paystubs', label: 'View Paystubs', icon: 'document_outline', destination: 'payroll/PaystubList' },
  // ...
];
```

Validate:
- Grid renders correctly with 2, 3, 4, 5, 6 actions
- "All shortcuts" sheet groups by product correctly
- Search filtering works
- Tap navigates to correct destination
- SKU gating removes actions when SKUs are toggled off

## Definition of done

- [ ] Product teams can register a quick action with a single function call
- [ ] QuickActionGrid renders an ordered array correctly at any count
- [ ] "All shortcuts" sheet displays grouped actions with search
- [ ] SKU gating filters unavailable actions everywhere
- [ ] Tap → navigation works for all destination types
- [ ] No adaptive/persona logic in the framework layer
- [ ] Storybook stories for grid (various counts) + sheet
- [ ] Accessibility: all actions have tap targets >= 44pt, labels exposed to screen readers

## Open questions for eng

1. Should quick action registration happen at app startup (eager) or lazily when a product module loads? Eager is simpler; lazy reduces startup cost for large product suites.
2. Do we need icon assets bundled with the framework, or do product teams provide their own icon references? (Prototype uses Pebble icon constants.)
3. Should the "all shortcuts" sheet be a framework primitive or a consumer-level composition of BaseSheet + QuickActionGrid? Keeping it in the framework ensures consistency; keeping it outside gives teams flexibility.
4. How do we handle quick actions for products that aren't installed yet? (Cross-sell opportunity — show a locked/disabled state with "Add Time & Attendance" upsell?)

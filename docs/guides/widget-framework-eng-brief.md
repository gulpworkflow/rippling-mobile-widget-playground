# Widget Framework: Engineering Brief

## Context

We're building two layers for the new mobile Home experience:

1. **Widget Framework** (design system) — shared primitives any product team can build into
2. **Adaptive Home** (core home) — resolves user role, intent, and product bundle to decide which widgets to show

These two layers are **independent**. This brief covers **layer 1 only**. Engineering can start immediately without blocking on persona modeling, widget selection logic, or product-specific widget implementations.

## The contract between layers

The adaptive layer's only job is to produce an **ordered array of widget descriptors**:

```typescript
type WidgetDescriptor = {
  id: string;                    // stable identifier, e.g. 'shift_clock'
  type: WidgetType;              // 'action' | 'queue' | 'status' | 'list_preview'
  component: string;             // registered component key
  props?: Record<string, any>;   // data passed to the widget component
};

// Adaptive layer output (not in scope for this work):
// widgetsToRender: WidgetDescriptor[]
```

The framework doesn't care *why* a widget is in the list. It just renders what it's given, in order. For development and testing, use a hardcoded array.

## What to build

### 1. WidgetCard base component

A single shared card primitive that all widgets render inside. This is the most important deliverable — it enforces visual consistency across every product team's widgets.

**Structure:**

```
┌─────────────────────────────────┐
│ [Title >]              [Meta]   │  ← Header row
├─────────────────────────────────┤
│                                 │
│         Body (children)         │  ← Flexible content slot
│                                 │
├─────────────────────────────────┤
│ [Secondary]         [Primary]   │  ← Footer (0, 1, or 2 actions)
└─────────────────────────────────┘
```

**Props:**

| Prop | Type | Required | Notes |
|------|------|----------|-------|
| title | string | yes | Left-aligned header text |
| onTitleClick | () => void | no | If set, renders chevron right and makes title tappable |
| meta | ReactNode | no | Right side of header (e.g. timestamp, badge) |
| actions | WidgetAction[] | no | Footer buttons, 0-2 items. Each has label + variant (primary/secondary) |
| children | ReactNode | yes | Body content — each widget type fills this differently |

**Visual spec (from prototype):**

- Background: `colorSurfaceBright` token
- Border: 1px `colorOutlineVariant`
- Border radius: 16px
- Padding: 12px
- Header title: `typestyleV2BodyMedium`, `colorOnSurfaceVariant`, no letter-spacing
- Footer actions: full-width buttons, primary uses `colorPrimaryContainer`
- No drop shadow

**Key constraint:** WidgetCard owns the chrome. Product teams only control what goes in the body slot and which footer actions to show. They cannot customize the header, card shape, or spacing. This is what keeps Home visually coherent.

### 2. Widget type templates

Four pre-built body layouts that cover the widget design contract. Product teams pick a type and fill in data — they don't build custom layouts.

**Action Widget** (primary task execution)
- Large title (dynamic)
- Single primary CTA
- Minimal supporting context
- Example: "Clock in", "Submit timesheet"

**Queue Widget** (task aggregator)
- Aggregated count (visually dominant)
- Short descriptor
- Tap → filtered task list
- Example: "3 approvals pending"

**Status Widget** (passive monitoring)
- Primary metric
- Supporting label
- Optional secondary stat
- Entire card tappable
- Example: "42 hours this period"

**List Preview Widget** (lightweight feed)
- Max 3 rows
- No nested interactions
- Tap → full screen view
- Not scrollable inside widget
- Example: "Upcoming shifts (next 2)"

These types enforce the design contract's rules (single emphasis, density constraints, clear affordance) structurally rather than through code review.

### 3. Widget registration system

A simple registry where product teams register their widget component:

```typescript
// Product team registers their widget
registerWidget('shift_clock', {
  type: 'action',
  component: ShiftClockWidget,
  displayName: 'Upcoming Shift',
});

// Framework looks up and renders
const entry = getWidget(descriptor.id);
<WidgetCard title={entry.displayName} actions={entry.actions}>
  <entry.component {...descriptor.props} />
</WidgetCard>
```

This is intentionally simple. No plugin architecture, no dynamic loading for v1. Just a map from string IDs to components.

### 4. Widget state handling

Every widget must handle four states. The framework should provide shared primitives for three of them so product teams don't reinvent loading spinners:

| State | Framework provides | Product team provides |
|-------|-------------------|----------------------|
| **Loading** | Skeleton placeholder matching widget type dimensions | Nothing (automatic) |
| **Error** | Retry card with standard error copy | Error recovery callback |
| **Empty** | "Nothing here" card with optional CTA | Empty state copy + action |
| **Loaded** | WidgetCard chrome | Body content |

### 5. Widget list renderer

Takes an ordered array and renders WidgetCards in a vertical stack:

```typescript
<WidgetList widgets={widgetsToRender} />
```

Responsibilities:
- Renders widgets in order
- Handles spacing between cards (12px gap, consistent)
- Manages loading/error/empty states per widget
- Does NOT decide which widgets to show or in what order (that's the adaptive layer's job)

### 6. Bottom sheet primitive

A shared `BaseSheet` component for any in-phone overlay (shortcuts, reorder, detail views). Already prototyped — needs production hardening.

**Props:**
- `isOpen`, `onClose`, `title`
- `headerRight` (action slot)
- `fixedHeight` or detent-based expansion
- `footer` (sticky bottom slot)
- `children` (scrollable body)

## What NOT to build

| Don't build | Why |
|-------------|-----|
| Persona/role resolution | That's the adaptive layer (layer 2) |
| Widget selection or ranking logic | Layer 2 |
| SKU-based filtering | Layer 2 |
| Specific widget UI (shift clock, earnings, etc.) | Product teams build these after framework ships |
| Backend widget config API | Not needed for v1; hardcode for now |
| Drag-and-drop reorder | Nice to have, not in framework v1 |

## Testing strategy

Use a hardcoded widget array that exercises all four widget types:

```typescript
const DEV_WIDGETS: WidgetDescriptor[] = [
  { id: 'test_action', type: 'action', component: 'MockActionWidget' },
  { id: 'test_queue', type: 'queue', component: 'MockQueueWidget' },
  { id: 'test_status', type: 'status', component: 'MockStatusWidget' },
  { id: 'test_list', type: 'list_preview', component: 'MockListWidget' },
];
```

Build mock widgets that demonstrate each type with placeholder data. This validates the framework end-to-end without any real product integration.

## Definition of done

- [ ] WidgetCard renders consistently across all four widget types
- [ ] Product teams can register a widget with < 20 lines of code
- [ ] Loading, error, and empty states work automatically
- [ ] WidgetList renders an ordered array correctly
- [ ] BaseSheet works for at least two different use cases
- [ ] No product-specific code in the framework
- [ ] Storybook stories for each widget type + state combination
- [ ] Accessibility: all interactive elements have labels, dynamic type supported

## Relationship to prototype

A working prototype exists at `localhost:4201` (this repo). It demonstrates:
- WidgetCard with real content (shift clock, earnings, inbox, shortcuts)
- BaseSheet (shortcuts drawer, widget reorder)
- Widget ordering and persona-driven content switching

The prototype is intentionally scrappy. The framework eng builds should be production-quality Pebble components, but the prototype validates the component contracts and visual spec.

## Open questions for eng

1. Should WidgetCard live in Pebble (shared design system) or in the mobile app repo? Pebble gives broader reuse; app repo gives faster iteration.
2. Do we need a widget size/density variant (compact vs. standard) from day one, or can we add it later?
3. Should the widget registration system support lazy loading for bundle size, or is eager registration fine for v1?

# Rippling Mobile Home — Product Spec & Interactive Prototype

**Living product spec + interactive prototype for Rippling's mobile app home experience.**

This repo is the source of truth for the mobile home screen architecture: personas, widget framework, navigation model, and adaptive personalization system. The code IS the spec — run it to see the prototype, read it to understand the system.

---

## Quick Start

```bash
yarn install
yarn dev
```

Open **http://localhost:4201/mobile-home-demo** to launch the interactive prototype.

---

## For Product Managers

Start with **[`src/data-models/README.md`](./src/data-models/README.md)** — it explains the persona derivation model, zone maps (which widgets each persona sees and where), quick action ranking, and SKU gating logic. The `.ts` files alongside the README are the source of truth you can reference in product discussions.

## For Designers

Start with **[`src/widgets/README.md`](./src/widgets/README.md)** — it explains widget archetypes, the design contract, and how each widget maps to a system-defined type. Also see the full [Widget Design Contract](./.cursor/rules/widget-design-contract.mdc) for principles and anti-patterns.

## For Engineers

The folder structure IS the architecture diagram. Start here, then drill into any domain:

---

## Architecture

The system has 5 layers. Data models drive screens, which compose from widgets and navigation. The playground layer is presentation infrastructure — not product.

```
src/
  data-models/          ← WHO sees WHAT and WHY (app-wide personalization)
    personas.ts           7 personas, zone maps, derivation logic
    quick-actions.ts      Action registry, persona rankings, SKU gating
    apps.ts               App catalog, groups, default SKUs per persona
    types.ts              Shared types (PersonaId, ZoneMapping, etc.)

  screens/              ← App screens (sibling tabs in bottom nav)
    HomeScreen.tsx        Home tab: widget zones + app discovery list
    ActivityScreen.tsx    Activity tab: task/approval feed with filtering

  widgets/              ← The widget system (reusable framework)
    framework/            Base primitive + shared infrastructure
      WidgetCard.tsx        The card container every widget uses
      widget-helpers.ts     Title overrides, actions, SKU flag transforms
      types.ts              WidgetCardProps, WidgetAction
    ShiftClockWidget.tsx  Action Widget: clock in/out, shift details
    InboxWidget.tsx       Queue Widget: task/approval aggregator
    EarningsWidget.tsx    Status Widget: pay summary by persona
    ShortcutsWidget.tsx   Grid of quick action icons
    ShortcutsSheet.tsx    Full shortcuts modal (expands from widget)
    DiscoveryAppList.tsx  App discovery list (in widget zone)

  navigation/           ← Global app navigation primitives
    BottomNavigation.tsx  Tab bar (Home, Activity, Find, Chat)

  components/           ← Shared UI patterns (used across domains)
    ListItemDetail/       Reusable list-item-detail pattern

  playground/           ← Presentation infrastructure (NOT product)
    PhoneFrame.tsx        Phone mockup, status bar, canvas
    ThemedPhoneScreen.tsx Screen router + phone chrome wrapper
    HudPanels.tsx         Persona/SKU control panels on canvas
    AppsModal.tsx         SKU selection modal
    MobileHomeDemo.tsx    Entry point: wires playground + product together
```

### Dependency Flow

```
data-models/  ──→  screens/  ──→  widgets/
                       ↓              ↑
                  navigation/         │
                       ↓              │
                  playground/  ───────┘
```

- **`data-models/`** is the foundation — personas, quick actions, and app SKUs are referenced by everything
- **`screens/`** are sibling tabs (Home, Activity, Find, Chat) — not nested under each other
- **`widgets/`** is a reusable framework: `WidgetCard` is the base, individual widgets scaffold from it
- **`navigation/`** is a product primitive (bottom nav bar) — it's part of the app, not the playground
- **`playground/`** is meta — the phone mockup, HUD panels, and canvas. Viewers see it, but it's not the product

---

## Playground Controls

When running the prototype, you'll see two HUD controls:

| Control | Location | What It Does |
|---------|----------|--------------|
| **System Display** | Top-left pill | Opens the left panel: dark mode toggle, layout experiments |
| **User Intent** | Top-right card | Opens the right panel: persona selector, SKU toggles, onboarding flag |

**Switching personas** automatically resets enabled SKUs to that persona's defaults and updates the home screen widget layout in real time.

The URL includes query params (`?persona=hourly_operator&onboarding=0&apps=...`) so you can share specific configurations by copying the URL.

---

## Key Concepts

### Personas
7 personas derived from employment type, manager status, and admin level. Each persona has a zone map controlling which widgets appear in which zones (primary, core, contextual, discovery). See [`data-models/README.md`](./src/data-models/README.md).

### Widget Zones
The home screen is divided into 4 zones ordered by importance: **Primary** (top, most important), **Core** (always present), **Contextual** (role-dependent), **Discovery** (apps list). Each persona's zone map defines what goes where.

### Quick Actions
A deterministic ranking algorithm: persona-specific ranking → global fallback → SKU gating. Only actions whose required SKUs are enabled appear. Manager-only actions are filtered for non-managers. See [`data-models/README.md`](./src/data-models/README.md).

### Widget Archetypes
4 system-defined types from the [design contract](./.cursor/rules/widget-design-contract.mdc): **Action** (immediate execution), **Queue** (task aggregator), **Status** (passive monitoring), **List Preview** (lightweight feed). Every widget must fit one. See [`widgets/README.md`](./src/widgets/README.md).

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [`src/data-models/README.md`](./src/data-models/README.md) | Persona model, zone maps, quick action ranking |
| [`src/screens/README.md`](./src/screens/README.md) | Screen inventory and status |
| [`src/widgets/README.md`](./src/widgets/README.md) | Widget archetypes, framework, how to add widgets |
| [`src/navigation/README.md`](./src/navigation/README.md) | Navigation model and future plans |
| [`.cursor/rules/widget-design-contract.mdc`](./.cursor/rules/widget-design-contract.mdc) | Full widget design principles and anti-patterns |

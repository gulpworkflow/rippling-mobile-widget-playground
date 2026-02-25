# Screens — App Tabs

Home, Activity, Find, and Chat are **sibling screens** — peer tabs in the bottom navigation. The Home screen is not a parent of the others. Users open the app to Home and navigate laterally to Activity, Find, or Chat.

---

## Screen Inventory

| Screen | File | Status | Description |
|--------|------|--------|-------------|
| **Home** | `HomeScreen.tsx` | Implemented | Widget zones (primary → core → contextual → discovery), app discovery list. Content adapts per persona and enabled SKUs. |
| **Activity** | `ActivityScreen.tsx` | Implemented | Task/approval feed with tabbed filtering (All, Action Required, My Requests). Supports batch selection for bulk actions. |
| **Find** | — | Stub | Search screen. Currently renders a title header only. Will support universal search across apps, people, and actions. |
| **Chat** | — | Stub | Messaging screen. Currently renders a title header only. Gated by the Chat SKU — tab is hidden when Chat is not purchased. |

> **Note:** Find and Chat stubs live in `playground/ThemedPhoneScreen.tsx` as inline components. When they grow, they'll be extracted to their own files here.

---

## How Screens Relate to Data Models

- **HomeScreen** consumes zone maps from `data-models/personas.ts` and quick actions from `data-models/quick-actions.ts`. It composes widgets from `widgets/`.
- **ActivityScreen** is currently self-contained with mock data. In future, it will consume notification/task data from a data model.
- **Find** and **Chat** will each have their own data sources when implemented.

---

## Future Plans

- More screens will be added as the mobile experience grows (e.g., Profile, Settings)
- Each screen may get its own data model file in `data-models/` as complexity grows
- The tab order and visibility are controlled by `navigation/BottomNavigation.tsx`

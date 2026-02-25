# Navigation — Global App Primitives

This folder contains the navigation primitives that are part of the product (not the playground presentation layer).

---

## Bottom Navigation (`BottomNavigation.tsx`)

The bottom tab bar is the primary navigation surface of the mobile app.

### Current Tabs

| Tab | Icon | Always Visible | Notes |
|-----|------|---------------|-------|
| **Home** | Home | Yes | Default landing screen |
| **Activity** | Bell | Yes | Task/approval feed |
| **Find** | Search | Yes | Universal search |
| **Chat** | Comments | Conditional | Only shown when Chat SKU is enabled |

### How Tab Visibility Works

Each nav item can have an optional `sku` property. If set, the tab is only visible when that SKU ID is in the user's `enabledApps` set. Currently only Chat uses this gating.

### Design Details

- Glass-morphism pill-shaped tab bar with backdrop blur
- Active tab gets a filled icon + subtle background
- Floating settings button (sparkle icon) on the right — reserved for AI assistant
- Home indicator bar at bottom (iOS-style)
- Adapts to dark/light mode via `isDark` prop

---

## Future Plans

- **AI Assistant**: The floating sparkle button will open an AI assistant overlay
- **Nav Experiments**: Alternative tab bar designs (icon-only, labels-only, expanded) via the System Display HUD panel
- **Tab Order**: Configurable tab order for different personas or A/B testing
- **Badge Counts**: Notification badges on Activity and Chat tabs

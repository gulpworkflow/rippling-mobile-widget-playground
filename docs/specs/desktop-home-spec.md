# Desktop Home — Engineering Spec

> **Source of truth:** [`src/demos/desktop-home-demo.tsx`](../../src/demos/desktop-home-demo.tsx)
> **Pebble MCP:** All component APIs are queryable via `mcp_Pebble_get-component-examples`. This spec covers *configuration and composition*, not the design system itself.

---

## Why this prototype, not a Figma

| Figma gives you | This prototype gives you |
|---|---|
| Static rectangles with Pebble component names | Runnable Pebble components with exact props |
| "On click, go to..." annotations | Real state machines, conditional renders, side effects |
| Separate frames for each persona | One component, 7 personas, live-switchable |
| "Data TBD" placeholder text | Typed data contracts with interfaces you can import |
| Redlines for spacing | Theme tokens already applied — inspect the value, copy the token |
| Variant toggles in the properties panel | `useMemo` + `useState` producing the same logic your code will |
| A separate "specs" page you have to cross-reference | Everything is co-located: data → state → render |

**This file is the Figma annotation layer.** The prototype is the Figma file.

---

## Table of Contents

1. [Page Architecture](#1-page-architecture)
2. [Data Contracts](#2-data-contracts)
3. [State Machine](#3-state-machine)
4. [Section: SSO Strip](#4-sso-strip)
5. [Section: AI Prompt](#5-ai-prompt)
6. [Section: Quick Action Shortcuts](#6-quick-action-shortcuts)
7. [Section: Card Grid](#7-card-grid)
8. [Section: Company Resources Footer](#8-company-resources-footer)
9. [Overlay: SSO Drawer](#9-sso-drawer)
10. [Overlay: Edit Shortcuts Drawer](#10-edit-shortcuts-drawer)
11. [Overlay: Create Custom Shortcut Modal](#11-create-custom-shortcut-modal)
12. [Overlay: AI Resolve Drawer](#12-ai-resolve-drawer)
13. [Overlay: Company Feed Drawer](#13-company-feed-drawer)
14. [Overlay: Persona HUD](#14-persona-hud)
15. [Persona-Driven Behavior Matrix](#15-persona-driven-behavior-matrix)
16. [Navigation Sidebar Config](#16-navigation-sidebar-config)
17. [Animation & Transition Spec](#17-animation--transition-spec)

---

## 1. Page Architecture

```
┌─────────────────────────────────────────────────────────┐
│ TopNavBar (from AppShellLayout)                         │
├──────┬──────────────────────────────────────────────────┤
│      │ PageGradient                                     │
│      │ ┌──────────────────────────────────────────────┐ │
│ Side │ │ SSOStrip (absolute, top: 0)                  │ │
│ bar  │ ├──────────────────────────────────────────────┤ │
│      │ │ HomeContent (max-width: 960px, centered)     │ │
│      │ │   PromptHeading                              │ │
│      │ │   PromptWrap → PromptCard + PromptDropdown   │ │
│      │ │   CreditNotice                               │ │
│      │ │   ShortcutsStrip (quick actions)             │ │
│      │ ├──────────────────────────────────────────────┤ │
│      │ │ CardGrid (3-col, max-width: 1200px)          │ │
│      │ │   [Recent] [Tasks] [Analytics]               │ │
│      │ ├──────────────────────────────────────────────┤ │
│      │ │ ResourcesFooter (max-width: 1200px)          │ │
│      │ └──────────────────────────────────────────────┘ │
└──────┴──────────────────────────────────────────────────┘
```

### AppShellLayout Configuration

```typescript
<AppShellLayout
  hidePageHeader                          // No Page.Header — home owns its own content
  mainNavSections={[orgChartSection, appsSection]}
  platformNavSection={platformSection}
  companyName={user.company}              // From SAMPLE_USERS[userIdx]
  userInitial={user.name.charAt(0)}
  showNotificationBadge
  notificationCount={2}
  onPersonaSelect={() => setPersonaHudOpen(prev => !prev)}
  personaLabel={PERSONA_OPTIONS.find(p => p.id === user.persona)?.label}
/>
```

### Layout Tokens

| Region | Constraint | Token / Value |
|---|---|---|
| Page background | Gradient | `colorSurfaceDim 35% → colorSurface 50%` via `linear-gradient` |
| HomeContent max-width | `960px` | — |
| HomeContent padding | Top / sides | `space1200` top, `space800` sides |
| CardGrid max-width | `1200px` | — |
| CardGrid columns | `repeat(3, 1fr)` | — |
| CardGrid gap | `space400` | 16px |
| CardGrid margin | Top / bottom | `space800` auto `space400` |
| ResourcesFooter max-width | `1200px` | — |

---

## 2. Data Contracts

These are the interfaces and data structures that drive the page. They are the real spec — not mockup text.

### SampleUser (drives persona switching)

```typescript
// src/data-models/sample-users.ts
interface SampleUser {
  id: string;
  name: string;
  company: string;
  avatar: string;
  persona: PersonaId;
  enabledApps?: string[];   // Maps to SKU flags
  onboarding?: boolean;
}
```

**7 users ship with the prototype** — each maps to one persona. `enabledApps` gates which quick actions appear.

### PersonaId (union type, 7 values)

```typescript
type PersonaId =
  | 'hourly_operator'
  | 'employee_self_service'
  | 'frontline_shift_manager'
  | 'people_manager'
  | 'functional_admin'
  | 'executive_owner'
  | 'contractor';
```

### QuickAction (drives the shortcuts strip + edit drawer)

```typescript
interface QuickAction {
  id: QuickActionId;
  label: string;
  route: string;
  product: string;              // "Time", "Payroll", "Benefits", "Spend", "HR", "Travel"
  requiredSkus: SkuId[];        // Gate: all must be enabled
  onboardingPriority?: boolean; // Boosted during onboarding
  managerOnly?: boolean;        // Hidden from non-manager personas
}
```

**36 registered actions** in `ACTION_REGISTRY`. Resolution logic: `persona ranking → global fallback → SKU gate → manager filter`.

### SSOApp (drives the SSO strip + drawer)

```typescript
interface SSOApp {
  name: string;
  desc: string;
  icon: string;    // Favicon URL
  pinned?: boolean; // Appears in the top strip
}
```

**23 apps total. 8 pinned.** The strip shows pinned apps; the drawer shows all.

### CustomShortcut (user-created, runtime only)

```typescript
interface CustomShortcut {
  id: string;       // `custom_${Date.now()}`
  label: string;
  url: string;      // Must match /^https:\/\/(app|www)\.rippling\.com/
}
```

### AnalyticsItem (drives the analytics card)

```typescript
interface AnalyticsItem {
  icon: string;                              // Icon.TYPES constant
  title: string;
  insight: string;                           // Relative timestamp
  points: number[];                          // Sparkline data (10 points)
  strokeColor: 'primary' | 'error' | 'success';
}
```

### Static Data Arrays

| Array | Count | Used In |
|---|---|---|
| `ALL_SSO_APPS` | 23 | SSO strip, SSO drawer |
| `PINNED_APPS` | 8 (filtered from above) | SSO strip |
| `RECENT_ITEMS` | 5 | Recent card |
| `MOST_VISITED_ITEMS` | 5 | Recent card (alt sort) |
| `TASK_ITEMS` | 4 | Priority to-dos card |
| `ANALYTICS_ITEMS` | 4 | Analytics card |
| `SUGGESTIONS_BY_PERSONA` | 4 persona keys, 7 items each | AI prompt dropdown |
| `DEFAULT_SUGGESTIONS` | 7 | Fallback prompt suggestions |
| `QUICK_ACTION_ICONS` | 23 entries | Icon mapping for quick actions |

---

## 3. State Machine

All state lives in the root `DesktopHomeDemo` component via `useState`. No external state management.

| State | Type | Default | Controls |
|---|---|---|---|
| `drawerOpen` | `boolean` | `false` | SSO drawer visibility |
| `search` | `string` | `''` | SSO drawer search filter |
| `sortBy` | `'recent' \| 'used' \| 'alpha'` | `'recent'` | SSO drawer sort |
| `sortMenuOpen` | `boolean` | `false` | SSO drawer sort menu |
| `cardMenu` | `string \| null` | `null` | Which card's overflow menu is open (`'recent'`, `'tasks'`, `'analytics'`, or `null`) |
| `recentCardSort` | `'recent' \| 'visited'` | `'recent'` | Toggle between "Recently visited" / "Most visited" |
| `aiModalOpen` | `boolean` | `false` | AI resolve drawer |
| `qaDrawerOpen` | `boolean` | `false` | Edit shortcuts drawer |
| `qaSearch` | `string` | `''` | Shortcuts drawer search |
| `qaSortBy` | `'recent' \| 'used' \| 'alpha'` | `'recent'` | Shortcuts drawer sort |
| `qaSortMenuOpen` | `boolean` | `false` | Shortcuts drawer sort menu |
| `userIdx` | `number` | `3` | Active persona (index into `SAMPLE_USERS`) — default is People Manager |
| `personaHudOpen` | `boolean` | `false` | Persona switcher overlay |
| `customShortcuts` | `CustomShortcut[]` | `[]` | User-created shortcuts (runtime) |
| `showCreateModal` | `boolean` | `false` | Create shortcut modal |
| `createUrl` | `string` | `''` | Modal: URL field |
| `createName` | `string` | `''` | Modal: Name field |
| `createUrlError` | `string` | `''` | Modal: Validation message |
| `createUrlTouched` | `boolean` | `false` | Modal: Whether URL was blurred |
| `pulseDrawerOpen` | `boolean` | `false` | Company feed drawer |
| `promptValue` | `string` | `''` | AI prompt textarea value |
| `promptFocused` | `boolean` | `false` | AI prompt focus state (drives dropdown) |
| `qaFavorites` | `Set<string>` | `new Set(quickActions.map(a => a.id))` | Pinned shortcut IDs (resets on persona change) |

### Derived State (useMemo)

| Derived | Depends On | Logic |
|---|---|---|
| `user` | `userIdx` | `SAMPLE_USERS[userIdx]` |
| `enabledApps` | `user.enabledApps` | `new Set(user.enabledApps)` |
| `skuFlags` | `enabledApps` | `enabledAppsToSkuFlags(enabledApps)` — maps app IDs to SKU booleans |
| `quickActions` / `allQuickActionsRaw` | `user.persona`, `skuFlags`, `user.onboarding` | `getQuickActions({ persona, skuFlags, onboarding, maxCount: 4 })` |
| `suggestions` | `user.persona` | `SUGGESTIONS_BY_PERSONA[persona] ?? DEFAULT_SUGGESTIONS` |
| `filteredApps` | `search`, `sortBy` | Filter by name/desc, sort by alpha if selected |
| `filteredQA` | `allQuickActionsRaw`, `qaSearch`, `qaSortBy` | Filter by label, sort by alpha if selected |
| `filteredCustomQA` | `customShortcuts`, `qaSearch`, `qaSortBy` | Filter by label, sort by alpha if selected |

---

## 4. SSO Strip

**Position:** Absolute, pinned to top of `PageGradient`. Scrolls away with content.

### Structure

```
SSOStrip (height: space1200, border-bottom, centered flex)
├── SSOLabel ("Quick sign-in", typestyleV2BodyMedium, weight 600)
├── SSODivider (1px × 20px vertical rule)
└── for each PINNED_APPS:
    └── SSOItemWrap
        ├── SSOItem (anchor, icon + name, pill-shaped hover)
        │   └── SSOIcon (24×24, rounded md, border, contains <img>)
        └── SSOHoverCard (220px, appears on hover, 150ms ease)
            ├── SSOHoverIcon (32×32, rounded lg)
            └── SSOHoverBody
                ├── SSOHoverName (typestyleV2LabelLarge)
                └── SSOHoverDesc (typestyleV2BodySmall)
└── SSOMoreWrap ("+{N} more" button → opens SSO drawer)
    └── Icon(LIST_OUTLINE, size 16)
```

### Component Configuration

| Element | Pebble Component | Props |
|---|---|---|
| More button icon | `Icon` | `type={Icon.TYPES.LIST_OUTLINE}`, `size={16}`, `color="currentColor"` |

### Hover Card Behavior

- Appears via CSS `opacity` + `transform` transition on parent `:hover`
- 150ms ease, translates from `space100` below to `0`
- Positioned absolute, `top: calc(100% + space200)`, centered with `translateX(-50%)`
- Box shadow: `0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)`

### Data

```typescript
const PINNED_APPS = ALL_SSO_APPS.filter(a => a.pinned); // 8 apps
const OVERFLOW_COUNT = ALL_SSO_APPS.length - PINNED_APPS.length; // 15
```

---

## 5. AI Prompt

**Position:** Centered in `HomeContent`, max-width `830px`.

### Structure

```
PromptWrap (relative, max-width 830px)
├── PromptCard (surface bright, border, rounded 2xl, shadow, cursor: text)
│   ├── <svg> Rippling AI spark icon (20×20, fill: colorPrimary)
│   ├── PromptInput (<textarea>, typestyleV2BodyLarge, single row)
│   └── Button.Icon (submit button)
└── PromptDropdown (absolute, below card, visible when focused + empty)
    ├── PromptDivider
    └── for each suggestion:
        └── DropdownRow (button, full-width)
            ├── DropdownRowIcon ("↪" character)
            └── DropdownRowText (typestyleV2BodyMedium)
```

### Component Configuration

| Element | Pebble Component | Props |
|---|---|---|
| Submit button | `Button.Icon` | `icon={Icon.TYPES.UPLOAD}`, `appearance={Button.APPEARANCES.PRIMARY}`, `size={Button.SIZES.S}` |
| Credit notice tooltip | `Tip` | `content="Help center, navigation..."`, `placement={Tip.PLACEMENTS.BOTTOM}` |

### Prompt Card Visual States

| State | Border Radius | Box Shadow | Border Bottom |
|---|---|---|---|
| Default | `shapeCorner2xl` all sides | `0px 1px 2px rgba(0,0,0,0.1)` | Normal |
| Dropdown open | `shapeCorner2xl` top, `0` bottom | `0 12px 32px rgba(0,0,0,0.1)` | Transparent |

Transition: `border-radius 0.15s ease, box-shadow 0.15s ease`

### Dropdown Visibility Logic

```typescript
$visible={promptFocused && !promptValue}
```

Dropdown only shows when: textarea is focused AND no text has been typed. Clicking a suggestion sets `promptValue` and blurs.

### Suggestions Per Persona

| Persona | Example Suggestions |
|---|---|
| `hourly-employee` | "How much overtime did I work this month?", "When is my next scheduled shift?" |
| `salaried-employee` | "What does my benefits plan cover?", "How do I add my newborn to my insurance?" |
| `manager` | "Which teams have the highest attrition this quarter?", "Are there any pay equity gaps?" |
| `admin` | "What compliance tasks are overdue?", "Show me headcount trends by department" |

Note: persona keys in `SUGGESTIONS_BY_PERSONA` use different keys than `PersonaId` — this is a mapping issue to resolve in prod.

### Credit Notice Bar

```
CreditNotice (below prompt, rounded bottom lg, dim background)
├── CreditNoticeText
│   └── "No credits remaining · [Basic mode] until April 1"
│       └── Tip wrapping "Basic mode" (dotted underline, help cursor)
└── CreditNoticeLink ("Request upgrade" + CHEVRON_RIGHT size 14)
```

---

## 6. Quick Action Shortcuts

**Position:** Below AI prompt, max-width `830px`, wrapping flex.

### Structure

```
ShortcutsStrip (flex, wrap, row-gap space200)
├── for each (favorites ∪ custom shortcuts):
│   └── QATile (<a>, pill shape, stagger-animated)
│       ├── QAIconBox (32×32 circle, colorSurfaceDim bg)
│       │   └── Icon(type, size=16, colorOnSurface)
│       ├── QALabel (typestyleV2BodyMedium)
│       └── Icon(CHEVRON_RIGHT, size=16)
└── Button.Icon (edit button, ghost, opacity 0.5)
```

### Component Configuration

| Element | Pebble Component | Props |
|---|---|---|
| Edit button | `Button.Icon` | `icon={Icon.TYPES.EDIT_OUTLINE}`, `appearance={Button.APPEARANCES.GHOST}`, `size={Button.SIZES.S}`, `tip="Edit shortcuts"` |

### Data Resolution

```typescript
// Merge system actions + custom shortcuts, filtered to favorites only
const displayedShortcuts = [
  ...allQuickActionsRaw.filter(a => qaFavorites.has(a.id)).map(a => ({
    id: a.id, label: a.label,
    icon: QUICK_ACTION_ICONS[a.id] || Icon.TYPES.LINK_OUTLET,
    url: undefined,
  })),
  ...customShortcuts.filter(s => qaFavorites.has(s.id)).map(s => ({
    id: s.id, label: s.label,
    icon: Icon.TYPES.LINK_OUTLET,
    url: s.url,
  })),
];
```

### Quick Action Resolution Pipeline

```
User.persona + User.enabledApps
     ↓
enabledAppsToSkuFlags()     →  SkuFlags (e.g. { time_off: true, my_pay: true, ... })
     ↓
getQuickActions({ persona, skuFlags, onboarding, maxCount: 4 })
     ↓
1. Persona-specific ranking (DEFAULT_PERSONA_RANKINGS[persona])
2. Global fallback ranking (GLOBAL_RANKING)
3. Filter: managerOnly actions removed for non-managers
4. Filter: requiredSkus must all be satisfied
5. Onboarding boost: actions with onboardingPriority front-loaded
     ↓
QuickActionsResult { actions: first 4, all: complete ordered list }
```

### Stagger Animation

Each chip animates in with a `350ms cubic-bezier(0.16, 1, 0.3, 1)` entrance:
- `opacity: 0 → 1`, `translateY(4px) → 0`
- Delay: `200ms + (index × 50ms)`

---

## 7. Card Grid

**Layout:** `grid-template-columns: repeat(3, 1fr)`, gap `space400`, max-width `1200px`, centered.

### Card Shell (shared)

```
Card (colorSurfaceDim 30% blend, rounded 2xl, padding space500)
├── CardHeader (flex, space-between)
│   ├── CardTitleButton (button, typestyleV2TitleSmall, hover → colorPrimary)
│   │   └── [title text] + Icon(CHEVRON_RIGHT, size 16)
│   │   └── (optional) Atoms.Badge for count
│   └── CardMenuWrap (relative container)
│       ├── Button.Icon (MORE_HORIZONTAL, ghost, XS)
│       └── CardMenu (absolute dropdown, conditional)
└── [card-specific rows]
```

### Card Menu Component Config

| Element | Pebble Component | Props |
|---|---|---|
| Overflow button | `Button.Icon` | `icon={Icon.TYPES.MORE_HORIZONTAL}`, `appearance={Button.APPEARANCES.GHOST}`, `size={Button.SIZES.XS}` |
| Badge (tasks card) | `Atoms.Badge` | `text="7"`, `appearance={Atoms.Badge.APPEARANCES.PRIMARY_LIGHT}`, `size={Atoms.Badge.SIZES.S}` |

---

### Card 1: Recently Visited / Most Visited

**Menu actions:** "Sort by most visited" / "Sort by recently visited", "Clear history"

**Toggle:** `recentCardSort` state switches between `RECENT_ITEMS` and `MOST_VISITED_ITEMS`.

**Row structure:**
```
RecentRow (flex, align-center, border-bottom last-child none)
├── RecentIconCircle (28×28 circle)
│   └── <img> (avatar) or Icon(type, size 13, white)
├── RecentName (typestyleV2BodyMedium, ellipsis)
└── RecentTime (typestyleV2BodySmall, colorOnSurfaceVariant) — only if meta present
```

**Data shape:**
```typescript
{ avatar?: string, icon?: string, name: string, meta?: string, color?: string }
```

Avatar items use the `color` field for the circle background. Icon items use `colorPrimary`.

---

### Card 2: Priority To-dos

**Title:** "Priority to-dos" + Badge(7)

**Menu actions:** "Mark all as read", "Filter by type"

**Row structure:**
```
TaskRow (flex, align-center, border-bottom)
├── TaskIconCircle (28×28 circle, background: item.color)
│   └── <img src={item.avatar}>
├── TaskBody (flex-1, min-width 0)
│   ├── TaskTitle (typestyleV2BodyMedium, ellipsis)
│   └── TaskMeta (typestyleV2BodySmall, colorOnSurfaceVariant, ellipsis)
```

**Data shape:**
```typescript
{
  avatar: string,        // Unsplash face
  name: string,          // e.g. "Increase Robert Wilson's PTO balance to 20 days"
  meta: string,          // e.g. "Lisa Thompson · HR Management"
  action: string,        // e.g. "Approve", "Review", "Sign" (not currently rendered as button)
  color: string          // oklch color for avatar circle
}
```

---

### Card 3: Analytics

**Menu actions:** "Customize analytics", "Hide card"

**Row structure:**
```
AnalyticsRow (flex, align-center, border-bottom)
├── AnalyticsIconCircle (28×28, rounded lg, colorSurfaceDim bg)
│   └── Icon(type, size 13, colorOnSurfaceVariant)
├── AnalyticsBody (flex-1)
│   ├── AnalyticsTitle (typestyleV2BodyMedium)
│   └── AnalyticsInsight (typestyleV2BodySmall, colorOnSurfaceVariant, ellipsis)
└── [sparkline SVG — currently display:none]
```

**Sparkline:** `sparklinePaths()` generates SVG polyline + polygon from 10 data points across a 48×18 viewport. Currently hidden (`display: none`), but the data and rendering function exist.

**Data:**
| Title | Points | Color |
|---|---|---|
| Headcount | `[8,9,10,10,11,12,13,14,15,17]` | primary |
| Payroll cost | `[11,12,11,12,13,12,12,11,12,12]` | primary |
| Initiatives Tracker | `[3,4,4,5,6,8,10,13,15,18]` | error |
| Attendance Data | `[16,15,14,14,12,11,10,9,8,7]` | success |

---

## 8. Company Resources Footer

```
ResourcesFooter (max-width 1200px, centered, flex, border-top, margin-top 80px)
├── ResourcesLabel ("Company resources", typestyleV2BodyMedium weight 600)
├── ResourcesDivider
├── ResourceLink ("Company Feed" → opens pulseDrawerOpen)
├── ResourcesDivider
├── ResourceLink ("Employee Handbook" → href="#")
├── ResourcesDivider
└── ResourceLink ("Help Desk" → href="#")
```

---

## 9. SSO Drawer

**Trigger:** "+{N} more" button in SSO strip

### Pebble Drawer Configuration

```typescript
<Drawer
  isVisible={drawerOpen}
  onCancel={() => { setDrawerOpen(false); setSearch(''); setSortMenuOpen(false); }}
  title="Quick sign-in"
  width={520}
  overlayClassName={compactDrawerClass}  // Custom padding override
/>
```

### Custom CSS Override

```css
header { padding-left: 36px !important; padding-right: 36px !important; }
[data-testid="drawer-body"] { padding-left: 36px !important; padding-right: 36px !important; }
```

### Toolbar

```
DrawerToolbar (flex, align-center, gap space200, padding-bottom space400)
├── DrawerSearchInput (flex-1, border, rounded lg, focus → colorPrimary border)
│   ├── Icon(SEARCH_OUTLINE, size 16, colorOnSurfaceVariant)
│   └── <input placeholder="Search for apps...">
└── SortWrap
    ├── Button.Icon(FILTER, ghost, S)
    └── SortMenu (absolute, conditional)
        ├── SortMenuLabel ("Sort by", uppercased)
        └── SortMenuItem × 3: "Most recent" | "Most used" | "Alphabetical"
```

### Filtering Logic

```typescript
const filteredApps = useMemo(() => {
  let apps = [...ALL_SSO_APPS];
  if (search.trim()) {
    const q = search.toLowerCase();
    apps = apps.filter(a => a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q));
  }
  if (sortBy === 'alpha') apps.sort((a, b) => a.name.localeCompare(b.name));
  return apps;
}, [search, sortBy]);
```

### Row Structure

```
DrawerAppRow (<a>, flex, gap space300, hover bg, rounded lg, negative margin for bleed)
├── DrawerAppIcon (36×36, rounded lg, border, contains <img 24×24>)
└── DrawerAppBody
    ├── DrawerAppName (typestyleV2LabelLarge)
    └── DrawerAppDesc (typestyleV2BodySmall, colorOnSurfaceVariant)
```

---

## 10. Edit Shortcuts Drawer

**Trigger:** Pencil icon button in ShortcutsStrip

### Pebble Drawer Configuration

```typescript
<Drawer
  isVisible={qaDrawerOpen}
  onCancel={() => { setQaDrawerOpen(false); setQaSearch(''); setQaSortMenuOpen(false); }}
  title="Edit shortcuts"
  width={520}
  overlayClassName={compactDrawerClass}
/>
```

### Content

1. **Toolbar** — Same pattern as SSO drawer (search + sort)
2. **"+ Custom shortcut" link** — Opens create modal
3. **Custom shortcuts list** — Each row has: icon, name, "Custom" desc, trash button, star toggle
4. **System actions list** — Each row has: icon, name, product desc, star toggle

### Favorite Toggle Behavior

```typescript
// Star button toggles membership in qaFavorites Set
<Button.Icon
  icon={isFav ? Icon.TYPES.STAR_FILLED : Icon.TYPES.STAR_OUTLINE}
  tip={isFav ? 'Remove from home' : 'Pin to home'}
  appearance={Button.APPEARANCES.GHOST}
  size={Button.SIZES.XS}
/>
```

`qaFavorites` resets to the persona's default actions on persona switch:
```typescript
useEffect(() => {
  setQaFavorites(new Set(quickActions.map(a => a.id)));
}, [user.persona]);
```

---

## 11. Create Custom Shortcut Modal

**Trigger:** "+ Custom shortcut" link in Edit Shortcuts drawer

### Pebble Modal Configuration

```typescript
<Modal
  isVisible={showCreateModal}
  onCancel={handleCloseCreateModal}
  title="Create a custom shortcut"
  width={480}
  shouldCloseOnBackdropClick
  theme={Modal.THEMES.NO_PADDING}
/>
```

### Form Fields

| Field | Pebble Component | Props | Validation |
|---|---|---|---|
| Rippling URL | `Input.Text` | `size={Input.Text.SIZES.M}`, `autoFocus`, `placeholder="https://app.rippling.com/..."` | Must match `/^https:\/\/(app\|www)\.rippling\.com/` |
| Shortcut name | `Input.Text` | `size={Input.Text.SIZES.M}`, `placeholder="e.g. Run Payroll"` | Non-empty |

### Footer Buttons

```typescript
<Modal.Footer>
  <Button appearance={Button.APPEARANCES.OUTLINE} size={Button.SIZES.M}>Cancel</Button>
  <Button appearance={Button.APPEARANCES.PRIMARY} size={Button.SIZES.M} isDisabled={!isCreateFormValid}>Save</Button>
</Modal.Footer>
```

### Validation State Machine

```
URL field blur → if non-empty AND !isValidRipplingUrl → show error "Only Rippling URLs are supported"
URL field change (after touch) → re-validate on every keystroke
Form valid when: name.trim().length > 0 && url.trim().length > 0 && isValidRipplingUrl(url)
```

---

## 12. AI Resolve Drawer

**Trigger:** Would be triggered from task items (conceptual feature)

```typescript
<Drawer
  isVisible={aiModalOpen}
  onCancel={() => setAiModalOpen(false)}
  title="Resolve with AI"
  width={480}
/>
```

Content is a static explanation of the AI capability — placeholder for the real implementation.

---

## 13. Company Feed Drawer

**Trigger:** "Company Feed" link in ResourcesFooter

```typescript
<Drawer
  isVisible={pulseDrawerOpen}
  onCancel={() => setPulseDrawerOpen(false)}
  title="Company feed"
  width={620}
  overlayClassName={compactDrawerClass}
/>
```

### Structure

```
Drawer body
├── PulseCarousel (horizontal scroll, 4 category cards)
│   ├── PulseCategoryCard: "Out of Office (4)" — 3 people rows + "View all"
│   ├── PulseCategoryCard: "New Hires (3)" — 3 people rows + "View all"
│   ├── PulseCategoryCard: "Work Anniversaries (4)" — 3 people rows + "View all"
│   └── PulseCategoryCard: "Birthdays (3)" — 3 people rows + "View all"
├── PulseDivider
└── PulseSection (feed)
    ├── PulsePostBox (composer placeholder: avatar + "Share a post...")
    └── PulsePost × 6
        ├── PulsePostHeader (avatar + author + time)
        ├── PulsePostBody (post text)
        └── PulsePostActions (heart + comment buttons with counts)
```

### Category Card Spec

| Property | Value |
|---|---|
| Width | `280px`, flex-shrink 0 |
| Border | `1px solid colorOutlineVariant` |
| Radius | `shapeCorner2xl` |
| Padding | `space400` |
| Max visible rows | 3 |
| Overflow | Horizontal scroll (hidden scrollbar) |

### Post Action Buttons

```typescript
<PulsePostAction>
  <Icon type={Icon.TYPES.HEART_OUTLINE} size={14} color="currentColor" />
  {likeCount} likes
</PulsePostAction>
<PulsePostAction>
  <Icon type={Icon.TYPES.COMMENTS_OUTLINE} size={14} color="currentColor" />
  {commentCount} comments
</PulsePostAction>
```

---

## 14. Persona HUD

**Trigger:** Clicking the persona label in the top nav bar.

**Position:** `fixed`, `top: space1600`, `right: space400`, `z-index: 200`.

```
PersonaHudBackdrop (fixed inset, z-index 199, click to close)
PersonaHud (280px, rounded 2xl, shadow, animated)
├── PersonaHudHeader
│   ├── PersonaHudLabel ("Viewing as", uppercased)
│   └── PersonaHudDismiss ("×" button)
└── PersonaHudSelect (<select> with all 7 SAMPLE_USERS)
    └── option: "{name} — {persona label}" for each user
```

### Animation

```css
opacity: 0 → 1;
transform: translateY(-8px) → translateY(0);
transition: opacity 0.15s ease, transform 0.15s ease;
```

---

## 15. Persona-Driven Behavior Matrix

Switching personas changes *everything*. This is what Figma can't spec without 7 separate frames.

| Signal | What Changes |
|---|---|
| `user.persona` | Quick actions list, AI prompt suggestions, qaFavorites reset |
| `user.enabledApps` | SKU flags → which quick actions pass the gate |
| `user.company` | Sidebar company name |
| `user.name` | User initial in top nav, greeting |
| Derived `skuFlags` | Action filtering (e.g. contractor has no `time_off` SKU → no "Request Time Off") |

### Quick Actions by Persona (default 4)

| Persona | Default Shortcuts |
|---|---|
| `hourly_operator` | Request Time Off, Edit Availability, View Timesheet, Shift Swaps |
| `employee_self_service` | Request Time Off, Submit Expense, View My Benefits, Book Travel |
| `frontline_shift_manager` | Team Schedule, Review Timesheets, Assign Shifts, Request Time Off |
| `people_manager` | View Paystubs, Request Time Off, Submit Expense, View My Benefits |
| `functional_admin` | Review Timesheets, PTO Approvals, Expense Approvals, Find People |
| `executive_owner` | Expense Approvals, Review Timesheets, PTO Approvals, Find People |
| `contractor` | Submit Expense, Log Mileage, View Timesheet, View Paystubs |

### Manager-Only Actions (hidden from non-managers)

`review_timesheets`, `assign_shifts`, `view_pto_approvals`, `view_expense_approvals`

### SKU → Action Gating

| SKU | Actions it enables |
|---|---|
| `time_off` | Request Time Off, View PTO Balances, PTO Approvals, Company Holidays, Team OOO |
| `scheduling` | My Schedule, Shift Swaps, Edit Availability, Team Schedule, Assign Shifts |
| `time_tracking` | View Timesheet, Review Timesheets, Shift Summary, Time Change Request |
| `my_pay` | View Paystubs, Bank Details, Tax Documents, Pay Overview, Withholdings, Paycheck Split |
| `my_benefits` | View My Benefits, Flex Benefits, HSA Overview |
| `spend_management` | Submit Expense, Scan Receipt, Log Mileage, Expenses Overview, Expense Approvals, Company Cards |
| `people_directory` | Find People |
| `travel` | Book Travel |
| `chat` | Message Team |

---

## 16. Navigation Sidebar Config

The sidebar is configured via data objects, not hardcoded markup.

```typescript
const orgChartSection: NavSectionData = {
  items: [
    { id: 'org-chart', label: 'Org Chart', icon: Icon.TYPES.HIERARCHY_HORIZONTAL_OUTLINE },
  ],
};

const appsSection: NavSectionData = {
  items: [
    { id: 'favorites', label: 'Favorites', icon: Icon.TYPES.STAR_OUTLINE, hasSubmenu: true },
    { id: 'time', label: 'Time', icon: Icon.TYPES.TIME_OUTLINE, hasSubmenu: true },
    { id: 'benefits', label: 'Benefits', icon: Icon.TYPES.HEART_OUTLINE, hasSubmenu: true },
    { id: 'payroll', label: 'Payroll', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, hasSubmenu: true },
    { id: 'finance', label: 'Finance', icon: Icon.TYPES.CREDIT_CARD_OUTLINE, hasSubmenu: true },
    { id: 'talent', label: 'Talent', icon: Icon.TYPES.TALENT_OUTLINE, hasSubmenu: true },
    { id: 'it', label: 'IT', icon: Icon.TYPES.LAPTOP_OUTLINE, hasSubmenu: true },
    { id: 'data', label: 'Data', icon: Icon.TYPES.BAR_CHART_OUTLINE, hasSubmenu: true },
    { id: 'custom-apps', label: 'Custom Apps', icon: Icon.TYPES.CUSTOM_APPS_OUTLINE, hasSubmenu: true },
  ],
};

const platformSection: NavSectionData = {
  label: 'Platform',
  items: [
    { id: 'tools', label: 'Tools', icon: Icon.TYPES.WRENCH_OUTLINE, hasSubmenu: true },
    { id: 'company-settings', label: 'Company settings', icon: Icon.TYPES.SETTINGS_OUTLINE, hasSubmenu: true },
    { id: 'app-shop', label: 'App Shop', icon: Icon.TYPES.INTEGRATED_APPS_OUTLINE },
    { id: 'help', label: 'Help', icon: Icon.TYPES.QUESTION_CIRCLE_OUTLINE },
  ],
};
```

---

## 17. Animation & Transition Spec

| Element | Property | Duration | Easing | Trigger |
|---|---|---|---|---|
| SSO hover card | `opacity`, `transform` | 150ms | `ease` | CSS `:hover` on parent |
| SSO items | `background`, `color` | 100ms | — | CSS `:hover` |
| Quick action chips | `opacity`, `translateY` | 350ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Mount, staggered by `200 + idx*50ms` |
| Prompt card border-radius | `border-radius`, `box-shadow` | 150ms | `ease` | Focus state |
| Prompt dropdown | `opacity` | 150ms | `ease` | Focus + empty value |
| Persona HUD | `opacity`, `transform` | 150ms | `ease` | Toggle state |
| Sort menu items | `background` | 100ms | — | CSS `:hover` |
| Card menu items | `background` | immediate | — | CSS `:hover` |
| Focus ring (search) | `border-color` | 150ms | — | `:focus-within` |

---

## Appendix: How to Use This Spec

### With Pebble MCP
```
mcp_Pebble_get-component-examples({ componentName: "Drawer" })
mcp_Pebble_get-component-examples({ componentName: "Modal" })
mcp_Pebble_get-component-examples({ componentName: "Button" })
```

### With the Prototype
1. Run `yarn dev` and navigate to the desktop home demo
2. Open the persona HUD (top-right) to switch between all 7 personas live
3. Every state change described in Section 3 is observable in real-time
4. DevTools → inspect any element → the applied theme tokens are visible in computed styles

### What Figma Cannot Tell You (But This Prototype Does)
- **State dependencies:** The prompt dropdown disappears the *moment* you type — not on blur
- **Data gating:** A contractor will never see "Assign Shifts" — the SKU gate removes it before render
- **Persona reset:** `qaFavorites` resets to persona defaults on switch, not on page reload
- **Validation timing:** URL validation fires on blur first, then on every keystroke after touch
- **Animation choreography:** Chips stagger in 50ms apart starting at 200ms — try switching personas to see it replay
- **Overflow behavior:** The SSO strip shows exactly 8 pinned apps, the "+N more" count is computed from the full list

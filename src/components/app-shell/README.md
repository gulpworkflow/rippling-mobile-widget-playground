# App Shell Components

Reusable components for building Rippling-style application shell layouts with consistent navigation, header, and content areas.

## 📦 Components

### `AppShellLayout`
Main wrapper component that combines all shell elements into a complete layout.

**Props:**
- `pageTitle` (string) - Title shown in the page header
- `pageTabs?` (string[]) - Optional array of tab labels
- `defaultActiveTab?` (number) - Index of initially active tab (default: 0)
- `onTabChange?` (function) - Callback when tab changes
- `pageActions?` (ReactNode) - Optional actions (buttons) for the page header
- `mainNavSections` (NavSectionData[]) - Main navigation sections for sidebar
- `platformNavSection?` (NavSectionData) - Optional platform section for sidebar
- `companyName?` (string) - Company name in profile dropdown (default: "Acme, Inc.")
- `userInitial?` (string) - User initial for avatar (default: "A")
- `searchPlaceholder?` (string) - Placeholder text for search bar
- `onLogoClick?` (function) - Handler for logo click
- `showNotificationBadge?` (boolean) - Show notification badge (default: false)
- `notificationCount?` (number) - Number to show in badge (default: 0)

**Example:**
```tsx
import { AppShellLayout, NavSectionData } from '@/components/app-shell';

const mainSection: NavSectionData = {
  items: [
    { id: 'home', label: 'Home', icon: Icon.TYPES.HOME_OUTLINE },
    { id: 'settings', label: 'Settings', icon: Icon.TYPES.SETTINGS_OUTLINE },
  ],
};

<AppShellLayout
  pageTitle="My Feature"
  pageTabs={['Overview', 'Details', 'Settings']}
  mainNavSections={[mainSection]}
  companyName="My Company"
  userInitial="U"
>
  {/* Your page content here */}
</AppShellLayout>
```

### `TopNavBar`
Complete top navigation bar with logo, search, actions, and profile dropdown.

### `Sidebar`
Collapsible left sidebar with navigation sections.

### `SearchBar`
Global search bar with icon and input field.

### `ProfileDropdown`
Company name, user avatar, and settings dropdown (theme, mode, admin mode).

### `NavSection`
Navigation section with optional label and list of items.

### `NavItem`
Individual navigation item with icon, label, and optional submenu indicator.

## 🎯 Types

### `NavItemData`
```typescript
interface NavItemData {
  id: string;
  label: string;
  icon: string;
  hasSubmenu?: boolean;
  onClick?: () => void;
}
```

### `NavSectionData`
```typescript
interface NavSectionData {
  label?: string;  // Optional section label (e.g., "Platform")
  items: NavItemData[];
}
```

## 🚀 Usage Pattern

### 1. Define Your Navigation Structure
```tsx
const mainNav: NavSectionData = {
  items: [
    { id: 'dashboard', label: 'Dashboard', icon: Icon.TYPES.DASHBOARD_OUTLINE },
    { id: 'reports', label: 'Reports', icon: Icon.TYPES.BAR_CHART_OUTLINE },
  ],
};

const platformNav: NavSectionData = {
  label: 'Platform',
  items: [
    { id: 'settings', label: 'Settings', icon: Icon.TYPES.SETTINGS_OUTLINE },
    { id: 'help', label: 'Help', icon: Icon.TYPES.QUESTION_CIRCLE_OUTLINE },
  ],
};
```

### 2. Define Page Actions (Optional)
```tsx
const actions = (
  <>
    <Button appearance={Button.APPEARANCES.SECONDARY}>
      Cancel
    </Button>
    <Button appearance={Button.APPEARANCES.PRIMARY}>
      Save Changes
    </Button>
  </>
);
```

### 3. Wrap Your Content
```tsx
<AppShellLayout
  pageTitle="My Page"
  pageTabs={['Tab 1', 'Tab 2']}
  mainNavSections={[mainNav]}
  platformNavSection={platformNav}
  pageActions={actions}
>
  {/* Your content components here */}
</AppShellLayout>
```

## 📊 Benefits

### Before (Duplicate Code)
- **817 lines** per demo with duplicated shell code
- Manual state management for sidebar, tabs, theme
- Inconsistent styling and behavior across demos

### After (DRY Components)
- **~130 lines** per demo - focused on content only
- Automatic state management handled by components
- Consistent shell behavior across all demos
- Easy to create new app shell demos

### Code Reduction
- **~85% reduction** in boilerplate code
- **~680 lines removed** per demo
- Easier maintenance and updates

## 🔧 Customization

All components accept `theme` prop and use emotion styled components, so they automatically adapt to:
- Light/Dark mode (Berry theme)
- Admin mode (purple background for top nav)

## 📝 Examples

See working examples in:
- `src/demos/official/app-shell-demo.tsx` - Full featured demo
- `src/demos/@dvora/CompositionManager/composition-manager-demo.tsx` - Composition Manager

## 🎨 Styling

Components use Pebble design tokens for:
- Colors: `theme.colorSurface`, `theme.colorOnSurface`, etc.
- Spacing: `theme.space200`, `theme.space400`, etc.
- Typography: `theme.typestyleV2BodyLarge`, etc.
- Shapes: `theme.shapeCornerLg`, `theme.shapeCornerM`, etc.

All styling is consistent with Rippling's Pebble Design System.


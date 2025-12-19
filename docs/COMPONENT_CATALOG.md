# Pebble Component Catalog

**Quick reference for all Pebble components with AI-friendly examples.**

> **🎯 For comprehensive docs:** See [`guides/components/`](./guides/components/) for full usage guides synced from RDS Confluence space.
>
> **🎨 For design tokens:** See [`TOKEN_CATALOG.md`](./TOKEN_CATALOG.md) for colors, typography, spacing, etc.
>
> **🤖 For AI patterns:** See [`AI_PROMPTING_GUIDE.md`](./AI_PROMPTING_GUIDE.md) for usage patterns.

## ⚠️ Common Gotchas

1. **Icon sizes are numbers, not enums:** Use `size={20}`, NOT `size={Icon.SIZES.M}`
2. **Input.Text.SIZES, not Input.SIZES:** Use `Input.Text.SIZES.M`, NOT `Input.SIZES.M`
3. **Tip, not Tooltip:** In Pebble, the component is called `Tip` (import from `@rippling/pebble/Tip`)
4. **Card.Layout for containers, not Card directly:** Use `<Card.Layout>`, NOT `<Card>`. There's no `Card.ELEVATIONS` prop.
5. **TableBasic uses Tr/Th/Td, not Row/Cell:** Use `<TableBasic.Tr>`, `<TableBasic.Th>`, `<TableBasic.Td>`, NOT `TableBasic.Row` or `TableBasic.Cell`. Must wrap in `<TableBasic.THead>` and `<TableBasic.TBody>`.
6. **Always use theme tokens:** Use `theme.colorPrimary`, NOT `"#7a005d"`
7. **Use leftIconType for Dropdown/Select icons:** Don't create custom React elements as labels - use the `leftIconType` prop instead
8. **ActionCard for empty states:** Use `<ActionCard>` for empty state patterns with icon, title, description, and CTA buttons

## Table of Contents

1. [Action Components](#action-components)
2. [Input Components](#input-components)
3. [Overlay Components](#overlay-components)
4. [Layout Components](#layout-components)
5. [Display Components](#display-components)
6. [Feedback Components](#feedback-components)

---

## Action Components

### ActionCard

**Purpose:** Empty state pattern with icon, title, description, and call-to-action buttons  
**Import:** `import ActionCard from '@rippling/pebble/ActionCard';`

**ActionCard Props:**
- `icon`: `Icon.TYPES.*` - Icon displayed at top in circle
- `iconColor`: `string` - Custom icon color (theme token)
- `title`: `string` - Bold title text
- `caption`: `string | ReactNode` - Description text below title
- `primaryAction`: `{ title, onClick, to?, icon?, isDisabled? }` - Primary CTA button
- `secondaryAction`: `{ title, onClick, to?, icon?, isDisabled? }` - Secondary CTA button
- `alignment`: `ActionCard.CONTENT_ALIGNMENT.CENTER | LEFT` - Content alignment (default: CENTER)
- `animation`: `Animation.TYPES.*` - Animated icon instead of static icon

**Example (Empty State):**
```typescript
<ActionCard
  icon={Icon.TYPES.CHECKBOX_WITHCHECK_OUTLINE}
  title="Agreements"
  caption="An agreement is created once a procurement request is completed. Agreements let you store relationships with vendors, view committed spending, and track upcoming renewals."
  primaryAction={{
    title: 'Submit a request',
    onClick: () => handleSubmit(),
  }}
  secondaryAction={{
    title: 'Import existing agreements',
    onClick: () => handleImport(),
  }}
/>
```

**Example (Success State with Animation):**
```typescript
<ActionCard
  animation={Animation.TYPES.CHECK_MARK}
  title="You're all set!"
  caption="You are done setting up commuter for your employees"
  primaryAction={{
    title: 'Continue',
    onClick: () => handleContinue(),
  }}
/>
```

---

### Button

**Purpose:** Primary action trigger  
**Import:** `import Button from '@rippling/pebble/Button';`  
**Usage Guide:** [guides/components/buttons/button.md](./guides/components/buttons/button.md)

**Button Props:**
- `size`: `Button.SIZES.XS | S | M | L` - Button size
- `appearance`: `Button.APPEARANCES.PRIMARY | ACCENT | DESTRUCTIVE | SUCCESS | OUTLINE | GHOST` - Visual style
- `onClick`: `(e: React.MouseEvent) => void` - Click handler
- `disabled`: `boolean` - Disable the button
- `isLoading`: `boolean` - Show loading spinner
- `type`: `'button' | 'submit' | 'reset'` - HTML button type (default: 'button')
- `isFullWidth`: `boolean` - Stretch to container width
- `children`: `ReactNode` - Button content

**Button.Icon Props:**
- `icon`: `Icon.TYPES.*` - Icon to display (required)
- `aria-label`: `string` - Accessibility label (required)
- `size`: `Button.SIZES.XS | S | M | L` - Button size
- `appearance`: Same as Button - Visual style
- `onClick`: `(e: React.MouseEvent) => void` - Click handler
- `disabled`: `boolean` - Disable the button
- `tip`: `string` - Tooltip text on hover

**Example:**
```typescript
// Basic button
<Button 
  size={Button.SIZES.M}
  appearance={Button.APPEARANCES.PRIMARY}
  onClick={() => console.log('clicked')}
>
  Save Changes
</Button>

// Icon button
<Button.Icon
  icon={Icon.TYPES.SETTINGS_OUTLINE}
  aria-label="Settings"
  tip="Open settings"
  size={Button.SIZES.M}
  appearance={Button.APPEARANCES.GHOST}
/>
```

---

### Dropdown

**Purpose:** Menu of actions/options  
**Import:** `import Dropdown from '@rippling/pebble/Dropdown';`  
**Usage Guide:** [guides/components/dropdown-menu.md](./guides/components/dropdown-menu.md)

**Dropdown Props:**
- `list`: `ListItem[]` - Array of menu items (required)
- `onChange`: `(value: any) => void` - Callback when item selected (required)
- `shouldAutoClose`: `boolean` - Close menu after selection
- `placement`: `'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'` - Menu position
- `maxHeight`: `number` - Maximum height of dropdown menu in pixels
- `children`: `ReactNode` - Trigger element (usually a Button)

**ListItem Props:**
- `label`: `string` - Display text (required for regular items)
- `value`: `any` - Item value (required for regular items)
- `leftIconType`: `Icon.TYPES.*` - ✅ **Icon displayed on left side**
- `avatarProps`: `object` - Avatar displayed on left side
- `avatarImage`: `string` - Avatar image URL
- `flag`: `string` - Country flag code (displays flag on left)
- `isDisabled`: `boolean` - Disable this menu item
- `isSelected`: `boolean` - Show selected state (checkmark on right)
- `isSeparator`: `boolean` - ✅ **Renders a horizontal divider line** (omit label/value when true)

**Example:**
```typescript
// ✅ Correct: Use leftIconType for icons
<Dropdown
  list={[
    { 
      label: 'Edit', 
      leftIconType: Icon.TYPES.EDIT_OUTLINE, 
      value: 'edit' 
    },
    { 
      label: 'Delete', 
      leftIconType: Icon.TYPES.DELETE_OUTLINE, 
      value: 'delete' 
    },
  ]}
  onChange={(value) => handleAction(value)}
  shouldAutoClose
>
  <Button appearance={Button.APPEARANCES.GHOST}>
    Actions
  </Button>
</Dropdown>

// ✅ With separators and selected state
<Dropdown
  list={[
    { label: 'Berry Theme', value: 'berry', isSelected: true },
    { label: 'Plum Theme', value: 'plum' },
    { isSeparator: true },  // Renders divider line
    { 
      label: 'Light Mode', 
      leftIconType: Icon.TYPES.SUN_OUTLINE, 
      value: 'light' 
    },
    { 
      label: 'Dark Mode', 
      leftIconType: Icon.TYPES.OVERNIGHT_OUTLINE, 
      value: 'dark',
      isSelected: true  // Shows checkmark on right
    },
  ]}
  onChange={(value) => handleChange(value)}
  maxHeight={400}
>
  <Button>Settings</Button>
</Dropdown>

// ❌ Wrong: Don't create custom React elements
list={[
  { 
    label: <div><Icon /> Edit</div>,  // Don't do this!
    value: 'edit' 
  }
]}
```

---

## Input Components

### Input.Text

**Purpose:** Single-line text input  
**Import:** `import Input from '@rippling/pebble/Inputs';`  
**Usage Guide:** [guides/components/inputs/text-input.md](./guides/components/inputs/text-input.md)

**Input.Text Props:**
- `id`: `string` - Unique identifier (required)
- `label`: `string` - Label text above input
- `value`: `string` - Input value
- `onChange`: `(e: ChangeEvent) => void` - Change handler
- `placeholder`: `string` - Placeholder text
- `isRequired`: `boolean` - Mark as required field
- `isDisabled`: `boolean` - Disable the input
- `isReadOnly`: `boolean` - Make input read-only
- `errorMessage`: `string` - Error text below input
- `helperText`: `string` - Helper text below input
- `size`: `Input.Text.SIZES.XS | S | M | L` - Input size
- `type`: `'text' | 'email' | 'password' | 'number' | 'tel' | 'url'` - HTML input type
- `prefix`: `ReactNode` - Content before input (icon or text)
- `suffix`: `ReactNode` - Content after input (icon or text)
- `maxLength`: `number` - Maximum character length
- `autoComplete`: `string` - HTML autocomplete attribute
- `autoFocus`: `boolean` - Auto-focus on mount
- `name`: `string` - Form input name
- `onBlur`: `(e: FocusEvent) => void` - Blur handler
- `onFocus`: `(e: FocusEvent) => void` - Focus handler

**⚠️ CRITICAL: Use `Input.Text.SIZES.M`, NOT `Input.SIZES.M`**

**Example:**
```typescript
// Basic text input
<Input.Text
  id="email"
  label="Email Address"
  placeholder="you@company.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  isRequired
  size={Input.Text.SIZES.M}
/>

// With icon prefix
<Input.Text
  id="search"
  placeholder="Search..."
  prefix={<Icon type={Icon.TYPES.SEARCH_OUTLINE} size={16} />}
  size={Input.Text.SIZES.M}
/>
```

---

### Select

**Purpose:** Dropdown selection from a list  
**Import:** `import Select from '@rippling/pebble/Inputs/Select';`  
**Usage Guide:** [guides/components/inputs/select.md](./guides/components/inputs/select.md)

**Select Props:**
- `id`: `string` - Unique identifier (required)
- `isRequired`: `boolean` - Mark as required field
- `list`: `ListItem[]` - Array of options (required)
- `value`: `any` - Selected value(s)
- `onChange`: `(value: any) => void` - Selection callback
- `placeholder`: `string` - Placeholder text
- `isMulti`: `boolean` - Allow multiple selections
- `isSearchable`: `boolean` - Enable search/filter
- `isDisabled`: `boolean` - Disable the select
- `size`: `Select.SIZES.XS | S | M | L` - Input size
- `canClear`: `boolean` - Show clear button
- `creatable`: `boolean` - Allow creating new options

**ListItem Props (same as Dropdown):**
- `label`: `string` - Display text (required)
- `value`: `any` - Item value (required)
- `leftIconType`: `Icon.TYPES.*` - ✅ **Icon displayed on left side**
- `avatarProps`: `object` - Avatar displayed on left side
- `avatarImage`: `string` - Avatar image URL
- `flag`: `string` - Country flag code
- `isDisabled`: `boolean` - Disable this option

**Example:**
```typescript
<Select
  id="country-select"
  placeholder="Select country"
  list={[
    { label: 'United States', value: 'us', flag: 'US' },
    { label: 'Canada', value: 'ca', flag: 'CA' },
    { label: 'Mexico', value: 'mx', flag: 'MX' },
  ]}
  value={country}
  onChange={(value) => setCountry(value)}
/>
```

---

### Input.Checkbox

**Purpose:** Boolean toggle option  
**Import:** `import Input from '@rippling/pebble/Inputs';`  
**Usage Guide:** [guides/components/inputs/checkbox.md](./guides/components/inputs/checkbox.md)

**Input.Checkbox Props:**
- `id`: `string` - Unique identifier (required)
- `label`: `string | ReactNode` - Label text or content
- `checked`: `boolean` - Checked state
- `onChange`: `(e: ChangeEvent) => void` - Change handler
- `isDisabled`: `boolean` - Disable the checkbox
- `isIndeterminate`: `boolean` - Show indeterminate state (mixed)
- `name`: `string` - Form input name
- `helperText`: `string` - Helper text below checkbox
- `errorMessage`: `string` - Error text below checkbox

**Example:**
```typescript
<Input.Checkbox
  id="terms"
  label="I agree to the terms and conditions"
  checked={isChecked}
  onChange={(e) => setIsChecked(e.target.checked)}
/>
```

---

### Input.Switch

**Purpose:** On/off toggle  
**Import:** `import Input from '@rippling/pebble/Inputs';`  
**Usage Guide:** [guides/components/inputs/segmented-control.md](./guides/components/inputs/segmented-control.md)

**Input.Switch Props:**
- `id`: `string` - Unique identifier (required)
- `label`: `string | ReactNode` - Label text or content
- `checked`: `boolean` - Checked/on state
- `onChange`: `(e: ChangeEvent) => void` - Change handler
- `isDisabled`: `boolean` - Disable the switch
- `name`: `string` - Form input name
- `helperText`: `string` - Helper text below switch

**Example:**
```typescript
<Input.Switch
  id="notifications"
  label="Enable notifications"
  checked={isEnabled}
  onChange={(e) => setIsEnabled(e.target.checked)}
/>
```

---

### Input.Radio

**Purpose:** Single selection from multiple options  
**Import:** `import Input from '@rippling/pebble/Inputs';`  
**Usage Guide:** [guides/components/inputs/radio.md](./guides/components/inputs/radio.md)

**Input.RadioGroup Props:**
- `name`: `string` - Radio group name (required)
- `value`: `string` - Selected value
- `onChange`: `(e: ChangeEvent) => void` - Change handler
- `children`: `ReactNode` - Radio button children

**Input.Radio Props:**
- `id`: `string` - Unique identifier (required)
- `value`: `string` - Radio value (required)
- `label`: `string | ReactNode` - Label text or content
- `isDisabled`: `boolean` - Disable this radio button
- `helperText`: `string` - Helper text below radio

**Example:**
```typescript
<Input.RadioGroup
  name="plan"
  value={selectedPlan}
  onChange={(e) => setSelectedPlan(e.target.value)}
>
  <Input.Radio id="basic" value="basic" label="Basic Plan" />
  <Input.Radio id="pro" value="pro" label="Pro Plan" />
  <Input.Radio id="enterprise" value="enterprise" label="Enterprise" />
</Input.RadioGroup>
```

---

## Overlay Components

### Modal

**Purpose:** Focused dialog overlay  
**Import:** `import Modal from '@rippling/pebble/Modal';`  
**Usage Guide:** [guides/components/modal.md](./guides/components/modal.md)

**Modal Props:**
- `isVisible`: `boolean` - Show/hide modal (required)
- `onCancel`: `() => void` - Close callback (required)
- `title`: `string | ReactNode` - Modal title (required)
- `size`: `Modal.SIZES.S | M | L | XL` - Modal width
- `children`: `ReactNode` - Modal content
- `shouldNotAnimate`: `boolean` - Disable animations
- `shouldCloseOnOverlayClick`: `boolean` - Close when clicking backdrop
- `shouldCloseOnEscape`: `boolean` - Close on ESC key
- `overlayClassName`: `string` - Custom CSS class for overlay
- `className`: `string` - Custom CSS class for modal

**Modal Components:**
- `Modal.Footer` - Footer section for actions
- `Modal.CloseButton` - Pre-styled close button

**Example:**
```typescript
<Modal
  isVisible={isOpen}
  onCancel={() => setIsOpen(false)}
  title="Confirm Action"
  size={Modal.SIZES.M}
>
  <p>Are you sure you want to proceed?</p>
  
  <Modal.Footer>
    <Modal.CloseButton>Cancel</Modal.CloseButton>
    <Button appearance={Button.APPEARANCES.PRIMARY}>
      Confirm
    </Button>
  </Modal.Footer>
</Modal>
```

---

### Drawer

**Purpose:** Side panel for forms/details  
**Import:** `import Drawer from '@rippling/pebble/Drawer';`  
**Usage Guide:** [guides/components/drawer.md](./guides/components/drawer.md)

**Props:**
- `isVisible`: `boolean` (required)
- `onCancel`: `() => void` (required)
- `title`: `string` (required)
- `isCompact`: `boolean` (false = 600px, true = 400px)
- `width`: `number` (custom width in px)
- `placement`: `'left' | 'right'`

**Example:**
```typescript
<Drawer
  isVisible={isDrawerOpen}
  onCancel={() => setIsDrawerOpen(false)}
  title="User Details"
>
  <Input.Text
    id="name"
    label="Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
  
  <Drawer.Footer>
    <Button appearance={Button.APPEARANCES.PRIMARY}>
      Save
    </Button>
  </Drawer.Footer>
</Drawer>
```

---

### Tip (not Tooltip)

**Purpose:** Contextual information on hover  
**Import:** `import Tip from '@rippling/pebble/Tip';`  
**Usage Guide:** [guides/components/tooltip.md](./guides/components/tooltip.md)  
**⚠️ CRITICAL:** In Pebble, this component is called `Tip`, not `Tooltip`

**Example:**
```typescript
<Tip content="This action cannot be undone" placement="top">
  <Button appearance={Button.APPEARANCES.DESTRUCTIVE}>
    Delete
  </Button>
</Tip>
```

---

## Layout Components

### Card

**Purpose:** Container for grouping related content with consistent styling  
**Import:** `import Card from '@rippling/pebble/Card';`  
**Usage Guide:** [guides/components/cards.md](./guides/components/cards.md)

**⚠️ CRITICAL:** Card has multiple variants - use `Card.Layout` for container cards, `Card.Basic` for selectable cards, `Card.Location` for location-specific cards. Most common use case is `Card.Layout`.

**Card.Layout Props:**
- `padding`: `Card.Layout.PADDINGS.PX_0 | PX_8 | PX_16 | PX_24 | PX_32` - Internal padding (default: PX_24)
- `onClick`: `() => void` - Makes card clickable
- `theme`: `Card.Layout.THEMES.DEFAULT | SELECTABLE` - Visual theme (default: DEFAULT)
- `children`: `ReactNode` - Card content

**Available Variants:**
- `Card.Layout` - Standard container card (most common)
- `Card.Basic` - Selectable card with selection state
- `Card.Location` - Location-specific card with specialized rendering
- `Card.Group` - Groups multiple cards together
- `Card.Loader` - Loading state placeholder

**Example (Basic Container):**
```typescript
<Card.Layout padding={Card.Layout.PADDINGS.PX_24}>
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</Card.Layout>
```

**Example (Clickable Card):**
```typescript
<Card.Layout 
  padding={Card.Layout.PADDINGS.PX_24}
  onClick={() => navigate('/details')}
>
  <h2>Clickable Card</h2>
  <p>Click anywhere on this card</p>
</Card.Layout>
```

**Example (Grid of Cards):**
```typescript
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: theme.space600 
}}>
  {items.map(item => (
    <Card.Layout key={item.id} padding={Card.Layout.PADDINGS.PX_24}>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </Card.Layout>
  ))}
</div>
```

---

### Box

**Purpose:** Flexible container with spacing/layout props  
**Import:** `import Box from '@rippling/pebble/Layout/Box';`

**Box Props:**
- `padding`, `margin`: `string` - Theme spacing tokens
- `display`: `'flex' | 'grid' | 'block' | 'inline-flex'` - Display type
- `direction`: `'row' | 'column'` - Flex direction
- `alignItems`: `'center' | 'flex-start' | 'flex-end' | 'stretch'` - Cross-axis alignment
- `justifyContent`: `'center' | 'space-between' | 'flex-start' | 'flex-end'` - Main-axis alignment
- `gap`: `string` - Space between children
- `borderRadius`: `string | object` - Border radius
- `backgroundColor`: `string` - Background color (theme token)
- `children`: `ReactNode` - Box content

**Example:**
```typescript
<Box
  padding="2rem"
  display="flex"
  gap="1rem"
  alignItems="center"
  justifyContent="space-between"
>
  <Typography variant="heading">Title</Typography>
  <Button>Action</Button>
</Box>
```

---

### HStack

**Purpose:** Horizontal layout (flex row) with automatic spacing  
**Import:** `import { HStack } from '@rippling/pebble/Layout/Stack';`

**HStack Props:**
- Inherits all Box props
- Default `direction: 'row'` (horizontal)
- Default `gap: '10px'`
- `alignItems`: `'center' | 'flex-start' | 'flex-end'` - Vertical alignment
- `justifyContent`: `'space-between' | 'center' | 'flex-start' | 'flex-end'` - Horizontal alignment
- `gap`: `string` - Space between children
- `padding`, `margin`: `string` - Theme spacing tokens

**Example:**
```typescript
// Common pattern: Avatar + name + badge
<HStack gap="1rem" alignItems="center">
  <Avatar name="John Doe" size={Avatar.SIZES.S} />
  <Typography>John Doe</Typography>
  <Badge appearance={Badge.APPEARANCES.SUCCESS}>Admin</Badge>
</HStack>
```

---

### VStack

**Purpose:** Vertical layout (flex column) with automatic spacing  
**Import:** `import { VStack } from '@rippling/pebble/Layout/Stack';`

**VStack Props:**
- Inherits all Box props
- Default `direction: 'column'` (vertical)
- Default `gap: '10px'`
- `alignItems`: `'center' | 'flex-start' | 'flex-end' | 'stretch'` - Horizontal alignment
- `justifyContent`: `'center' | 'space-between' | 'flex-start'` - Vertical alignment
- `gap`: `string` - Space between children
- `padding`, `margin`: `string` - Theme spacing tokens

**Example:**
```typescript
// Common pattern: Card content with title, body, actions
<VStack gap="1rem" padding="2rem">
  <Typography variant="heading">Card Title</Typography>
  <Typography variant="body">Description text goes here.</Typography>
  <Button appearance={Button.APPEARANCES.PRIMARY}>Action</Button>
</VStack>
```

---

### Grid

**Purpose:** CSS Grid layout  
**Import:** `import Grid from '@rippling/pebble/Layout/Grid';`

**Example:**
```typescript
<Grid
  columns={3}
  gap="1rem"
  areas={`
    "header header header"
    "sidebar content content"
    "footer footer footer"
  `}
>
  <Grid.Item area="header">Header</Grid.Item>
  <Grid.Item area="sidebar">Sidebar</Grid.Item>
  <Grid.Item area="content">Content</Grid.Item>
  <Grid.Item area="footer">Footer</Grid.Item>
</Grid>
```

---

## Display Components

### Typography

**Purpose:** Text with semantic styles  
**Import:** `import Typography from '@rippling/pebble/Typography';`

**Variants:**
- `display`: 57px, Bold
- `heading`: 32px, Bold
- `body`: 16px, Regular
- `label`: 14px, Semibold

**Example:**
```typescript
<Typography variant="heading" size="large">
  Page Title
</Typography>

<Typography variant="body" size="medium">
  This is regular body text.
</Typography>
```

---

### Icon

**Purpose:** Visual indicators  
**Import:** `import Icon from '@rippling/pebble/Icon';`

**Props:**
- `type`: Icon type (e.g., `Icon.TYPES.CHECK`) - **REQUIRED**
- `size`: `number` (pixel size, e.g., 16, 20, 24) - **NOT** `Icon.SIZES.M`
- `color`: `string` (theme color token)
- `aria-label`: `string` (required for interactive icons)

**⚠️ CRITICAL: Icon does NOT have a SIZES constant. Use numeric pixel values.**

**Example:**
```typescript
const { theme } = useTheme();

// Correct ✅
<Icon 
  type={Icon.TYPES.CHECK}
  size={20}
  color={theme.colorSuccess}
/>

// Wrong ❌ - Icon.SIZES does not exist
<Icon 
  type={Icon.TYPES.CHECK}
  size={Icon.SIZES.M}  // Will crash!
/>

// Interactive icon (requires aria-label)
<Icon 
  type={Icon.TYPES.SETTINGS_OUTLINE}
  size={24}
  onClick={() => handleSettings()}
  aria-label="Open settings"
/>
```

**Common Icon Types:**
```typescript
Icon.TYPES.CHECK
Icon.TYPES.CLEAR
Icon.TYPES.SETTINGS_OUTLINE
Icon.TYPES.SUN_OUTLINE
Icon.TYPES.OVERNIGHT_OUTLINE
Icon.TYPES.CARET_DOWN
Icon.TYPES.CARET_UP
Icon.TYPES.CHEVRON_RIGHT_OUTLINE
Icon.TYPES.SEARCH_OUTLINE
Icon.TYPES.INFO_OUTLINE
Icon.TYPES.WARNING_OUTLINE
Icon.TYPES.ERROR_OUTLINE
Icon.TYPES.ORG_CHART_OUTLINE
Icon.TYPES.STAR_OUTLINE
Icon.TYPES.HEART_OUTLINE
Icon.TYPES.DOLLAR_CIRCLE_OUTLINE
```

---

### Avatar

**Purpose:** User profile picture  
**Import:** `import Avatar from '@rippling/pebble/Avatar';`  
**Usage Guide:** [guides/components/avatar.md](./guides/components/avatar.md)

**Avatar Props:**
- `image`: `string` - Image URL (✅ **preferred prop**)
- `src`: `string` - Image URL (alternative to image)
- `name`: `string` - Name for initials fallback (required for accessibility)
- `alt`: `string` - Alt text for image
- `size`: `Avatar.SIZES._2XS | XS | S | M | L | XL | _2XL` - Avatar size
- `imageBackground`: `string` - Background color
- `onClick`: `() => void` - Click handler (makes avatar clickable)
- `isSquare`: `boolean` - Use square shape instead of circle

**Example:**
```typescript
// With image (preferred)
<Avatar
  image="https://example.com/avatar.jpg"
  name="John Doe"
  alt="John Doe"
  size={Avatar.SIZES.M}
/>

// With initials fallback
<Avatar
  name="John Doe"
  size={Avatar.SIZES.M}
/>
```

---

### Badge

**Purpose:** Status indicator or count  
**Import:** `import Badge from '@rippling/pebble/Badge';`  
**Usage Guide:** [guides/components/badge.md](./guides/components/badge.md)

**Badge Props:**
- `appearance`: `Badge.APPEARANCES.SUCCESS | INFO | WARNING | DANGER | NEUTRAL` - Visual style
- `size`: `Badge.SIZES.S | M | L` - Badge size
- `children`: `ReactNode` - Badge content (text/number)
- `onClick`: `() => void` - Click handler (makes badge clickable)

**Example:**
```typescript
// Status badge
<Badge appearance={Badge.APPEARANCES.SUCCESS}>
  Active
</Badge>

// Count badge
<Badge appearance={Badge.APPEARANCES.INFO} size={Badge.SIZES.S}>
  3
</Badge>
```

---

## Feedback Components

### SnackBar

**Purpose:** Temporary notification  
**Import:** `import SnackBar from '@rippling/pebble/SnackBar';`  
**Usage Guide:** [guides/components/snackbar.md](./guides/components/snackbar.md)

**Example:**
```typescript
SnackBar.success('Changes saved successfully');
SnackBar.error('Failed to save changes');
```

---

### Spinner

**Purpose:** Loading indicator  
**Import:** `import Spinner from '@rippling/pebble/Spinner';`  
**Usage Guide:** [guides/components/spinner.md](./guides/components/spinner.md)

**Example:**
```typescript
<Spinner size={Spinner.SIZES.M} />
```

---

### ProgressBar

**Purpose:** Visual progress indicator  
**Import:** `import ProgressBar from '@rippling/pebble/ProgressBar';`  
**Usage Guide:** [guides/components/progress-bar.md](./guides/components/progress-bar.md)

**Example:**
```typescript
<ProgressBar 
  value={65} 
  max={100}
  appearance={ProgressBar.APPEARANCES.SUCCESS}
/>
```

---

## Advanced Components

### TableBasic

**Purpose:** Simple data table for displaying rows and columns of information  
**Import:** `import TableBasic from '@rippling/pebble/TableBasic';`  
**Usage Guide:** [guides/components/table-basic.md](./guides/components/table-basic.md)

**⚠️ CRITICAL:** 
- TableBasic is for displaying static data. Use DataTable for sorting/filtering/interaction.
- Uses HTML-like table structure: `THead`, `TBody`, `Tr`, `Th`, `Td` (NOT `Row` and `Cell`)
- Always wrap header cells in `<TableBasic.THead>` and body cells in `<TableBasic.TBody>`

**TableBasic Props:**
- `children`: `ReactNode` - Table structure (THead and TBody)
- `title`: `string` - Optional table title
- `width`: `number` - Width of the table container

**Sub-components:**
- `TableBasic.THead` - Table header section
- `TableBasic.TBody` - Table body section
- `TableBasic.Tr` - Table row
- `TableBasic.Th` - Header cell (use inside THead)
- `TableBasic.Td` - Data cell (use inside TBody)

**TableBasic.Th / TableBasic.Td Props:**
- `children`: `ReactNode` - Cell content
- `align`: Use `TableBasic.ALIGNMENTS.LEFT | RIGHT | CENTER` - Text alignment

**Example (Simple Table):**
```typescript
<TableBasic>
  <TableBasic.THead>
    <TableBasic.Tr>
      <TableBasic.Th>Name</TableBasic.Th>
      <TableBasic.Th>Email</TableBasic.Th>
      <TableBasic.Th>Role</TableBasic.Th>
    </TableBasic.Tr>
  </TableBasic.THead>
  <TableBasic.TBody>
    <TableBasic.Tr>
      <TableBasic.Td>John Doe</TableBasic.Td>
      <TableBasic.Td>john@example.com</TableBasic.Td>
      <TableBasic.Td>Admin</TableBasic.Td>
    </TableBasic.Tr>
    <TableBasic.Tr>
      <TableBasic.Td>Jane Smith</TableBasic.Td>
      <TableBasic.Td>jane@example.com</TableBasic.Td>
      <TableBasic.Td>User</TableBasic.Td>
    </TableBasic.Tr>
  </TableBasic.TBody>
</TableBasic>
```

**Example (With Title):**
```typescript
<TableBasic title="Team Members">
  <TableBasic.THead>
    <TableBasic.Tr>
      <TableBasic.Th>Name</TableBasic.Th>
      <TableBasic.Th align={TableBasic.ALIGNMENTS.RIGHT}>Count</TableBasic.Th>
    </TableBasic.Tr>
  </TableBasic.THead>
  <TableBasic.TBody>
    <TableBasic.Tr>
      <TableBasic.Td>Projects</TableBasic.Td>
      <TableBasic.Td align={TableBasic.ALIGNMENTS.RIGHT}>24</TableBasic.Td>
    </TableBasic.Tr>
    <TableBasic.Tr>
      <TableBasic.Td>Tasks</TableBasic.Td>
      <TableBasic.Td align={TableBasic.ALIGNMENTS.RIGHT}>156</TableBasic.Td>
    </TableBasic.Tr>
  </TableBasic.TBody>
</TableBasic>
```

---

### DataTable

**Purpose:** Interactive data table with sorting/filtering  
**Import:** `import DataTable from '@rippling/pebble/DataTable';`

**Example:**
```typescript
<DataTable
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
  ]}
  data={users}
  onSort={handleSort}
/>
```

---

### Tabs

**Purpose:** Content organization  
**Import:** `import Tabs from '@rippling/pebble/Tabs';`  
**Usage Guide:** [guides/components/tabs.md](./guides/components/tabs.md)

**Tabs Props:**
- `activeIndex`: `number` - Currently active tab index (required)
- `onChange`: `(index: number) => void` - Tab change callback
- `children`: `Tabs.Tab[]` - Tab children

**Tabs.Tab Props:**
- `title`: `string` - Tab label text (required)
- `isDisabled`: `boolean` - Disable this tab
- `badge`: `{ text: string }` - Badge object with text property (e.g., `{ text: "3" }`)

**⚠️ CRITICAL: Tabs use index-based navigation (numbers), NOT value-based (strings)**

**Variants:**
- `Tabs.LINK` - Link-style tabs (underline)
- `Tabs.SWITCH` - Switch-style tabs (filled background, button-like)
- `Tabs` (default) - Basic tabs

**Example:**
```typescript
const [activeTab, setActiveTab] = useState(0);

// Link tabs (underlined)
<Tabs.LINK activeIndex={activeTab} onChange={setActiveTab}>
  <Tabs.Tab title="Overview" />
  <Tabs.Tab title="Details" />
  <Tabs.Tab title="Settings" />
</Tabs.LINK>

// Switch tabs (button-style) with badges
<Tabs.SWITCH activeIndex={activeTab} onChange={setActiveTab}>
  <Tabs.Tab title="All" badge={{ text: "12" }} />
  <Tabs.Tab title="Active" badge={{ text: "8" }} />
  <Tabs.Tab title="Archived" badge={{ text: "4" }} />
</Tabs.SWITCH>

// Panel content
<Tabs.Panel activeIndex={0} currentIndex={activeTab}>
  Overview content
</Tabs.Panel>
<Tabs.Panel activeIndex={1} currentIndex={activeTab}>
  Details content
</Tabs.Panel>
```

---

### Accordion

**Purpose:** Collapsible content sections  
**Import:** `import Accordion from '@rippling/pebble/Accordion';`  
**Usage Guide:** [guides/components/expansion-panel.md](./guides/components/expansion-panel.md)

**Example:**
```typescript
<Accordion>
  <Accordion.Item title="Section 1">
    Content for section 1
  </Accordion.Item>
  <Accordion.Item title="Section 2">
    Content for section 2
  </Accordion.Item>
</Accordion>
```

---

## Editor Components

### RichTextEditor

**Purpose:** WYSIWYG text editing  
**Import:** `import { RichTextEditor } from '@rippling/pebble-editor';`

**Example:**
```typescript
<RichTextEditor
  editable={true}
  onError={(error) => console.error(error)}
  features={{ fileUpload: true, variables: true }}
  onChange={({ html, json }) => {
    setContent(html());
  }}
  placeholder="Start typing..."
/>
```

---

### DocumentEditor

**Purpose:** Full-page document editing  
**Import:** `import { DocumentEditor } from '@rippling/pebble-editor';`

**Example:**
```typescript
<DocumentEditor
  onError={(error) => console.error(error)}
  features={{ fileUpload: true, variables: true, page: true }}
  containerStyle={{ height: '100vh' }}
  header={<CustomHeader />}
/>
```

---

## Tips for AI Assistants

1. **Always use enums:** `Button.SIZES.M` not `"M"`
2. **Theme tokens:** `theme.colorPrimary` not `"#0000FF"`
3. **Required props:** Check each component's required props
4. **Accessibility:** Include `aria-label` for icon-only elements
5. **TypeScript:** Use proper types for values and handlers

## See Also

- [Token Catalog](./TOKEN_CATALOG.md) - Complete design token reference
- [AI Prompting Guide](./AI_PROMPTING_GUIDE.md) - Detailed usage patterns
- [Usage Guides](./guides/README.md) - Comprehensive component documentation
- [Pebble Storybook](https://pebble.rippling.dev) - Interactive examples


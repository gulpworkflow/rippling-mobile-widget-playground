# Import Patterns Guide

## Using the @/ Alias

All demos should use the `@/` alias for importing shared resources. This alias points to the `src/` directory and works from any folder depth.

### ✅ Correct (Use @/ alias)

```typescript
// Importing utilities
import { usePebbleTheme } from '@/utils/theme';
import { DURATION, EASING } from '@/utils/animation-constants';

// Importing assets
import RipplingLogo from '@/assets/rippling-logo-black.svg';

// Importing shared demo components
import ForkedSelect from '@/demos/ForkedSelect';
import AnimatedSelect from '@/demos/AnimatedSelect';
```

### ❌ Incorrect (Avoid relative paths)

```typescript
// These break when you move demos between folders!
import { usePebbleTheme } from '../utils/theme';
import { usePebbleTheme } from '../../utils/theme';
import logo from '../assets/logo.svg';
```

---

## When to Use Relative Imports

**Only use relative imports within a component's own folder:**

```typescript
// Inside src/demos/ForkedSelect/SelectControl.tsx
import { SelectProps } from './SelectControl.types';
import { helpers } from './SelectControl.helpers';
import BaseSelect from '../BaseSelect';  // Parent folder in same component
```

**Rule of thumb:** If the import crosses out of the component folder, use `@/`.

---

## Benefits

### 1. **Demos Can Move Freely**
```bash
# Move demo from private → @paul
git mv src/demos/private/my-demo.tsx src/demos/@paul/

# No import errors! All @/ imports stay valid.
```

### 2. **No Path Confusion**
```typescript
// Clear and obvious where things live:
@/utils/theme           // src/utils/theme
@/assets/logo.svg       // src/assets/logo.svg
@/demos/ForkedSelect    // src/demos/ForkedSelect
```

### 3. **Easier Refactoring**
If you reorganize the `src/` structure, you only update the `@/` alias config once (in `vite.config.mts` and `tsconfig.json`), not every import.

---

## Configuration

The `@/` alias is already configured in:

**vite.config.mts:**
```typescript
resolve: {
  alias: [
    {
      find: '@',
      replacement: path.resolve(__dirname, 'src'),
    },
  ],
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Quick Reference

| Import Type | Use |
|-------------|-----|
| Pebble components | `from '@rippling/pebble/Button'` |
| Shared utilities | `from '@/utils/theme'` |
| Assets | `from '@/assets/logo.svg'` |
| Shared demo components | `from '@/demos/ForkedSelect'` |
| Within same component | `from './ComponentTypes'` |
| Within parent folder | `from '../ParentComponent'` (only if same component group) |

---

## Examples

### Creating a New Demo

```typescript
// src/demos/@yourname/my-new-demo.tsx
import React from 'react';
import styled from '@emotion/styled';
import { usePebbleTheme } from '@/utils/theme';           // ✅ Shared utility
import Button from '@rippling/pebble/Button';             // ✅ Pebble component
import ForkedSelect from '@/demos/ForkedSelect';          // ✅ Shared demo component
import RipplingLogo from '@/assets/rippling-logo-white.svg'; // ✅ Asset

const MyDemo = () => {
  const { theme } = usePebbleTheme();
  
  return (
    <div>
      <img src={RipplingLogo} alt="Rippling" />
      <Button>Click me</Button>
      <ForkedSelect options={[]} />
    </div>
  );
};

export default MyDemo;
```

### Moving a Demo

```bash
# 1. Move the file (imports stay valid!)
git mv src/demos/private/my-demo.tsx src/demos/@paul/my-demo.tsx

# 2. Update main.tsx import
# Change: import MyDemo from './demos/private/my-demo';
# To:     import MyDemo from './demos/@paul/my-demo';

# 3. Update index-page.tsx folder property
# Change: folder: 'private'
# To:     folder: '@paul'

# Done! All internal imports still work.
```

---

## Troubleshooting

### "Cannot find module '@/utils/theme'"

1. **Check your editor:** Restart TypeScript server in VS Code/Cursor (Cmd+Shift+P → "Restart TS Server")
2. **Check tsconfig:** Make sure `"baseUrl": "."` and `"paths": { "@/*": ["./src/*"] }` are present
3. **Restart dev server:** `yarn dev` (Vite will pick up the alias)

### Imports work locally but fail in deployment

The `@/` alias is configured in both `tsconfig.json` (for TypeScript) and `vite.config.mts` (for bundling), so this shouldn't happen. If it does:

1. Check that both configs are committed
2. Verify Vercel/deployment is using the correct Node version
3. Clear build cache and redeploy

---

## Questions?

If you're unsure whether to use `@/` or relative imports:
- **Does the import leave your component folder?** Use `@/`
- **Is it within your component's own files?** Use relative `./`
- **When in doubt?** Use `@/` - it always works!


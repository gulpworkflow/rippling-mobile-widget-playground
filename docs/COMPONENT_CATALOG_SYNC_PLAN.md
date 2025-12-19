# Component Catalog Sync Plan

**Status:** Planned  
**Created:** December 19, 2024  
**Goal:** Reduce AI token costs and increase speed by syncing Component Catalog from Pebble MCP

---

## Problem

Currently, the AI workflow queries Pebble MCP for each component, which:
- Adds ~500-2000 tokens per query to the context
- Requires MCP server to be running
- Has round-trip latency for each call

## Proposed Solution

Sync the Component Catalog from MCP periodically, then use it as the **primary reference** (cache), with MCP as a fallback for detailed examples.

### New Workflow Priority

```
1. .cursorrules     → Gotchas table, tokens (always in context, FREE)
2. Component Catalog → Imports, props, usage (read once per session, CHEAP)
3. Pebble MCP        → Detailed Storybook examples only (on-demand, EXPENSIVE)
```

### Cost Comparison

| Scenario | MCP-First | Catalog-First |
|----------|-----------|---------------|
| 1 component | ~1000 tokens | ~2000 tokens (initial read) |
| 3 components | ~3000 tokens | ~2000 tokens (reuse cache) |
| 10 components | ~10000 tokens | ~2500 tokens (mostly cached) |

**Break-even:** ~2 component queries. After that, Catalog-First saves tokens.

---

## Implementation Options

### Option 1: Sync on `yarn install` (Recommended)

**Pros:**
- Always fresh when starting work
- No external dependencies (GitHub Actions)
- Works offline after install

**Cons:**
- Slower install (~30-60 seconds added)
- Requires MCP to be working during install

**Implementation:**
```javascript
// scripts/sync-component-catalog.mjs
import { spawn } from 'child_process';

async function syncCatalog() {
  // 1. Call MCP to list all components
  const components = await mcpCall('list-components');
  
  // 2. For each component, get examples (or just key ones)
  const docs = [];
  for (const component of components) {
    const info = await mcpCall('get-component-examples', { componentName: component });
    docs.push(formatForCatalog(info));
  }
  
  // 3. Write to Component Catalog
  writeFileSync('docs/COMPONENT_CATALOG.md', generateMarkdown(docs));
}
```

**package.json:**
```json
{
  "scripts": {
    "postinstall": "node scripts/setup-mcp.mjs && node scripts/sync-component-catalog.mjs"
  }
}
```

---

### Option 2: GitHub Action (Weekly Sync)

**Pros:**
- No local overhead
- Automatic, set-and-forget
- Doesn't slow down install

**Cons:**
- Could be 1-7 days stale
- Requires GitHub Actions setup
- Need to pull latest to get updates

**Implementation:**
```yaml
# .github/workflows/sync-catalog.yml
name: Sync Component Catalog

on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: yarn install
        
      - name: Sync Component Catalog
        run: node scripts/sync-component-catalog.mjs
        
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/COMPONENT_CATALOG.md
          git diff --staged --quiet || git commit -m "chore: Sync Component Catalog from Pebble MCP"
          git push
```

---

### Option 3: Hybrid (Best of Both)

Combine options for maximum flexibility:

1. **Weekly GitHub Action** syncs full catalog to main branch
2. **Optional local sync** via `yarn sync:catalog` for latest
3. **MCP fallback** for components not in catalog

**package.json:**
```json
{
  "scripts": {
    "sync:catalog": "node scripts/sync-component-catalog.mjs",
    "postinstall": "node scripts/setup-mcp.mjs"
  }
}
```

---

## Catalog Format

### Current Format (Manual)
- Hand-written descriptions
- May be outdated
- Inconsistent coverage

### Proposed Format (Auto-synced)
```markdown
## Button

**Import:** `import Button from '@rippling/pebble/Button';`  
**Storybook:** [View examples](https://rippling.design/pebble/?path=/docs/components-button--docs)

### Sub-components
- `Button.Icon` - Icon-only button

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| appearance | `Button.APPEARANCES.*` | `PRIMARY` | Visual style |
| size | `Button.SIZES.*` | `M` | Button size |
| ...

### Quick Example
\`\`\`tsx
<Button appearance={Button.APPEARANCES.PRIMARY} size={Button.SIZES.M}>
  Click me
</Button>
\`\`\`

---
```

---

## What to Sync

### Must Have (Sync These)
- Import paths
- Sub-components (e.g., `Button.Icon`, `Input.Text`)
- Available constants (e.g., `SIZES`, `APPEARANCES`)
- Basic usage example

### Nice to Have
- Full prop table
- All Storybook examples

### Skip (Use MCP On-Demand)
- Detailed accessibility notes
- Edge case examples
- Internal implementation details

---

## Update .cursorrules

After implementing, update the workflow section:

```markdown
## 🎯 Primary Directive: Speed + Accuracy

**The workflow:**
1. **Check .cursorrules first** (always loaded, instant) — has gotchas, tokens, patterns
2. **Check Component Catalog** (read once per session) — imports, props, quick examples
3. **Query Pebble MCP only when needed** — detailed examples, unfamiliar components

**Query MCP when:**
- Component not in catalog
- Need detailed Storybook examples
- Verifying complex prop combinations
- User explicitly asks "how does X work?"

**Skip MCP when:**
- Basic usage covered in catalog
- Just need import path or constants
- Following patterns already in .cursorrules
```

---

## Timeline

1. **Phase 1:** Create sync script (1-2 hours)
2. **Phase 2:** Test locally, refine format (1 hour)
3. **Phase 3:** Add to postinstall or GitHub Action (30 min)
4. **Phase 4:** Update .cursorrules workflow (15 min)

---

## Open Questions

- [ ] How many components to sync? All ~100+, or just top 30 used?
- [ ] Include full prop tables or just key props?
- [ ] Sync on every install or make it opt-in (`yarn sync:catalog`)?
- [ ] Keep manual "gotchas" separate or merge into synced catalog?

---

## Next Steps

1. Review this plan
2. Decide on sync frequency (install vs. weekly vs. manual)
3. Implement `scripts/sync-component-catalog.mjs`
4. Test with a few components first
5. Roll out to full catalog


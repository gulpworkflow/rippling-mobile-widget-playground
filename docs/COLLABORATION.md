# Collaboration Guide

This guide explains how to work with your Pebble Playground fork—solo, with teammates, and with the community.

---

## Why We Use Forks

Previous playground approaches tried to manage everyone's code in one shared repository. This led to:
- **Merge conflicts** when multiple people edited shared files
- **Repo bloat** as everyone's experiments accumulated
- **Dependency nightmares** when one person's changes broke others

**The fork model solves this:** Each person/team gets their own copy to customize freely, while still being able to pull improvements from the core repo when we release them.

---

## Working Solo

Your fork is **yours**—experiment freely without worrying about breaking anything for others.

### Daily workflow

```bash
# Start the dev server
yarn dev

# Create demos, break things, iterate
# Everything stays in your fork
git add .
git commit -m "Add employee directory demo"
git push origin main
```

### Pulling updates from core

When we release new features, component fixes, or documentation improvements:

```bash
# Fetch the latest from the core repo
git fetch upstream

# Merge into your branch
git merge upstream/main

# Resolve any conflicts if needed, then push
git push origin main
```

**Tip:** Pull updates regularly (weekly or monthly) to avoid large merge conflicts.

---

## Working With Your Team

Since you own your fork, you control who collaborates:

### Option A: Add collaborators to your fork

Best for teams working closely together on shared demos.

1. Go to your fork on GitHub → **Settings** → **Collaborators**
2. Click **"Add people"** → enter their GitHub username
3. Give them **Write** access

Now your team can all push to the same fork.

### Option B: Each person forks their own copy

Best for independent experimentation with occasional sharing.

- Each designer/developer forks the core repo (or forks your team's fork)
- Share ideas via pull requests or just share links to running demos
- More isolation, less coordination needed

### Sharing demos

Once you have something worth sharing:
- **Internal:** Share your Vercel URL or localhost screenshots
- **Cross-team:** Create a PR to a shared team fork
- **Company-wide:** PR to the core repo (see "Contributing Back" below)

---

## Deploying Your Fork

Get your demos online with Vercel (free):

1. Go to [vercel.com](https://vercel.com) → sign in or create a free account
2. Click **"Add New"** → **"Project"**
3. **Import your fork** from GitHub (not the original pbest/pebble-playground)
4. Click **Deploy**

Your playground is now live at `https://your-fork-name.vercel.app`

### Auto-deploy on every push

Once connected, Vercel automatically rebuilds whenever you push to your fork. Your demos, your deployments, your URL—no conflicts with anyone else.

---

## Contributing Back to Core

If you build something valuable, share it with everyone! We welcome contributions:

### What to contribute

- **New demo patterns** that others would find useful
- **Documentation improvements** or clarifications
- **Bug fixes** in the playground infrastructure
- **Component rendering fixes** (see below)

### How to contribute

1. Create a branch in your fork with your changes
2. Open a Pull Request to the core repo (`pbest/pebble-playground`)
3. Describe what you're contributing and why it's useful
4. We'll review and merge!

---

## 🐛 Reporting & Fixing Component Rendering Issues

Sometimes you'll encounter issues where Pebble components don't render correctly in the playground, or AI generates incorrect component code. **When you fix these issues, please share them back!**

### Common issues you might fix

- **Wrong component API** - AI uses `<IconButton>` instead of `<Button.Icon>`
- **Missing imports** - Component needs a specific import path
- **Prop mismatches** - AI passes wrong prop types or values
- **Rendering bugs** - Component displays incorrectly in the playground context

### Where fixes typically live

- **`.cursorrules`** - AI guidance and gotchas table
- **`docs/COMPONENT_CATALOG.md`** - Component documentation
- **Pebble MCP** - If the issue is in the MCP server responses

### How to share your fix

1. **Document what was broken** - What did AI generate wrong? What was the symptom?
2. **Document your fix** - What change fixed it?
3. **Open a PR to core** with:
   - Updated `.cursorrules` (add to the gotchas table if applicable)
   - Updated docs if needed
   - A brief description of the issue and fix

**Example PR description:**
```
## Fix: AI generates wrong Icon size API

**Problem:** AI kept using `<Icon size={Icon.SIZES.M} />` which doesn't exist.
**Fix:** Added to gotchas table - Icon sizes are numbers, not constants.

This was causing icons to not render for several people on my team.
```

### Why this matters

Every fix you contribute helps everyone using the playground. The gotchas table in `.cursorrules` is our collective knowledge of Pebble quirks—your contribution makes AI smarter for the whole community.

---

## Tips for Clean Upstream Merges

### Keep your customizations isolated

- Put your demos in `src/demos/` (not in core infrastructure files)
- Avoid modifying `main.tsx` more than necessary
- Use the `@/` import alias so paths don't conflict

### When conflicts happen

Most conflicts will be in:
- `src/main.tsx` - If you added routes
- `src/demos/index-page.tsx` - If you added demo cards
- `.cursorrules` - If you added custom rules

**Resolution strategy:**
1. Keep your additions (new demos, new routes)
2. Accept upstream changes to infrastructure
3. Manually merge if both sides changed the same section

### Nuclear option

If merging gets too messy, you can always:
1. Note which demos you want to keep
2. Re-fork from fresh
3. Copy your demos back in

Your demo files are the valuable part—the infrastructure can always be re-pulled.

---

## Questions?

- **Slack:** #design-systems
- **Issues:** Open an issue on the core repo
- **Docs:** Check the `docs/` folder for more guides


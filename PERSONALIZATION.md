# Personalized Workspace Feature

## Overview

The Pebble Playground now automatically personalizes each designer's workspace using their git configuration. This creates a sense of ownership and makes it clear that this is **your** personal playground for prototyping.

**This is a progressive enhancement** - it will never break the build or dev process. If git config is missing or any errors occur, the playground gracefully falls back to showing "Hi Rippler" with a default avatar.

## What It Does

When you run `yarn dev`, the playground:

1. ✅ Reads your name from `git config user.name`
2. ✅ Reads your email from `git config user.email`  
3. ✅ Generates a Gravatar URL from your email
4. ✅ Reads your GitHub username from `git config github.user` (if set)
5. ✅ Creates a `.env.local` file with your preferences
6. ✅ Displays a personalized greeting: **"Hi [YourFirstName], welcome to your Pebble Playground"**
7. ✅ Shows your avatar (GitHub → Gravatar → Initials)

### Fallback Behavior (Progressive Enhancement)

The personalization is designed to **never fail**:

- **No git config?** → Shows "Hi Rippler" with initials avatar
- **No GitHub username?** → Uses Gravatar from email
- **No email?** → Uses initials avatar from name
- **No name?** → Shows "Hi Rippler" with "User" initials
- **Script error?** → Exits successfully, shows default greeting
- **File write error?** → Continues without saving, shows default greeting

The app will always work, personalization is just a nice-to-have enhancement.

## Implementation

### Files Created/Modified

1. **`scripts/setup-user.mjs`** - Auto-configuration script
   - Reads git config
   - Generates Gravatar URL from email hash
   - Parses GitHub username from remote URL or config
   - Creates/updates `.env.local` with user preferences
   - Preserves other environment variables

2. **`src/demos/index-page.tsx`** - Homepage with personalized greeting
   - Imports `Avatar` component
   - Reads environment variables
   - Displays user's avatar and personalized greeting
   - Falls back gracefully if no user info available

3. **`src/vite-env.d.ts`** - TypeScript declarations
   - Type-safe access to `import.meta.env.VITE_USER_*` variables

4. **`package.json`** - Updated scripts
   - `yarn dev` now runs `setup-user.mjs` automatically
   - `yarn setup:user` available for manual refresh

5. **`README.md`** - Documentation updated
   - Quick Start section explains personalization
   - Notes about automatic configuration

6. **`SETUP_GUIDE.md`** - Detailed setup docs
   - Step-by-step personalization guide
   - Optional GitHub avatar configuration

## Environment Variables

Generated in `.env.local` (gitignored):

```bash
VITE_USER_NAME="Your Name"              # From git config user.name
VITE_USER_EMAIL="you@example.com"      # From git config user.email
VITE_USER_GITHUB="your-username"       # From git config github.user (must be set explicitly)
VITE_USER_GITHUB_AVATAR="https://..."  # GitHub avatar URL (only if github.user is set)
VITE_USER_GRAVATAR="https://..."       # Gravatar URL (from email hash)
```

## User Experience

### Before
```
Welcome to Pebble Playground
A prototyping environment for exploring...
```

### After
```
[Avatar] Hi Paul, welcome to your Pebble Playground
A prototyping environment for exploring...
```

## Optional: GitHub Avatar

By default, the system uses Gravatar (generated from your email). For a GitHub avatar, set your GitHub username in git config:

```bash
git config --global github.user "your-github-username"
```

Then refresh your settings:
```bash
yarn setup:user
```

> **Note:** The system cannot auto-detect your GitHub username from the remote URL because that shows the **repo owner**, not you. You must explicitly set `github.user` in your git config to get your GitHub avatar.

## Benefits for Multi-User Contribution Model

This feature is **essential** for the planned contribution structure where:

1. **Multiple designers** each have their own workspace
2. **Each person** can identify their personal playground instantly
3. **Demos** can be attributed to creators (future: auto-populate author info)
4. **Avatars** make it feel like a personal tool, not shared infrastructure
5. **Zero manual configuration** - it just works™️

## Future Enhancements

Potential additions:
- Auto-populate demo metadata with creator name/avatar
- User-specific demo favorites
- Personal theming preferences
- Activity tracking per user
- "Created by [Name]" attribution in demo cards

## Reproducibility

✅ **100% reproducible across any local clone:**
- Every developer has git configured
- No manual setup required
- Works out of the box with `yarn dev`
- Graceful fallback if git config is missing
- Personal settings stay local (`.env.local` is gitignored)

---

**Status:** ✅ Implemented and tested
**Version:** MVP (v1.0)
**Date:** November 5, 2025


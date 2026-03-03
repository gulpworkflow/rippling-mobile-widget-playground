# Widget Zones: Keep or Flatten?

## What zones give us today

1. **Slot-based redistribution after reorder** — when a user drags widgets around, the code slices the flat list back into primary/core/contextual buckets to preserve zone sizes. Without zones, reorder is just a list. Simpler.
2. **Persona mapping structure** — each persona defines which widgets go in which zone. This reads well as a spec but the zones don't actually affect rendering differently. Every zone renders the same `WidgetCard` the same way. There's no "primary zone gets a bigger card" or "contextual zone collapses on scroll."
3. **Mental model for design** — zones communicate intent (what's most important, what's supplementary). Useful for workshopping with product, aligning on hierarchy.

## The case for keeping zones in the data model

- If we ever want zones to render differently (e.g. primary widgets are larger, contextual widgets collapse), the structure is already there.
- It encodes design intent in code, which can prevent future contributors from randomly stuffing widgets anywhere.
- Platform engineers tend to appreciate typed structure because it constrains what's possible.

## The case for flattening to an ordered list

- Rendering already treats zones identically — three `.map()` calls that do the exact same thing.
- Reorder becomes trivially simple: save a flat array, render a flat array. No redistribution math.
- The zone labels can live in comments or docs as design guidance without burdening the runtime model.
- For prototyping, the simpler the model, the faster we iterate. We can always add structure back when it earns its keep.
- The "zone" concept is really about **priority ranking**, and a flat ordered list already captures that implicitly (position 1 = highest priority).

## Readability comparison

**Flat (ordered list):**

```typescript
hourly_operator: ['shift_clock', 'quick_actions', 'earnings_summary']
```

**Zoned (structured):**

```typescript
hourly_operator: {
  primary: ['shift_clock'],
  core: ['quick_actions'],
  contextual: ['earnings_summary'],
  discovery: ['apps_list'],
}
```

The zone names are valuable as **design vocabulary** but may belong in documentation/comments rather than in the runtime type system — at least until there's a real reason to render zones differently.

## When zones earn their keep

Zones become necessary if any of these become true:

- Different zones render with different card sizes, densities, or behaviors
- A backend API needs to serve zone-bucketed configs
- Zones have independent loading/error states
- Analytics need to distinguish "primary zone tap" from "contextual zone tap"

Until then, they add complexity to reorder logic and persona mapping without a runtime payoff.

## Recommendation

For a prototype: flatten. The zone names are valuable as design vocabulary and should live in docs and comments. The runtime model should be a simple ordered array.

If this hands off to platform engineers who need a backend-driven widget config API, the zone structure can be reintroduced at that layer where it has a real purpose (API contract, server-side ranking, A/B testing by zone).

# Coding Patterns

Conventions and recurring patterns for this project. Grows over time as new patterns emerge.

---

## 1. Persistence boundary

Side-effects that touch persistent storage live in modules under `app/lib/` — never inline inside components or views. Each concern gets its own module exposing a small, intention-revealing API (e.g. `getSession()` / `setSession()` / `clearSession()`).

Components and views call these helpers; they don't know or care what's behind them. When the underlying shape or backend changes, the helper absorbs the change — no migration code sprinkled across the UI.

## 2. Components

### Variants

When a component has multiple visual variants, use a string union — not boolean flags:

```jsx
// Good
<Banner accent="amber" />

// Bad
<Banner isAmber isLarge />
```

### Avoid unnecessary memoisation

Only memoise computations that are genuinely expensive. Simple maps, object spreads, and small filter operations don't need `useMemo`.

## 3. Conventions

- Source files use ES modules. Always include the `.jsx` / `.js` extension on relative imports.
- Path alias `~` maps to `app/`. Use it for cross-directory imports.
- Prefer named exports over default exports — easier to grep, easier to refactor.

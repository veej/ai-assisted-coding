# Coding Patterns

Conventions and recurring patterns for this project. Grows over time as new patterns emerge.

---

## 1. State and routing

The app does not use a routing library. `App.jsx` owns the app-wide state:

```jsx
const [session, setSession] = useState(() => getSession());
const [view, setView] = useState(session ? "home" : "login");
```

Views render based on `view`. Navigation = `setView("settings")`. The session is kept in sync with `localStorage` via `app/lib/session.js`.

Avoid threading `session` through deep prop chains. If a deeply nested component needs it, lift the action up to `App.jsx` and pass a callback down — there is no global store on purpose.

## 2. Persistence

All persistence goes through the helpers in `app/lib/`:

- `getSession()` / `setSession()` / `clearSession()`
- `getBanner()` / `setBanner()`

Components and views never read or write `localStorage` directly. This keeps the persistence boundary in one file per concern.

When the localStorage shape changes, update the helper and the test seed — never sprinkle migration code in components.

## 3. Components

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

## 4. Authentication

Sign-in is a lookup against a hardcoded user table in `app/lib/auth.js`. There is no password and no real authorization — admin-vs-user is a property on the session object, used to gate UI elements and views.

When checking admin permissions:

```jsx
if (session?.role !== "admin") {
  // hide the link, redirect, etc.
}
```

Always use optional chaining on `session` — it can be `null`.

## 5. CSS

Styling is plain CSS in `app/app.css`, organised by layer (root variables → resets → app shell → component classes). Use BEM-ish class names (`.banner`, `.banner__message`, `.banner--accent-amber`) for clarity.

The accent palette is exposed as CSS custom properties; the `Banner` component swaps `--foyer-accent` based on its `accent` prop. See `.claude/design_system_rules.md` for the palette reference.

## 6. Conventions

- Source files use ES modules. Always include the `.jsx` / `.js` extension on relative imports.
- Path alias `~` maps to `app/`. Use it for cross-directory imports.
- Prefer named exports over default exports — easier to grep, easier to refactor.

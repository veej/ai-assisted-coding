# Design System Rules

Foyer uses plain CSS in `app/app.css`. There is no component library, no Storybook, no token package. The "design system" is the set of CSS custom properties at the top of `app.css`.

## Tokens

All colors, spacings, and accents are defined as CSS custom properties under `:root` in `app/app.css`. Components reference them via `var(--foyer-…)`.

### Palette

| Token                    | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `--foyer-bg`             | App background                                  |
| `--foyer-fg`             | Primary text                                    |
| `--foyer-muted`          | Secondary text, captions                        |
| `--foyer-border`         | Subtle separators                               |
| `--foyer-surface`        | Card / panel background                         |
| `--foyer-accent`         | Currently active accent (overridden per banner) |
| `--foyer-accent-sky`     | Sky accent                                      |
| `--foyer-accent-amber`   | Amber accent                                    |
| `--foyer-accent-emerald` | Emerald accent                                  |
| `--foyer-accent-rose`    | Rose accent                                     |

When a new accent is added, register it as both a fixed `--foyer-accent-<name>` and update the `Banner` accent enum + the settings form.

### Typography

System font stack only. No web font is loaded — first paint stays fast and the look stays neutral.

### Spacing

Use multiples of `0.25rem` (4px). Avoid hardcoded pixel values inside component styles unless they are an exact one-off.

## Components

### Adding a component

1. Create the file under `app/components/` — one file per component, `PascalCase.jsx`.
2. Add a class block in `app.css` named after the component, BEM-style.
3. Reference tokens via `var(--foyer-…)` — never hardcode colors or fonts.
4. Export named: `export function MyComponent(...) { ... }`.

### Variants

When a component has multiple visual modes, drive them with a `accent` / `variant` prop and a CSS modifier class — not inline styles, not boolean flags.

```jsx
<Banner accent="amber" />
```

```css
.banner--accent-amber {
  --foyer-accent: var(--foyer-accent-amber);
}
```

### Icons

There is no icon library. If an icon is needed, paste an inline SVG. Two icons are enough for now — keep them small.

## Accessibility

- Keyboard navigation must work everywhere a mouse does.
- Form inputs need labels (`<label for>` or wrapping).
- Use semantic elements: `<button>` for actions, `<a>` for navigation, `<main>` / `<nav>` / `<header>` for landmarks.
- Color contrast ≥ 4.5:1 for body text against the surface it sits on.

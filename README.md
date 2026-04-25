# Foyer

A small internal welcome screen. Sign in, see the home banner, and (if you're an admin) configure it.

## Development

```sh
pnpm install
pnpm dev
```

Open <http://localhost:5173>.

### Sign-in

Two emails are recognised:

- `admin@foyer.local` — admin
- `user@foyer.local` — regular user

There is no password. Session is kept in `localStorage`.

## Scripts

| Script                 | What it does                      |
| ---------------------- | --------------------------------- |
| `pnpm dev`             | Vite dev server                   |
| `pnpm build`           | Production build                  |
| `pnpm preview`         | Preview the production build      |
| `pnpm lint`            | ESLint over `app/`                |
| `pnpm prettier-check`  | Prettier check                    |
| `pnpm knip`            | Unused exports / files            |
| `pnpm test:dev`        | Vitest unit tests                 |
| `pnpm test:acceptance` | Playwright + BDD acceptance tests |

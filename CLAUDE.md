# Foyer

## Project Overview

Foyer is a small internal welcome screen. People sign in, see the home banner, and (if they are admins) configure it.

## Architecture

The app is intentionally small. From the inside out:

- **`app/lib/`** — domain helpers: `auth.js` (sign-in lookup), `session.js` (localStorage session), `banner.js` (banner read/write).
- **`app/components/`** — presentational React components.
- **`app/views/`** — top-level views: `LoginView`, `HomeView`, `SettingsView`.
- **`app/App.jsx`** — owns the app state (`view`, `session`) and renders the right view.

Persistence lives entirely in `localStorage`. There is no server, no DB, no router library.

## Key Commands

All project commands are defined in `package.json` under `scripts`. Run `pnpm run` to list them.

## Implementation (TDD)

**Always use the `/tdd-implement` skill** when starting Phase 2 of the workflow — i.e. when implementing a feature whose `.feature` scenarios from Phase 1 are approved. The skill enforces the TDD discipline (implementation checklist via TaskCreate, opportunistic test-first on non-trivial pure units, mandatory reflection step after each task) that's hard to maintain by hand. See `.claude/skills/tdd-implement/SKILL.md` for the full procedure.

## Shipping (PR Workflow)

**Always use the `/ship` skill** when creating or updating a pull request that includes code changes. Never create or push a code PR without going through `/ship`. Documentation-only PRs (CLAUDE.md, skill files, workflow docs) can be pushed directly. See `.claude/skills/ship/SKILL.md` for trigger conditions and the full workflow.

When `/ship` invokes code review, report **all** issues to the user regardless of confidence score — do not filter or discard issues. The `/code-review` skill's internal scoring and threshold logic must not override this: the user will triage the issues themselves.

## Guidelines

Before starting work, read the sub-file(s) relevant to your task:

- **`.claude/git_workflow.md`** — Read before any commit, push, PR creation, or merge
- **`.claude/design_system_rules.md`** — Read before creating or modifying UI components, working with colors, typography, or spacing
- **`.claude/testing_rules.md`** — Read before writing or modifying any tests (dev, acceptance)
- **`.claude/coding_patterns.md`** — Read before working on app code (state, persistence, view switching)
- **`.claude/workflow.md`** — You MUST read this file before starting any code change and follow its phases. No exceptions.

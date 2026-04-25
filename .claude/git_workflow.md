# Git Workflow

## Branch and PR Workflow

1. Create a feature branch: `git checkout -b feat/your-feature-name`
2. Commit to the feature branch
3. Push: `git push -u origin feat/your-feature-name`
4. Create a pull request via `/ship`
5. **Only push to main if the user explicitly asks**

## Concurrent Sessions

Multiple Claude instances may work on this codebase simultaneously.

- **Always run `git status` and `git diff`** before committing
- **Only commit files you modified** — never assume all changes are yours
- **Use `git add <specific-file>`** — never `git add .` or `git commit -a`
- **Review `git diff --cached`** before committing
- If uncommitted changes exist from another session: **ask the user** before including them

## Pull Requests

**NEVER merge a PR before all CI checks pass.** Run `gh pr checks <pr-number>` and wait for all checks to show "pass". If any check is pending or failed, do not merge.

For branch protection configuration details, see `docs/github-branch-protection.md`.

## Commits

- Follow conventional commits format (feat:, fix:, docs:, etc.)
- Keep commits focused and atomic
- Always include the Claude Code footer

## Knip

This project uses [Knip](https://knip.dev/) for unused code detection.

- **Check `knip.json`** when adding new files — avoid placeholder files
- **Run `pnpm knip`** after adding files
- **Remove files from `knip.json` ignore list** once they become used

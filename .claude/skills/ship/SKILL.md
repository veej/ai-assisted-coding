---
name: ship
description: "Ship a feature: simplify code, run local CI checks, create/update PR, monitor CI, and run code review. Use when: (1) user invokes /ship, (2) user asks to push or create a PR, (3) agent determines a feature implementation is complete and ready to push."
user_invocable: true
---

# Ship

End-to-end PR shipping workflow.

## When to Trigger

This skill MUST be invoked:

1. When the user explicitly calls `/ship`
2. When the user asks to create a new PR or push/update an existing PR
3. When the agent autonomously determines that a feature implementation is complete and ready for review

## Workflow

Execute the following steps **in order**. If any step fails, stop and report the failure to the user — do not skip steps. For existing PRs, see the **Update Mode** section at the end of this document for exceptions.

### Step 0: Pre-flight

Before doing any work:

1. Verify the current branch is not `main` or `master`. If it is, **stop immediately** and warn the user.

2. Check if a PR already exists for this branch:

   ```bash
   gh pr view --json number,url 2>/dev/null
   ```

   Remember the result — it determines whether to create a PR in Step 4 and whether Update Mode applies.

3. Confirm that every code change has been verified per the Verification section in `.claude/workflow.md`. If any change has not been verified yet, run the appropriate verification method now before proceeding.

### Step 1: Rebase on main

Ensure the branch is up to date with the latest `main` before running checks:

```bash
git fetch origin main
git rebase origin/main
```

If there are merge conflicts, stop and report them to the user — do not attempt to resolve conflicts automatically.

### Step 2: Simplify

Run the `/simplify` skill to review all changed code for reuse opportunities, quality issues, and efficiency improvements.

This step may produce new commits — that is expected. Proceed to the next step once simplification is complete.

### Step 3: Local CI Checks

Read `.github/workflows/ci-dev-pr.yml` to discover the current CI jobs, then run them locally in the categories below. Read `.claude/testing_rules.md` for guidance on which test suites are relevant based on the files changed.

#### Always run

Code quality and build — these have no infrastructure dependencies:

```bash
pnpm prettier-check && pnpm lint && pnpm knip && pnpm build
```

#### Run if relevant to the changed files

- **Dev tests** (`pnpm test:dev`) — fast vitest suite.
- **Acceptance tests** — `pnpm test:acceptance` (runs `bddgen` and Playwright together).

#### Skip

Jobs that only run in CI: PR comment bots, deployment workflows.

If any check fails, fix the issues and re-run. Only proceed when all checks pass.

### Step 4: Push and Create/Update PR

1. Push the current branch to origin:

   ```bash
   git push -u origin <branch-name>
   ```

2. If no PR exists (from Step 0), create one with a minimal placeholder body:

   ```bash
   gh pr create --title "<concise title>" --body "_PR description being generated..._"
   ```

3. **Start CI monitoring in the background** — CI begins running the moment the push lands, so start watching immediately:
   ```bash
   gh pr checks <pr-number> --watch
   ```
   Do NOT block on this. Start it in the background and proceed to the next step. Report CI results to the user when they complete.

### Step 5: Demo

Run the `/demo` skill to generate the PR description (problem, solution, test plan) and record visual evidence of the feature.

This step will:

- Analyse the diff and write a structured PR body
- Generate and run a volatile Playwright test to record a demo video
- Attach evidence (video, screenshots, or a fallback note) to the PR
- Clean up all temporary files

The `/demo` skill replaces the previous PR body format — do NOT write `## Summary` / `## Test plan` manually in Step 4. The `/demo` skill handles the full PR body.

If the changes touch shared behavior that could affect existing flows, the demo should cover the full feature — not just the new/changed parts.

### Step 6: Code Review

Run the official Anthropic code review skill on the PR:

```
/code-review:code-review
```

Pass the PR number/URL to the review skill so it can analyze the changes.

Report **all** issues found by the review, regardless of their severity score. Do not filter out or discard any issue based on score — the user will triage them.

### Step 7: Session Reflection — Improve Agent Documentation

**Goal**: update `CLAUDE.md` and any of the sub-files it links to so that generalizable lessons from this session — from the interaction itself, not just the diff — become available to future sessions.

**Light gate — invoke the reflection only if at least one of these signals is present:**

- The user explicitly corrected your approach during the session ("no", "stop", "don't do X that way")
- The user validated a non-obvious choice you made ("yes, exactly", "keep doing that")
- A pattern repeated across multiple turns that isn't documented in `CLAUDE.md` or sub-files
- The automated code review from Step 6 surfaced a recurring or systemic issue, not a one-off bug

If none of these signals are present, **skip this step silently** and proceed to Step 8. Do not force updates when the session produced no generalizable learning.

**If the gate passes**, invoke the official documentation-revision skill to produce proposed updates to `CLAUDE.md` and/or the relevant sub-files:

```
/claude-md-management:revise-claude-md
```

The skill must produce *proposals* (a diff for the user to approve or reject), not direct commits. The user is the arbiter. Do not modify `CLAUDE.md` or sub-files without explicit approval of the proposed changes.

### Step 8: Report

Provide a summary to the user:

- PR URL
- Simplification changes (if any)
- Local CI check results (all passed)
- Demo evidence status (video recorded / screenshots / not available)
- CI monitoring status (in progress or completed)
- Code review findings

## Update Mode (PR already exists)

When Step 0 detects an existing PR, the skill is being invoked to push updates — typically after addressing review feedback.

The only step that may be skipped is **Simplify**. To decide, evaluate the changes since the last push:

```bash
git diff @{push}.. --stat
```

Skip Simplify only if the changes are minor (typos, lint fixes, single-line corrections). For anything more substantial (multiple files, new logic, refactored code), run it.

All other steps always run in update mode. The demo serves as verification that the code still works correctly after changes, not just as documentation of new behavior.

### Capture generic lessons from feedback — Improve Agent Documentation

**Goal**: update `CLAUDE.md` and any of the sub-files it links to so that lessons from human review feedback become available to future sessions.

Before starting the workflow, review the feedback that prompted the update — typically human review comments on the PR. Apply the same light gate used in Step 7: only act if the feedback points to a general lesson (coding style, architectural pattern, library usage, process discipline) that would apply beyond this specific PR.

If the gate passes, invoke the official documentation-revision skill to produce proposed updates to `CLAUDE.md` and/or the relevant sub-files:

```
/claude-md-management:revise-claude-md
```

The skill must produce *proposals* (a diff for the user to approve or reject), not direct commits. Never modify `CLAUDE.md` or sub-files without explicit approval of the proposed changes.

Do not add inline code comments explaining why code was changed relative to a previous version. The previous version should not have been written that way in the first place — a comment anchored to a mistake has no value once the mistake is gone. If the reasoning behind the current code is non-obvious, a comment explaining the code on its own terms is fine.

## Important Notes

- Read `.claude/git_workflow.md` before executing — respect all branch and commit conventions
- Never force-push or amend published commits
- Never merge the PR — only the user decides when to merge

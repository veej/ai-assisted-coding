---
name: demo
description: "Generate a PR description with test plan and record a video demo of the implemented feature using Playwright. Analyses the diff, writes a structured PR body (problem, solution, test plan), generates a volatile Playwright test to record a walkthrough video, and attaches evidence to the PR."
user_invocable: true
---

# Demo

Generate a PR description with test plan and visual evidence of the implemented feature.

## When to Trigger

This skill is triggered when:

1. The user invokes `/demo`
2. The `/ship` skill reaches the demo step after creating/updating a PR
3. The user asks to generate a test plan or record a demo for a PR

## Prerequisites

- A PR must exist for the current branch (or a PR number must be provided)
- The app must be buildable (`pnpm build` succeeds)
- Playwright must be installed (`pnpm exec playwright --version`)
- `playwright-cli` must be installed globally (for video upload to GitHub)

## Merged / Closed PR Support

When a PR number is provided for a PR that is already merged or closed:

1. **Diff retrieval**: Use `gh pr diff <number>` instead of `git diff main...HEAD`. This fetches the full diff directly from GitHub without needing the branch locally.
2. **PR body update**: Use `gh api` to PATCH the PR body (see Step 2). `gh pr edit` may fail on older PRs due to GitHub API issues.
3. **Video recording**: The demo must reflect the state of the codebase at the time the PR was merged, not the current state of `main` (which may have diverged). Follow this strategy:
   - Retrieve the merge commit SHA via `gh pr view <number> --json mergeCommit --jq '.mergeCommit.oid'`
   - Check out the merge commit in a detached HEAD: `git checkout <merge-commit-sha>`
   - Install dependencies (`pnpm install`) and build (`pnpm build`)
   - If the build fails, fall back to recording on `main` and note the caveat in the Evidence section
   - After recording, return to the original branch: `git checkout -`
4. **Everything else**: The rest of the workflow (test generation, evidence, cleanup) remains identical.

## Workflow

### Step 1: Analyse the Changes

1. Determine how to retrieve the diff:
   - **Active branch (default)**: Run `git diff main...HEAD`
   - **Merged/closed PR**: Run `gh pr diff <number>` to fetch the diff from GitHub
2. Read the changed files to understand the feature at a deeper level — focus on routes, components, use cases, and domain entities
3. If a Notion spec or Figma link is referenced in commit messages or branch name, fetch it for additional context

Build a mental model of:

- **What problem was solved** — the motivation behind the changes
- **What the solution does** — how the user interacts with the new/changed feature
- **Which pages/routes are affected** — where to navigate in the app to see the changes

### Step 2: Write the PR Body

Update the PR body. For active PRs, use `gh pr edit <number> --body "..."`. For merged/closed PRs, use:

```bash
gh api repos/{owner}/{repo}/pulls/{number} -X PATCH -f body="..."
```

Use this structure:

```markdown
## Problem

<!-- 2-4 sentences describing what existed before and why it needed to change.
     Focus on the user/business need, not technical details. -->

## Solution

<!-- 2-4 sentences describing the approach at a high level.
     Mention key architectural decisions if relevant. Do NOT list files changed. -->

## Test plan

<!-- Numbered steps a reviewer can follow to verify the feature manually.
     Be specific: include URLs, user actions, and expected outcomes. -->

1. Navigate to `/laboratory`
2. Verify the isometric grid displays instruments from the lab config
3. ...

## Evidence

_Recording demo..._
```

Guidelines for writing the PR body:

- **Problem**: Write from the perspective of the user or business need, not "the code needed refactoring"
- **Solution**: Keep it high-level. A reviewer should understand the approach without reading code
- **Test plan**: Each step should be independently verifiable. Include exact URLs, button labels, and expected outcomes. Cover the happy path first, then edge cases

### Step 3: Generate the Demo Test

Write a Playwright test file at `tests/e2e/pr-demo.spec.ts` that walks through the feature.

**This is throwaway code** — it won't be committed. But it should use the project's existing test infrastructure to avoid wrong URLs and broken selectors.

#### Discover and use existing page objects

Before writing the test, glob `tests/e2e/pages/**/*` to find available page objects, read them, and understand what navigation helpers, locators, and interaction methods they expose. Then:

- **Use page object locators and methods** — never write raw selectors for elements that a page object already exposes (e.g., use `mapPage.closeTooltip()` instead of `page.locator('[role="presentation"] button[aria-label]')`)
- **Use page object navigation** — page objects know the correct URLs; don't hardcode routes in the test
- **Extend page objects if needed** — if the demo needs a locator or action not yet in a page object, add it there (it benefits future E2E tests too). Only define locators inline if they are truly one-off and unlikely to be reused

#### Test structure

The test must:

- Import `authenticatedTest` from `./fixtures` (or `test` from `./fixtures` for unauthenticated flows like login)
- Enable video recording and slow motion:
  ```ts
  test.use({
    video: { mode: "on", size: { width: 1280, height: 720 } },
    launchOptions: { slowMo: 300 },
  });
  ```
- Set a generous timeout (`test.setTimeout(120000)`) — slowMo + pauses add up
- **Use hard assertions (`expect()`) throughout** to verify the feature is loaded and working. If something is wrong, the test should fail immediately. Recording a broken state is worse than no recording at all.
- Follow the same steps described in the test plan
- Use generous `waitForSelector` / `waitForURL` calls between interactions for stability
- Use `waitForTimeout` **only for video pacing** between major visual steps (1–2s pauses so the viewer can see what happened). Never use it as a substitute for waiting on DOM conditions.

#### Caption overlay in the video

The demo test must include **caption overlays** so the video is self-explanatory without reading the test plan.

**Import the helpers** from `tests/shared/demo-captions.ts`:

```ts
import { setupCaptionOverlay, showCaption } from "../shared/demo-captions";
```

**Setup**: call `setupCaptionOverlay` as the first line of the test, before `page.goto()`. It uses `addInitScript` so the overlay survives navigations:

```ts
await setupCaptionOverlay(page);
```

The overlay is a floating pill (`bottom: 80px`, semi-transparent black background, white text) that does not interfere with the app or test assertions (`pointer-events: none`). Captions replace each other immediately — no fade-out between steps.

**Rules for writing captions:**

1. **One caption per test plan step** — the text is a concise, descriptive rephrasing of the step
2. **Descriptive tone, not technical** — write for PR reviewers watching the video, not for code readers
   - Good: `"Filtering results by expiration date"`
   - Bad: `"Click on DatePicker and select date"`
3. **Duration**: `2000` ms (default) for normal actions, `3000` ms for steps where the result needs time to be observed (e.g., after a submit, a page load, a transition)
4. **Final caption**: the last step must show the final result with a `✅` prefix and 3-second pause, so the video ends clearly showing the outcome
5. **Caption text derives from the test plan** — each numbered step in the PR body maps to one caption, rephrased as a short descriptive sentence

### Step 4: Run the Demo Test

1. Ensure the app is built:

   ```bash
   pnpm build
   ```

2. Run the demo test:

   ```bash
   pnpm exec playwright test tests/e2e/pr-demo.spec.ts --config playwright.config.ts
   ```

3. Locate the video file — it will be in `test-results-e2e/` under a path like:
   ```
   test-results-e2e/pr-demo-PR-demo-feature-description-chromium/video.webm
   ```

If the test fails:

- Read the error and fix the test file (common issues: wrong selectors, timing, missing env vars)
- Retry up to 2 times with fixes
- If it still fails after fixes, report the failure to the user

### Step 5: Upload Video to PR

#### Convert video

```bash
# Convert to MP4 (better compatibility)
ffmpeg -i test-results-e2e/<test-folder>/video.webm -c:v libx264 -preset fast -crf 23 -c:a aac tests/demo/demo.mp4 -y
```

If ffmpeg is not available, copy the webm as-is:

```bash
cp test-results-e2e/<test-folder>/video.webm tests/demo/demo.webm
```

#### Upload via playwright-cli

Use the bundled upload script to upload the video directly to the PR body on GitHub:

```bash
.claude/skills/demo/upload-video-to-pr.sh <pr-url> tests/demo/demo.mp4
```

The script uses `playwright-cli` with a persistent browser profile. It opens the PR page headless, enters edit mode, uploads the video via GitHub's hidden file input (`setInputFiles` on the `#fc-<issue-id>-body` input + `dispatchEvent('change')`), moves the generated `user-attachments` URL into the Evidence section, and clicks "Update comment".

**One-time setup** (if not already authenticated):

```bash
playwright-cli open https://github.com/login --persistent --headed --browser=chrome
# User logs in manually in the headed browser, then close:
playwright-cli close
```

#### Fallback: manual upload

If `playwright-cli` is not available or the upload fails:

1. **Update the PR body** — replace the Evidence section with a warning (this is for PR reviewers):

   ```markdown
   ## Evidence

   ⚠️ Automatic video upload failed. A demo video was recorded but could not be attached.
   ```

2. **Print instructions in the terminal** — tell the developer how to upload manually:

   ```
   ⚠️ Video upload failed. The demo video is at: tests/demo/demo.mp4
   To attach it manually:
     1. Open the PR in your browser
     2. Edit the description
     3. Drag tests/demo/demo.mp4 into the Evidence section
     4. Save
   ```

3. **Do NOT delete `tests/demo/`** during cleanup — the developer needs the file to upload manually.

### Step 6: Cleanup

1. Delete the temporary test file:

   ```bash
   rm -f tests/e2e/pr-demo.spec.ts
   ```

2. Delete raw Playwright test results:

   ```bash
   rm -rf test-results-e2e/pr-demo-*
   ```

3. Delete the converted video — **only if upload succeeded**:

   ```bash
   rm -rf tests/demo/
   ```

   If using the manual upload fallback, **do NOT delete** `tests/demo/` — the developer needs the file.

4. Do NOT commit any demo artifacts or test files.

## Important Behaviours

1. **The test plan is the primary deliverable** — the video is supplementary evidence. Even without a video, the PR body with problem/solution/test plan is valuable.
2. **Hard assertions everywhere** — every interaction in the demo test must be gated by a hard `expect()`. If the feature isn't loaded, the page shows a placeholder, or an interaction fails, the test must fail immediately. Recording a broken state is useless.
3. **Use page objects first** — discover and use existing page objects in `tests/e2e/pages/` for navigation, locators, and interactions. Extend them if the demo needs something new. Only use inline locators for truly one-off elements.
4. **Never commit demo files** — the test file and video are ephemeral. Always clean up after upload.
5. **Match the test to the test plan** — the video should demonstrate exactly the steps listed in the test plan, in order.
6. **Graceful degradation** — automated upload → warning on PR + terminal instructions for manual upload → no evidence note. Never block the PR on evidence generation failure. Developer-facing instructions belong in the terminal, not on the PR.
7. **Respect existing PR body** — if the PR already has a body with content the user wrote, preserve it and add/update only the structured sections.

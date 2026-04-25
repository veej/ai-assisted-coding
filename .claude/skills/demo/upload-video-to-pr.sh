#!/usr/bin/env bash
# Upload a video file to a GitHub PR body's Evidence section using playwright-cli.
#
# Usage: ./upload-video-to-pr.sh <pr-url> <video-path>
# Example: ./upload-video-to-pr.sh https://github.com/buildo/brooks-pathfinder-connect/pull/71 tests/demo/demo.mp4
#
# Prerequisites:
# - playwright-cli installed globally
# - gh CLI authenticated
# - One-time GitHub login: playwright-cli open https://github.com/login --persistent --headed --browser=chrome
#
# Flow:
# 1. Opens the PR page (headed, so you can watch)
# 2. Clicks hamburger → Edit comment
# 3. Uploads video via the hidden file input (fc-<textarea-id>)
# 4. Clicks "Update comment" (URL is at top of body — ugly but saves)
# 5. Uses gh API to move the URL into the Evidence section (clean text manipulation)

set -euo pipefail

PR_URL="${1:?Usage: $0 <pr-url> <video-path>}"
VIDEO_PATH="${2:?Usage: $0 <pr-url> <video-path>}"

# Resolve to absolute path
VIDEO_PATH="$(cd "$(dirname "$VIDEO_PATH")" && pwd)/$(basename "$VIDEO_PATH")"

# Extract owner/repo and PR number from URL
PR_NUMBER=$(echo "$PR_URL" | grep -o '[0-9]*$')
REPO=$(echo "$PR_URL" | sed 's|https://github.com/||;s|/pull/.*||')

if [[ ! -f "$VIDEO_PATH" ]]; then
  echo "Error: Video file not found: $VIDEO_PATH" >&2
  exit 1
fi
for cmd in playwright-cli gh; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: $cmd not found." >&2; exit 1
  fi
done

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_eval_str() {
  local raw
  raw=$(playwright-cli eval "$1" 2>&1 | awk '/^"/{print; exit}')
  raw="${raw#\"}"
  raw="${raw%\"}"
  printf '%s' "$raw"
}

# ---------------------------------------------------------------------------
# Phase 1: Browser — upload file and save
# ---------------------------------------------------------------------------

echo ">> Opening browser and navigating to PR..."
playwright-cli open --persistent --headed --browser=chrome >/dev/null 2>&1
playwright-cli goto "$PR_URL" >/dev/null 2>&1

# Auth check (single eval, no sleep — goto already waited for load)
LOGIN_CHECK=$(_eval_str "document.querySelector('meta[name=\"user-login\"]')?.content || 'NOT_LOGGED_IN'")
if [[ "$LOGIN_CHECK" == "NOT_LOGGED_IN" ]]; then
  echo "Error: Not authenticated. Run: playwright-cli open https://github.com/login --persistent --headed --browser=chrome" >&2
  playwright-cli close >/dev/null 2>&1; exit 1
fi
echo ">> Authenticated as: $LOGIN_CHECK"

# Single run-code call: edit → upload → save (replaces 6+ separate CLI calls)
echo ">> Editing, uploading, and saving..."
playwright-cli run-code "async page => {
  // Open kebab menu via <details>/<summary> (GitHub uses details-overlay, not a button)
  const summary = page.locator('.timeline-comment-actions details summary').first();
  await summary.click();
  await page.waitForTimeout(500);

  // Click 'Edit' in the dropdown menu
  const editBtn = page.locator('.timeline-comment-actions details[open] .dropdown-menu button', { hasText: 'Edit' });
  await editBtn.click();

  // Wait for textarea to appear
  const ta = page.locator('textarea[name=\"pull_request[body]\"]');
  await ta.waitFor({ state: 'visible', timeout: 10000 });
  const taId = await ta.getAttribute('id');

  // Count existing attachment URLs before upload
  const countUrls = (v) => (v.match(/user-attachments/g) || []).length;
  const urlCountBefore = countUrls(await ta.inputValue());

  // Upload video via hidden file input
  const fileInput = page.locator('#fc-' + taId);
  await fileInput.setInputFiles('${VIDEO_PATH}');
  await fileInput.dispatchEvent('change');

  // Poll until a NEW attachment URL appears (not just any existing one)
  for (let i = 0; i < 90; i++) {
    await page.waitForTimeout(500);
    if (countUrls(await ta.inputValue()) > urlCountBefore) break;
    if (i === 89) throw new Error('Upload timed out after 45s');
  }

  // Save and wait for edit mode to close (replaces snapshot + click + sleep 3)
  await page.getByRole('button', { name: 'Update comment' }).click();
  await ta.waitFor({ state: 'hidden', timeout: 10000 });
}" >/dev/null 2>&1

playwright-cli close >/dev/null 2>&1
echo ">> Upload and save complete"

# ---------------------------------------------------------------------------
# Phase 2: gh API — move URL into Evidence section
# ---------------------------------------------------------------------------

echo ">> Repositioning video URL into Evidence section..."
BODY=$(gh api "repos/${REPO}/pulls/${PR_NUMBER}" --jq '.body')

VIDEO_URL=$(echo "$BODY" | grep -o 'https://github.com/user-attachments/assets/[a-f0-9-]*' | head -1)
if [[ -z "$VIDEO_URL" ]]; then
  echo ">> Warning: could not find upload URL in saved body. Check PR manually."
  exit 0
fi

# Remove URL from current position and clean up blank lines
BODY_CLEAN=$(echo "$BODY" | sed "s|${VIDEO_URL}||" | cat -s)

# Replace Evidence placeholder content with the video URL
if echo "$BODY_CLEAN" | grep -q "^## Evidence"; then
  # Replace everything between "## Evidence" and the next "---" with the video URL
  BODY_NEW=$(echo "$BODY_CLEAN" | awk -v url="$VIDEO_URL" '
    /^## Evidence/ { print; print ""; print url; print ""; skip=1; next }
    skip && /^---/ { skip=0 }
    skip { next }
    { print }
  ')
else
  BODY_NEW="${BODY_CLEAN}

## Evidence

${VIDEO_URL}"
fi

gh api "repos/${REPO}/pulls/${PR_NUMBER}" -X PATCH -f body="$BODY_NEW" --jq '.html_url'
echo ">> Done! Video is in the Evidence section."

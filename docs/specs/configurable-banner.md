# Configurable home banner

## Background

The home banner currently shows a fixed greeting that we set in code. We want
admins to be able to update it without a code change so they can use it for
weekly announcements, reminders, and small "this is what we're focused on" notes.

## Goals

- An admin can edit the home banner from inside the app.
- A regular user cannot edit it, and shouldn't even see the entry point.
- Whatever the admin saves shows up on the home page for everyone signed in.

## Requirements

- **R.1** — An admin can change the welcome message.
- **R.2** — An admin can change the banner accent colour from a fixed palette.
- **R.3** — A regular user cannot reach the settings page and is not shown an
  entry point to it.

## UX notes (PM)

- The settings page lives under "Settings" in the top navigation, but only
  for admins.
- After saving, the admin should land back on the home page (or, at minimum,
  see the updated banner).
- Use the same accent palette as the existing banner component (sky / amber /
  emerald / rose).

## Decisions (resolved during AC review)

The following points were not in the original AC and were decided with PM:

- **Empty message** — Saving an empty (or whitespace-only) message is **not allowed**. The form's submit button stays disabled until the message has at least one non-whitespace character.
- **Message length** — Soft cap at 140 characters. Beyond that, the input refuses to accept more characters; no "you exceeded" error needed.
- **Pre-fill** — The settings form opens with the current message and accent pre-filled.
- **Where does the admin land after saving** — The admin returns to the home page automatically and sees the updated banner.
- **Banner update for other signed-in users** — Out of scope. The next time a signed-in user navigates to home (or refreshes), they see the new banner. We do not push a real-time update.
- **Save failure** — `localStorage` set is treated as effectively infallible for this app's quota. No error path needed.
- **Entry point hidden vs forbidden** — A regular user must not see the "Settings" link in the navigation. If they somehow get to the settings view (e.g. devtools, a stale tab), they must not be able to read or edit anything — they should be sent back to the home view.

## Out of scope

- Banner versioning / history.
- Undo.
- Scheduling future banners.
- Multi-language banners.
- Real-time propagation to other signed-in tabs / users.

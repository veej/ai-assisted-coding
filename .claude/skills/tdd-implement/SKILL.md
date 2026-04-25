---
name: tdd-implement
description: "Drive disciplined TDD implementation of a feature whose acceptance scenarios are already defined and approved (typically BDD/Gherkin .feature files, but any executable acceptance specification works). Use this skill whenever the user asks to start implementing a feature, says things like 'let's build this', 'time to code', 'now write the implementation', or invokes /tdd-implement directly. The skill builds an implementation checklist via TaskCreate from the approved scenarios, runs a per-task loop with opportunistic test-first for non-trivial pure units (transformations, parsers, validators, calculators, branching logic) and a mandatory reflection step to catch missing unit and regression tests, and ends only when all acceptance tests are green. Don't bypass this skill in favour of writing code straight through — the discipline it enforces (no upfront test enumeration, no end-of-feature test back-fill, single-unit cycles, reflection after each task) is exactly what's hard to maintain by hand."
user_invocable: true
---

# TDD Implement

Drive the implementation of a feature whose acceptance scenarios are already approved.

The skill exists to enforce a discipline that's hard to maintain by hand: **acceptance tests are the destination**, a **per-task checklist** is the path, and after each task a **reflection step** catches the unit and regression tests that would otherwise get forgotten. Without this scaffolding, two failure modes are common — enumerating tests upfront (impossible: internal seams don't exist yet) or writing all the code first and back-filling tests (which produces tests that rationalise existing code rather than challenge it).

## Prerequisites

Stop and report if any of these is missing:

- The acceptance scenarios for the feature are written and the user has approved them (typically `.feature` files in BDD/Gherkin, but any executable acceptance specification works)
- If the project tracks acceptance coverage in a manifest (e.g. a `test-plan.yaml`), it is up to date
- The current branch is not the integration branch (`main`/`master`/`develop`/etc.)

## Workflow

### Step 0 — Wire up the acceptance tests

- Write step definitions (or equivalent) for each approved scenario
- Run the acceptance suite. All scenarios should fail — the feature isn't implemented yet. If any scenario passes, stop and verify whether it falls into one of the few cases where passing from the start is legitimate:
    - **Negative scenarios** — verifying a behaviour does *not* happen for some users or conditions (e.g. "non-admin users do not see the admin panel" passes because the panel doesn't exist yet, which is exactly what the scenario checks)
    - **Default-state scenarios** — verifying behaviour that already matches the system's default (e.g. a toggle defaults to off, the scenario checks the off state)
    - **Backward-compatibility scenarios** — verifying that an existing flow still works alongside the new feature
- For each scenario that passes from the start, briefly state *why* it passes and confirm the reason aligns with the requirement. If you can't articulate a clear reason, treat it as a false positive: the step definition isn't exercising the missing behaviour, rewrite it until the test fails for the right reason.

### Step 1 — Build the implementation checklist

Derive an implementation checklist from the approved scenarios. Roughly one task per scenario, but it's fine to:

- **Split** a scenario across multiple tasks if it touches several layers of the codebase (e.g. data layer → business logic → API → UI)
- **Merge** trivial scenarios into a single task

Each task should be sized to *one coherent chunk that produces visible progress and moves at least one acceptance scenario closer to green*.

Create the checklist using **TaskCreate**. The list is the source of truth for the implementation flow — it makes progress visible and prevents drift on long sessions. If a task turns out to be sized wrong (too big, too small, missing dependency on another task), update it via TaskUpdate before proceeding. Don't silently deviate from the list.

### Step 2 — Run the per-task loop

For each task in order, mark it `in_progress` via TaskUpdate, then:

1. **Implement the task top-down** through the project's layers. While implementing, apply **opportunistic test-first**: when about to introduce a pure unit whose correctness is **non-trivial** — logic with multiple plausible paths, rules not obvious by inspection, edge-case handling that could silently go wrong — pause, write its unit test first, run it (red), implement minimally (green), resume. The threshold is the same as for the reflection step in sub-step 3: trivial branches, field-for-field mappings, and thin wrappers do not qualify (see *What does NOT need a dedicated test* below). One unit per cycle — never define several new functions and then test them in batch.

2. **Run the acceptance scenario(s) the task should advance** to confirm progress.

3. **Reflection step before closing the task.** Scan the diff and ask:
    - Did I introduce **non-trivial** logic that is easy to get wrong or silently regress — branching whose correctness isn't obvious by inspection (multiple plausible paths, subtle ordering, interacting conditions), calculations or transformations whose rules aren't visible at a glance, edge-case handling (empty/boundary/error) that acceptance scenarios don't exhaustively exercise? If yes and no test exists, write a unit test. **The presence of a branch or a transformation is not enough on its own** — a simple `if admin return X else return Y` or a direct field mapping does not need a test.
    - Did I introduce a **new user flow, new visual component, or new interactive UI** that isn't already covered by an acceptance scenario or an existing E2E/visual/a11y test? If yes, write a targeted regression test (E2E, visual snapshot, accessibility check — using the project's own tooling).

   Apply these sparingly. Acceptance tests are the primary safety net; unit and regression tests exist only to protect logic that could fail silently in ways acceptance might miss. If you're unsure whether the logic is "easy to get wrong", skip it — erring on fewer tests is the right default. **One test at a time, never in batch**, even when reflection identifies multiple gaps.

4. **Mark the task `completed`** via TaskUpdate and move on.

### Step 3 — Done condition

The skill is complete when:

- Every checklist task is marked complete
- Every acceptance test is green
- No previously-passing test has regressed

There is no human checkpoint between tasks. Involve the user only at the end of the implementation or when genuinely blocked.

## What does NOT need a dedicated test

The reflection step shouldn't produce trivial tests — they're noise that erodes signal and slows down future refactoring. Skip a dedicated test when the unit is:

- A wrapper around a library call (one-line passthrough)
- A getter, setter, or simple property accessor
- An object construction without logic
- A pure routing function (input identifier → handler/component)
- A type guard that just checks `typeof`
- A formatter that delegates entirely to a library
- A **branch or mapping whose correctness is obvious by inspection** — e.g. a direct boolean dispatch (`if admin return X else return Y`), a field-for-field mapping, a validation that just delegates to a schema library

The criterion when in doubt: **could this function silently produce a wrong result if someone edited it carelessly?** If yes, it earns a test. If no, skip it.

## Watch out: post-hoc tests can be weak

Tests written **after** the implementation tend to be rationalisations of the code that exists — they pass on the first run because they were written to match what's there, not to challenge it. A weak test gives false confidence and won't catch regressions.

When a post-hoc test covers logic with non-trivial conditional behaviour, sanity-check it by **mutation**:

- Deliberately break the implementation (invert a comparison, return a constant, drop a branch) and re-run the test
- If the test still passes with the broken implementation, the test isn't actually checking the logic — strengthen the assertions
- Revert the mutation once the test is doing its job

This is overhead and not required for every test. Apply it where the logic genuinely needs protection.

## Code quality checks (optional during the loop)

On long implementation sessions with many intermediate commits, run the project's quality checks (formatter, type checker, linter, dead-code detection, duplication detection) periodically to keep entropy down. This is convenience, not a gate — the definitive run happens when shipping. Don't run them on every commit.

## Important behaviours

1. **TaskCreate is mandatory.** No checklist means no implementation. The list is what makes progress visible and prevents drift.
2. **The single-unit rule is non-negotiable.** One new function/class/transformation per test cycle. The whole point of TDD is that each test challenges something specific — batching defeats it, both for opportunistic test-first and for post-hoc tests.
3. **The reflection step is non-skippable.** Every task ends with the five reflection questions before it can be marked complete. If the diff is trivial and there's nothing to reflect on, say so explicitly and move on.
4. **Don't ask for confirmation between tasks.** Run the loop end-to-end. Stop only at the done condition or when genuinely blocked.

---
name: challenge-ac
description: "Analyse acceptance criteria before starting implementation. Reads the AC from any source (Notion, Confluence, local file, pasted text), explores relevant codebase context, and produces a structured list of questions grouped by target audience (PM, designers, dev lead). Use this skill whenever the user shares AC, user stories, or requirements and asks to review them, challenge them, find gaps, or check what's missing before coding. Also trigger when the user provides a Notion/Confluence/Figma link and asks to prepare for implementation, or says things like 'let's check these AC' or 'what should we clarify before starting'."
user-invocable: true
---

# Challenge AC

Analyse acceptance criteria before implementation to surface gaps, ambiguities, and edge cases early.

## Workflow

### Step 1: Fetch the Acceptance Criteria

The user provides the AC in one of the following formats. Use the appropriate tool to retrieve the content:

| Input | How to fetch |
|-------|-------------|
| **Notion page URL** | Use the Notion MCP tool `notion-fetch` |
| **Confluence page URL** | Use the Atlassian MCP tool to fetch the page |
| **Local file** (`.md`, `.pdf`, `.docx`, `.txt`) | Use the Read tool to read the file |
| **Pasted text** | Use directly — no fetching needed |
| **Web URL** | Use the WebFetch tool |
| **Figma URL(s)** (optional) | Use the Figma MCP tool `get_design_context` to fetch each design frame |

The user may also provide one or more **Figma links** alongside the AC. Multiple links are encouraged — different frames often cover different states of the same feature (e.g., default view, selected/highlighted state, empty state, confirmation dialog). If provided, fetch the design context for each link. If not provided, ask the user whether Figma designs exist for this feature — if they do, request the links before proceeding. If certain states appear to be missing from the provided designs, mention this in the report so the user can supply additional frames.

After fetching:

1. Extract all acceptance criteria, user stories, and any supporting context (descriptions, notes, constraints)
2. If a Figma design was provided, note which visual/interaction details are covered by the design
3. Present a brief summary of what was fetched so the user can confirm it's the right content

### Step 2: Explore the Codebase

Explore the codebase to build domain context — understand the vocabulary, existing patterns, and data model so you can judge whether the AC is complete. This is background knowledge, not the basis for your findings. A good question should stand on its own even without codebase context.

Focus on:

1. **Domain vocabulary** — What entities and concepts already exist? This helps you spot when the AC uses a term ambiguously or assumes context.
2. **Data model** — What data is available? This helps you notice when the AC references information without defining where it comes from.
3. **Existing patterns** — What similar features exist? This gives you a sense of what the AC can reasonably leave implicit vs. what genuinely needs clarification.

Use the Explore agent or direct Glob/Grep/Read tools. Keep exploration proportional — you're building context, not auditing the codebase.

### Step 3: Analyse and Challenge

**Start from the requirements themselves, not from the code.** Read each AC and challenge it purely on its own merits: is it clear? Complete? Testable? Only then use codebase context as supporting evidence where it strengthens a point.

Every finding must be a question about the *requirements*, not a gap in the codebase. The reason this matters is that this report goes to PMs and designers who need to make decisions — "no charting library exists" or "this data isn't persisted yet" are implementation concerns that don't help them. Apply the **blank-slate test**: if the codebase were empty, would this still be a valid question about the AC? If not, drop it.

#### Ambiguities
- Vague or undefined terms (e.g., "the system should handle errors appropriately" — what does "appropriately" mean?)
- Unclear scope boundaries (what's included vs. excluded)
- Unspecified subjects (who performs the action? which component?)

#### Missing Behaviours

Use this as a reference for the kinds of things that are commonly left out of AC — not as a checklist to complete. Only raise items that are genuinely ambiguous for *this specific* AC.

- **Error scenarios**: What happens when the action fails? Are non-permissible actions prevented by the UI or shown as error messages?
- **Empty states**: What should appear when there's no data?
- **Loading states**: What does the user see while waiting?
- **Refresh behaviour**: Does data refresh manually, automatically, or on events? What triggers it?
- **Navigation edge cases**: What happens on browser back? What about leaving a page with unsaved changes?
- **Multi-state fields**: If a field or element can have multiple states, are all states defined?
- **Search and filters**: Which fields are searchable? How do multiple filters combine (AND/OR)? What appears when search/filters return no results?
- **Sorting**: What is the default sort order for lists and tables?
- **Limits and overflow**: Is there a max number of items? What happens when exceeded?
- **Form constraints**: Which fields are mandatory? Are there character limits, numeric bounds, or format requirements?
- **Edge cases**: Boundary values, large datasets, concurrent actions, timeouts
- **Permissions**: Who can see/do this? What happens for unauthorized users?

#### Unstated Assumptions
- Data sources, formats, or fields the AC references without defining
- Dependencies on other features, systems, or prerequisites not mentioned
- Design or interaction details left implicit

#### Testability Gaps
- AC that are hard to verify (no observable outcome defined)
- AC with subjective criteria ("should look good", "should be fast")
- Missing acceptance thresholds (performance, data limits)

### Step 4: Present Findings

Output a structured report grouping questions by **who needs to answer them**. Use whichever target roles are relevant — common ones are PM, Designers, Dev Lead, but others (QA, Domain Expert, etc.) are fine too. Only include sections for roles that actually have questions.

```markdown
## AC Challenge Report

**Source:** [Document title](url or path)
**Feature area:** Brief description

---

### Questions for PM

Questions about requirements, scope, priorities, and business logic.

1. **[AC reference]** — Question
   - *Context:* Why this matters
   - *Suggestion:* Options to discuss

### Questions for Designers

Questions about interaction details, missing states, or AC ↔ Figma contradictions.

1. **[AC reference / Figma frame]** — Question
   - *Context:* ...
   - *Suggestion:* ...

### Questions for Dev Lead

Architectural decisions, technical trade-offs, or scope questions that require a dev perspective.

1. **[AC reference]** — Question
   - *Context:* ...
   - *Suggestion:* ...

```

When assigning a question to a role, think about who has the authority or knowledge to answer it:
- **PM**: scope decisions, priority calls, business rules, missing requirements
- **Designers**: interaction patterns, visual states, missing design frames, AC ↔ Figma conflicts
- **Dev Lead**: architectural choices, library selection, technical feasibility, cross-team dependencies
- If a question could go to multiple people, assign it to the one most likely to have the definitive answer

## Important Behaviours

1. **Collect open questions, don't review AC quality** — The goal is to surface questions that need answers from specific people (PM, designers, dev lead) before implementation can start. This is NOT a writing review, an AC improvement exercise, or a gap analysis of the codebase. If a question has a clear answer from the AC text, the Figma designs, or common sense — it's not an open question.
2. **Challenge the requirements, not the code** — Every question should stem from what the AC says (or doesn't say), not from what the codebase currently looks like. "The AC doesn't define what happens on error" is a good challenge. "The codebase doesn't have an error handler for this" is not — that's an implementation detail, not a requirements gap.
3. **Use codebase context as evidence, not as the starting point** — Codebase exploration informs implementation notes and can strengthen a challenge (e.g., "the AC assumes X data exists, but it would need to come from a new source"), but should never be the primary framing of an issue.
4. **If the answer is in the Figma, it's not an open question** — When a Figma design clearly shows a behaviour or visual detail not mentioned in the AC, that's fine — the design is a valid source of truth. Don't flag it as an AC gap. Only flag it if the Figma and the AC actively contradict each other, or if the Figma itself is ambiguous.
5. **Be specific** — Reference concrete AC text. Don't make generic observations.
6. **Prioritise ruthlessly** — Only flag things that genuinely matter. Don't pad the report with nitpicks to look thorough.
7. **Suggest, don't prescribe** — Offer options and trade-offs, not definitive answers. The PM/stakeholder decides.
8. **Don't flag design details as AC gaps** — Visual states, highlight styles, colours, spacing, layout, and interaction animations are design concerns, not AC concerns. If no design was provided, don't assume these details are missing — don't raise them as questions.

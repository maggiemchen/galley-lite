# Next slice: make the rung-1 wedge undeniable

Positioning spine: `~/Documents/artifacts/2026-06-28-artifact-is-the-interface.html`
("The artifact is the interface"). This plan is the first concrete slice off that spine.

## Goal

Prove the core motion on the cheapest surface: **point at the rendered result, watch it
change, never read a diff.** Steer leads; the consume side rides in. If this isn't magical
on a web page (where the visual is free and pointing is lossless), no amount of rung-2
engineering saves the thesis. Earn the right to climb.

## In scope

1. **Steer polish (point -> change).** Tighten the existing point/comment/chat -> edit loop
   so clicking an element plus a one-line instruction reliably produces a scoped edit.
   Sharpen the comment-vs-chat affordance so a first-time user knows which they're doing.
   - Today: overlay + click-to-comment + streamed edit + post-edit element flash already exist.
   - Gap: make "click the thing, say the change, see it happen" feel like one motion, not three.

2. **Consume side (see the change, don't read it).** After an edit, show a **visual
   locator** (RATIFIED 2026-06-28, no textual list): flash the truly-changed elements,
   plus one compact count chip with a prev/next stepper that scrolls-to and re-pulses each
   change. "Show me where it changed," not "tell me what." No list to read.
   - Do NOT build on the existing post-edit flash — it is keyed to what the user *clicked*,
     not what *changed* (see review). Re-source from the real change.
   - HARD CONSTRAINT: the readout must be derived from the REAL change, never narrated by
     the model. Source = the agent's own `Edit` tool_use fragments, with a before/after
     content-hash fallback for whole-file `Write`. See "Resolved implementation" below for
     the full mechanism (anchor mapping, changeId sequencing, change-type vocabulary,
     rung-1 sandbox, observability).

3. **Demo script.** A 30-45s flow on a real artifact: open a page the agent built, point at
   an element, say the change, watch it update with the visual readout. This is the wedge
   proof and the thing a landing page records.

## Out of scope (explicit)

- Rung-2 synthesized surfaces (APIs, schemas, data). Parked until the wedge is proven.
- Multiplayer / hosted galley. `--share` stays as-is, not a focus.
- New model/agent features beyond what the edit loop needs.
- The umbrella name. Tracked separately (org + domain + npm scope; Plonk / Claykit candidates).

## Risks

- **Fabricated change summaries.** If the "what changed" readout is model-narrated rather
  than diff-derived, it can lie, which is worse than the transcript it replaces. Derive from
  the actual on-disk diff.
- **Scope drift toward rung-2.** The temptation is to start building API/schema views. Don't.
  The wedge is rung 1.

## Sequence

1. Run `/autoplan` (or `/plan-eng-review`) on THIS plan to pressure-test scope + architecture. (DONE — see review below.)
2. Build steer polish + the diff-derived visual readout.
3. Dogfood evidence first, hero video second (see review).

---

## Autoplan review (hold-scope, 2026-06-28)

CEO / Design / Eng / DX lenses (Claude subagents) + Codex outside-voice. Hold-scope:
no expansions added; rung-2 stays deferred. All five reviewers independently flagged
the same critical flaw, so it is treated as a confirmed cross-phase theme.

### Cross-phase theme (CONFIRMED by all 5 reviewers)

**"Build on the existing post-edit flash" is a trap — the current flash is keyed to
what the user CLICKED, not what changed on disk.** It stores `batch.map(c => locator(c.el))`
pre-edit and re-flashes those same locators after reload (galley-lite.mjs ~823-862),
with no connection to the real change. Point at `<h1>`, say "fix the chart below," and it
flashes the `<h1>` and toasts "updated" — the exact confident-wrong readout the plan's
fidelity rule forbids, just intent-narrated instead of model-narrated. For pure-chat edits
(no comment) `batch` is empty, so nothing flashes. The flash's *visual* is reusable; its
*data source* must be replaced.

### Resolved implementation (auto-decided, P1 completeness + P5 explicit)

- **Diff source = the real change, server-side.** Primary: capture the agent's own `Edit`
  tool_use `old_string`/`new_string` fragments (already parsed in the stream at
  galley-lite.mjs ~368-371). Fallback for whole-file `Write` / reformat: before/after
  on-disk **content hash** compare (NOT `mtime`; line 579 currently keys on mtime, so
  no-op/whitespace rewrites falsely report "updated"). Before-image is already on
  `undoStack` (line 559).
- **Anchor mapping (the hard part, now named).** byte/range diff = truth; HTML source-span
  = attribution; rendered selector = best-effort visual anchor. Map a changed fragment to
  the post-reload DOM by text match on the client (which has a real DOM; Node is zero-dep,
  no server DOM parser). Count = distinct **top-level** anchors after ancestor dedupe (a
  text edit in `<strong>`>`<h1>`>`<section>` is one change, not three).
- **Sequencing (fixes the reload race).** Compute change inside `runTurn` from before/after,
  store server-side under a monotonic `changeId`, broadcast `{reload, changeId}`; client
  persists `changeId` to `sessionStorage`, reloads, then **fetches** `/__galley/change?id=`
  after the new DOM loads (do not rely on the SSE payload surviving navigation). Turn-scope
  the reload generation so a late `fs.watch` reload (line ~510) can't wipe the readout;
  external edits say "external file change," never reuse the last summary.
- **Change-type vocabulary (replaces "N elements changed" as the only state):**
  modified / added / removed / style (`<style>`) / script (`<script>`) / structural
  (large `Write`/reformat → "rewrote the page," do not fake a count) / non-visual.
- **Rung-1 sandbox.** Only compute and claim a summary for `FILE`. If the agent edits other
  files (it has `Edit/Write` access), the readout says "no HTML file change detected"
  rather than lying. Multi-file/asset diff is deferred (rung-2).
- **Click anchor is too weak today** (sends only tag + selected text + `outerHTML` truncated
  to 1200 chars, line ~226; repeated cards/buttons collide). In-scope: send a richer anchor
  (CSS/nth-of-type path, id/class/role, trimmed text, `outerHTML` hash + bounded HTML,
  parent/sibling snippet). Deferred: screenshots, canvas/SVG/visual-object picking (rung-2+).
- **Observability (none exists today).** Per turn log: turn id, before/after hash, bytes
  changed, change classification counts, anchor-vs-fallback, reload reason + changeId,
  anchor misses after reload. User-facing fallback: "changed 2 regions, couldn't anchor 1"
  beats a silent green check.

### Steer half (Design, high-leverage, small edit)

The "one motion" seam is the two-stage commit: the popover's primary verb is **Attach**
(Enter #1), then eyes jump to the panel and **Send** (Enter #2). Make the popover's primary
button **Send** when there's exactly one pending pin and the input is empty: click element,
type one line, Enter, it ships. Keep "Attach" as the secondary action for stacking multiple
pins. Collapses the common case to click -> type -> Enter.

### Interaction states (must be explicit — currently the common case reads as failure)

CSS/JS-only edit (no element text changed) currently yields empty flash -> "done",
indistinguishable from a no-op. Specify all of: modified / added / removed / style|script /
non-visual / failed / no-change. Off-screen change: scroll-to the primary changed element
and signal "change is off-screen". 47-element change: do not strobe 47 boxes — cap the
simultaneous pulse, collapse the chip to "47 changed — likely a global change," lean on the
stepper. Edit error / missing key: the readout shows problem + cause + fix on the page.

### Reading load (DX, against-thesis risk)

Adding a chip while keeping the streamed markdown reply = MORE reading, not less. When the
visual readout fires, **demote the transcript** (tuck behind a "details" toggle); the visual
is primary, text is opt-in. Otherwise this slice increases cognitive load and weakens the wedge.

### Falsifiable bar (CEO/DX — "reliably" / "one motion" had no pass/fail)

Set before building: point-to-edit lands the correct scoped change on **>=8 of 10** trial
pages, with **>=3 pages the agent did NOT author** (clean agent HTML makes the round-trip
trivial; foreign/messy DOM is the real rung-1 proof), **zero** manual diff inspection,
**zero** typing-fallback on the single-element case.

### Demo = evidence, not just a hero (CEO/DX)

Primary deliverable is the dogfood run hitting the bar above. Record the hero video AFTER
the numbers hold. Demo must start in medias res on the rendered page, pre-warmed (the first
turn pays boot+read and is slow), text stream suppressed, showing click -> change -> readout.

### Decision audit trail

| # | Phase | Decision | Class | Principle |
|---|-------|----------|-------|-----------|
| 1 | Eng | Diff source = agent Edit tool_use fragments, content-hash fallback (not mtime, not click-flash) | auto | P1/P5 |
| 2 | Eng | changeId + fetch-after-reload + turn-scoped reload generation | auto | P5 |
| 3 | Eng/Codex | Count = top-level anchors after ancestor dedupe | auto | P5 |
| 4 | Eng/Codex | Rung-1 sandbox: claim summary only for FILE | auto | P2 (in blast radius) |
| 5 | Design | Popover primary = Send for single pin (one-Enter motion) | auto | P5 |
| 6 | All | Explicit change-state vocabulary incl. non-visual | auto | P1 |
| 7 | DX | Demote transcript when visual readout fires | auto | P1 (thesis) |
| 8 | CEO/DX | Falsifiable bar + foreign-HTML test set | auto | P1 |
| 9 | CEO/DX | Dogfood evidence before hero video | auto | P6 |
| 10 | Codex | Richer click anchor (path/id/class/role/hash) | auto | P5 |

### Confirmed out-of-scope (hold-scope upheld)

Rung-2 synthesized surfaces (APIs/schemas/data), multi-file/asset diff, CSS-selector impact
analysis, screenshots, canvas/SVG/runtime-DOM attribution, multiplayer. None added.

### Resolved decision (USER CHALLENGE — ratified 2026-06-28)

The readout is a **visual locator, no textual list**: flash the truly-changed elements
(re-sourced from the real change) + one compact count chip with a prev/next stepper that
scrolls-to and re-pulses each change. "Show me where it changed," not "tell me what."
Maggie ratified this over the original "textual list" form. Item #2 above updated to match.

## Status: APPROVED (autoplan, hold-scope, 2026-06-28). Ready to build.

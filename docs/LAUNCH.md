# galley-lite — launch kit

Status: **launch-ready** (v0.2.0). API-key-first, ToS-clean. Final step is `npm publish`
(needs the maintainer's npm 2FA — see `docs/PUBLISH.md`).

## What it is (one line)

**Comment on any local HTML and Claude edits the file in place.** Point at an element
or just chat; the change lands on disk and the page live-reloads. It reconnects to the
Claude Code session that *built* the file, so edits inherit the intent behind it, not
just the rendered HTML.

## The honest catch (say it upfront)

- Needs **Claude Code installed** (`claude` on your PATH) and an **Anthropic API key**
  (`ANTHROPIC_API_KEY`). It shells out to the official `claude` CLI; the key bills the
  metered API. No key → it uses whatever local auth you already have.
- It's a **local CLI**, not a hosted app. There's no try-in-browser; that's the point
  (private, on your machine, bound to localhost).
- If you already use Claude Code, you're ~30 seconds from your first edit. If you don't,
  this isn't for you yet — and that's fine.

## Where to launch (in order)

1. **Show HN** — the right crowd for a local dev CLI. Lead with the action, not the price.
2. **r/ClaudeAI** — people who already have Claude Code (the exact prerequisite).
3. **X** — short clip + the npx line. (Record a fresh BYO-key demo first; the old $0 cut
   is retired.)

Do NOT lead with any "$0 / runs on your subscription" hook anywhere — running a
third-party harness on a Pro/Max subscription token is what Anthropic enforced against
in Jan 2026. The honest, durable framing is **bring-your-own-key**.

## Show HN

**Title:**
> Show HN: galley-lite – comment on any local HTML and Claude edits the file in place

**Body:**
> I kept generating HTML with Claude Code — reports, dashboards, landing pages — and then
> tweaking them by typing paragraphs back into the terminal and reading diffs. That's a bad
> loop for anything visual.
>
> galley-lite opens the file in your browser with a thin overlay. You point at an element
> (or just chat), say what you want, and it edits the actual file on disk and live-reloads.
> After each edit the changed element flashes so you can see what moved. The part I like
> most: it finds and resumes the Claude Code session that originally built the file, so it
> already knows the context instead of re-reading a rendered page.
>
> It's a single zero-dependency Node file, binds to localhost, nothing uploaded. Bring your
> own Anthropic API key (it shells out to the official `claude` CLI). Honest requirement:
> you need Claude Code installed + logged in.
>
>     npx galley-lite report.html
>
> Code: https://github.com/maggiemchen/galley-lite — feedback welcome, especially on the
> "what changed" locator across weird HTML.

## r/ClaudeAI

**Title:** I made a little tool to edit Claude-generated HTML by pointing at it instead of typing diffs

> If you make HTML with Claude Code and then fiddle with it, this might save you the
> copy-paste-diff dance. `npx galley-lite file.html` opens it in your browser; click an
> element or chat, and Claude edits the real file + live-reloads. It reconnects to the
> session that built the page so it keeps the context.
>
> Local, single file, bring-your-own API key (it just drives the `claude` CLI you already
> have). Needs Claude Code installed. Would love to know where the "what changed" highlight
> misses on your real pages.

## Pre-flight checklist

- [ ] `npm publish` done (see `docs/PUBLISH.md`).
- [ ] `npx galley-lite <file>` verified from the public registry, cold.
- [ ] Fresh BYO-key demo clip recorded (no $0 framing); first 10s shows the edit + the
      "what changed" flash.
- [ ] README renders on GitHub; `docs/NEXT-SLICE.md` reflects current state.
- [ ] One owner watching the HN/Reddit thread for the first few hours to answer the
      "does it need Claude Code?" question fast.

# galley-lite — messaging

## The one-liner
**Comment on any local HTML and the Claude Code session that built it edits the file in place — on your subscription, $0.**

## The key differentiator (say this first)
Every other AI tool that touches your HTML — v0, Bolt, a browser copilot, even a hosted doc editor — only sees the **rendered output**. They start from zero every time.

galley-lite **reconnects you to the Claude Code session that actually built the file.** It scans your local Claude Code history, finds the session that wrote that exact file, and resumes it — with its full context: the prompt, the data sources, the reasoning, *why* it was built the way it was. You're not re-explaining your document to a stranger. You're talking to the author, who still remembers everything.

That's only possible because it's **local** — the sessions live on your machine. Which also makes it **private** (your files never leave) and **free** (it runs on your existing Claude subscription, $0 metered, no API key).

> Short version: *it's the visual layer for resuming Claude Code sessions, anchored to their output.*

## Taglines (pick by surface)
- "Claude edits any local HTML in place. On your subscription, $0." (npm / PH)
- "Talk to the session that built your doc." (the moat, in 6 words)
- "Comment on it like a Google Doc. Claude does the edits." (the feel)
- "Your artifacts, re-openable." (aspirational)

## What it CAN do
- Edit **any local HTML** by pointing at elements (comment) or just chatting.
- **Resume the build session's full context** — edits inherit sources/data/reasoning, not just the DOM.
- **Live everything:** streams the reply token-by-token, runs the edit, reloads the page, flashes what changed.
- **Batch comments**, Undo, Stop, a warm session so follow-ups are fast (~2–4s).
- **Trusted-pair collaboration** (`--share`): a teammate joins over a tunnel and *suggests* edits you approve.
- **$0, local, private** — your Claude subscription, your machine, no account, no telemetry.

## What it CANNOT do (be honest — it builds trust)
- **It's not hosted / no-install.** It needs Claude Code installed + a Claude subscription, and it runs on your machine. There's no "try it in the browser" — that's the deliberate trade for free + private.
- **It's not multiplayer-for-the-public.** `--share` is *trusted-pair*: every guest action needs your approval, and it's for someone you'd pair with, not a public link. For hands-off team multiplayer, that's a different (hosted) product.
- **Local files only.** It can't edit a page on a live website or a URL — point it at an `.html` file on disk.
- **It's bounded by your subscription.** Heavy use hits your normal Claude rate limits; there's no separate quota.
- **Don't open HTML you don't trust.** The tool gives the opened document's origin the ability to drive an agent on your machine (sandboxed by a secret/secrets deny-list, but still) — treat it like running code.

## vs. the alternatives
| | sees build context | local & private | $0 (your sub) | install |
|---|---|---|---|---|
| **galley-lite** | ✅ resumes the session | ✅ | ✅ | CLI / plugin |
| v0 / Bolt / hosted builders | ❌ rendered only | ❌ | ❌ metered | web |
| a browser AI copilot | ❌ rendered only | ⚠️ | ❌ | extension |
| editing in Claude Code by hand | ✅ | ✅ | ✅ | terminal (no visual) |

galley-lite is the bottom-right corner: the context of Claude Code, with a point-and-click visual surface, for free.

## The 10-second pitch (for a video / a tweet)
You built an HTML report with Claude Code last week. You want to tweak it. Instead of re-explaining it to some web tool, you run `npx galley-lite report.html`, click the headline, type "make this punchier" — and the *original session*, which remembers exactly how it built this, edits the file live. Free. On your machine.

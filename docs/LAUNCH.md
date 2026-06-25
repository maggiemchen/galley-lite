# Launch Kit

Working title: **galley-lite**. A local CLI. Point it at any HTML file on disk, click an element or just chat, and a Claude Code session running on YOUR subscription edits the file in place with live reload and streaming replies. The trick that makes it different: it auto-finds and resumes the exact Claude Code session that *built* the file, so edits inherit the full build context, not just the rendered page.

This kit covers naming, the tagline, the Product Hunt post, the demo video, the one thing that will kill conversion, and a launch checklist.

One naming constraint up front: the hosted product is already called **galley**. The local CLI needs its own public name so the two don't fight for the same word. Everything below assumes a fresh standalone name, with "the local companion to galley" as supporting copy where it helps.

---

## 1. Naming

The job of the name: capture "point at the thing Claude built and keep talking to it." Not "HTML editor." The session-resume is the magic, so the best names lean toward *talking to the thing*, *resuming*, *the artifact as a handle*.

### Candidate 1 — **Resume**
- **Why:** It says the literal magic out loud. You point at a file and the session that built it wakes back up. It's also a word every Claude Code user already knows (`--resume`), so the mechanic is pre-explained by the name. Risk: it's a common English word, hard to own in search.
- **Domain hunch:** `resume.dev` and `resume.app` are almost certainly long gone (resume = CV is a huge category). `getresume`, `resumecli`, `resume.tools` are plausible but muddy. Weak on ownability.

### Candidate 2 — **Pin**
- **Why:** You pin a comment to an element; the thing you point at becomes the handle. Short, concrete, easy to say, easy to type as a command (`pin report.html`). It maps to the actual UI (numbered pins on elements). Risk: "pin" is overloaded (Pinterest, pinned tabs) and generic.
- **Domain hunch:** `pin.dev` likely taken; `pin.tools`, `getpin`, `pin.sh` possible. The `.sh` TLD reads well for a CLI. Medium ownability.

### Candidate 3 — **Margin**
- **Why:** The margin is where you write comments on a draft. It's an editor's word, which fits the "galley" family (galley proofs, marginalia) without reusing "galley." It quietly says "comment on the document" and has a calm, premium feel. You'd run `margin report.html`. Risk: less obvious that Claude is involved.
- **Domain hunch:** `margin.dev` plausibly available or cheap; `margin.tools`, `getmargin.dev`, `margin.sh` all reasonable. Good ownability for a dev tool, strong fit with the editorial brand family.

### Candidate 4 — **Proof**
- **Why:** Stays in the print/galley world (a galley proof is the pre-print draft you mark up). "Proof it" = mark up the draft and have changes made. Ties the local tool to the galley brand by metaphor, not by name collision. Command `proof report.html` reads naturally. Risk: "proof" also means verification/math proofs, slight ambiguity.
- **Domain hunch:** `proof.dev` probably taken; `proofcli`, `proof.tools`, `getproof.dev`, `proof.sh` plausible. Medium ownability.

### Candidate 5 — **Galleon**
- **Why:** Keeps the galley root (a galleon is literally a ship, galley is part of one — and it's the "bigger sibling that stays local"). Distinctive, ownable, memorable, and it nests under the galley brand without being the same word. Command `galleon report.html`. Risk: longer, slightly fantastical, less self-explanatory about what it does.
- **Domain hunch:** `galleon.dev` likely available; `galleon.sh`, `getgalleon.dev` very plausible. Strong ownability, weakest on instant clarity.

### Recommendation: **Margin**

It's the only candidate that says *comment on the draft* and *belongs to the galley editorial world* at the same time, without colliding with the hosted product or borrowing an overloaded word like "pin" or "proof." `margin report.html` reads like a real Unix verb. The domain hunch is the most favorable of the set, and the name ages well — it never sounds like a feature, it sounds like a tool. Run a real availability check on `margin.dev` / `margin.sh` before committing; fall back to **Galleon** if Margin's domains are all gone, since Galleon is the most clearly ownable.

> Note: if you'd rather not rebrand at all, ship it as **galley CLI** and tagline it as "galley, but local." That's the safest path if the hosted product is the real business and this is a top-of-funnel give-away. The standalone name only matters if this CLI is meant to stand on its own on Product Hunt.

---

## 2. The one-liner (tagline)

Must land **$0 on your own subscription** + **Claude edits any local HTML in place**, in under 12 words.

- **Option A:** "Comment on any local HTML. Claude edits it in place, $0 on your subscription." *(12 words)*
- **Option B:** "Point at your HTML, talk to it. Claude edits in place, $0 metered." *(12 words)*
- **Option C:** "Claude edits any local HTML in place. Runs on your subscription, $0." *(11 words)*

### Recommendation: **Option C**

It leads with the action (Claude edits HTML in place), which is the thing people instantly understand, then closes on the price hook. It's the tightest, it reads cleanly under a logo, and "runs on your subscription, $0" answers the "wait, what does this cost me" question before it's asked. Option A is a close second if you want "comment" in the tagline for product clarity.

---

## 3. Product Hunt post

### Title

> **Margin — Claude edits any local HTML in place, $0 on your own subscription**

(Swap "Margin" for the final name. Keep the dash format; PH titles do well with `Name — what it does`.)

### Description

> You generate a chart, a report, a landing page with Claude Code. It looks 90% right. The last 10% is the annoying part: you copy the file path back into the terminal, re-explain what the thing is, and hope the session still remembers why it built it that way.
>
> Margin kills that loop. Point it at any HTML file on disk and it opens in your browser. Click an element, leave a comment, or just chat. A Claude Code session edits the file in place and live-reloads, streaming its replies as it works. Here's the part that surprised me: it auto-finds and *resumes the exact session that built the file*, so it already knows the data, the sources, and the reasoning. You're not re-briefing a stranger. You're talking to the session that made it.
>
> It runs on your existing Claude Code subscription, so edits are $0 metered. Everything stays on your machine, bound to localhost, no upload, no deploy. Honest catch: it needs Claude Code installed and logged in, and it's a local install (`npx`, one line, below the video). If you have Claude Code, you're 30 seconds from your first edit.

### First comment from the maker

> hey PH 👋
>
> I built this because I kept losing the thread. I'd have Claude Code make me some HTML report or dashboard, close the terminal, come back an hour later wanting one small change, and have no idea which of my 40 sessions built it. So I'd start fresh, paste the file in, re-explain everything. Every time. It felt dumb.
>
> The actual unlock wasn't "an HTML editor." It was realizing the file itself could be the handle to its own build session. Claude Code writes a trail of which session touched which file. So I made the tool just... follow that trail backwards. You point at the artifact, it finds the session that made it, and you keep the conversation going right where it left off. Clicking an element to comment on it came after that, because once you're chatting with the build session, pointing at the broken bit is the natural way to say "this, fix this."
>
> Two honest things. One: it needs Claude Code installed and logged in. There's no try-in-browser, this is a local CLI on purpose. Two: it bills your subscription, not an API key (it actually strips `ANTHROPIC_API_KEY` so it can't bill you per-token by accident). So if you're already paying for Claude Code, the edits are free. If you're not, this isn't for you yet, and that's fine.
>
> It's a single file, zero dependencies. `npx <name> report.html --open` and you're in. Would genuinely love to hear what breaks. I made this for me and I use it every day, so I'll be in the comments all day.

---

## 4. The 45-second demo video — beat sheet

No narration. On-screen captions carry the story. The first 10 seconds MUST land the two-part hook: **$0 on your subscription** + **it resumes the session that built the file**. That combo is the conversion trigger; if it's not in the first 10 seconds, people scroll.

| time | on screen | caption (on-screen text) |
|---|---|---|
| 0:00–0:03 | A finished-looking HTML report open in a browser. Clean, real, slightly imperfect. | "you built this with Claude Code an hour ago" |
| 0:03–0:06 | Terminal. Type `npx margin report.html --open` and hit enter. | "one line. no install, no deploy." |
| 0:06–0:10 | Browser opens. A small banner/toast appears: "linked to the session that built this." Right beside it: "$0 · your subscription". | **"it resumed the exact session that built it. edits are $0 on your subscription."** |
| 0:10–0:15 | Cursor clicks the "Comment" toggle, then clicks a stale-looking number on the page. A numbered pin appears. | "click the thing that's wrong" |
| 0:15–0:20 | Type a plain request in the chat box: "these Q3 numbers are stale, pull the latest." Hit send. | "just say what you mean" |
| 0:20–0:30 | Claude's reply streams token-by-token into the thread. It references the data source by name (proof it has build context). A "working" shimmer on the element. | "it already knows the data source. because it's the same session." |
| 0:30–0:36 | The page live-reloads. The changed number flashes/highlights. New value is correct. | "edited in place. live reload. zero copy-paste." |
| 0:36–0:41 | Quick second turn: type "and make that header less shouty," send, it edits, reloads. Shows the conversation continuity. | "keep talking. it remembers the thread." |
| 0:41–0:45 | End card. Product name + logo, tagline, the npx line, and a small "Requires Claude Code" badge. | **"Margin — Claude edits any local HTML in place, $0 on your subscription"** · `npx margin <file>` · *Requires Claude Code* |

Production notes:
- Record at real speed for the first turn (the ~10s boot is honest), then you may lightly trim the dead air. Do NOT fake the speed of the streaming reply; the streaming *is* the delight.
- The 0:06–0:10 beat is the whole video. If you only nail one shot, nail the "linked to the session that built this + $0" banner. Make it big and legible.
- No music with vocals. Keep it quiet and confident.

---

## 5. The conversion-killer + mitigation

**The single biggest reason PH visitors bounce:** there's no try-in-browser. It's a local install that *requires Claude Code installed and logged in*. The PH crowd is trained to click a "Visit" button and play with a live demo in 5 seconds. This tool can't offer that, and a chunk of visitors will bounce the moment they realize they have to install something AND already be a Claude Code user.

You can't remove that friction. The product is local on purpose (that's the privacy + $0 story). So the move is not to hide it. The move is to **pre-qualify hard and fast** so the people who can't use it bounce *without leaving a disappointed comment*, and the people who can use it feel like it was made exactly for them.

How to filter and pre-qualify, above the fold:

1. **A "Requires Claude Code" badge, above the fold and on the end card.** Make it the first qualifier people see, right under the tagline. It reframes the requirement from "ugh, a barrier" into "oh, this is *for me*" for the exact audience you want. The people without Claude Code self-select out in 2 seconds and don't feel tricked.
2. **The one-line `npx` directly under the video.** `npx margin <file>` with nothing to install and nothing to sign up for. Seeing a copy-pasteable one-liner does the job a "try it" button would: it proves time-to-first-edit is ~30 seconds, not a setup slog. Make it copyable.
3. **Put the honest catch in the description's last paragraph, not buried.** "Needs Claude Code installed and logged in. No try-in-browser, this is local on purpose." Saying it yourself, plainly, converts skeptics better than letting them discover it. It also kills the most common bounce-comment ("how do I try this without installing?") before it's written.
4. **Frame the requirement as the feature.** The reason it needs Claude Code is the same reason it's $0 and private and can resume your build session. Don't apologize for the requirement; the requirement IS the value prop. One line in the maker comment ties them together.

Net effect: the visitors who bounce are visitors who were never going to convert (no Claude Code). The ones who stay are pre-qualified buyers. You trade raw click-through for a much higher quality of remaining audience and a cleaner comment section.

---

## 6. Launch checklist

Do not launch until every box is true.

**Product works (the npx promise is real):**
- [ ] `npx <name> <file>` works from a clean machine with nothing pre-installed except Node + Claude Code. Test on a second machine or a fresh user account.
- [ ] `package.json` exists with `bin` + shebang + `engines.node` guard. (Today there's no package.json — this is a hard blocker for `npx`.)
- [ ] `--open` defaults ON, or the demo's "it opens" promise breaks.
- [ ] Preflight check: on startup, detect whether `claude` is installed and logged in. Distinct, copy-pasteable error messages for "not installed" vs "not logged in." Never a raw stack trace.
- [ ] Auto-link to the build session works reliably, and **fails loud** when it can't find the session ("couldn't find the build session, starting fresh") instead of silently dropping to a fresh session. The silent-fallback would kill the one magic moment on camera.
- [ ] Running it twice doesn't crash on `EADDRINUSE` (free-port fallback or a clean message).
- [ ] The Wave 0 reliability fixes from the autoplan are in (turn queue / no mid-turn race, timeout kills + respawns the child, re-read file at turn start to avoid stale-context clobber, clean SIGINT child kill). Don't demo a tool with a concurrency race.

**Assets ready:**
- [ ] 45-second demo recorded, with the $0 + session-resume banner clearly readable in the first 10 seconds.
- [ ] End card with name, tagline, `npx` line, and "Requires Claude Code" badge.
- [ ] README done and matches the actual install path (today the README ships an `alias`, not `npx` — reconcile this before launch).
- [ ] Final name chosen, domain checked and bought, npm package name reserved (publish a placeholder so the `npx` name is yours).
- [ ] "Requires Claude Code" badge image made for the PH gallery + the README.

**Positioning locked:**
- [ ] Tagline finalized (Option C unless changed).
- [ ] ToS sanity check: confirm running headless `claude -p` on the subscription is within terms, and reframe the pitch as "uses your existing Claude Code subscription" rather than "$0 forever" so you're not promising a benefit Anthropic could change. ($0 *metered* is the safe, true framing.)
- [ ] Maker first-comment drafted (above), in your own voice, ready to paste the second the post goes live.
- [ ] PH title, description, gallery images, and topics set. Topics: Developer Tools, Artificial Intelligence, GitHub (CLI-adjacent crowd).

**Launch day:**
- [ ] Post goes live 12:01am PT.
- [ ] You're free to sit in the comments all day. Half of PH conversion is the maker replying fast and human.
- [ ] A "known limitations" reply pre-drafted (local only, needs Claude Code, no Windows-untested-if-true) so the first skeptic gets an honest answer, not a defensive one.

---
name: galley
description: >-
  Fire-and-forget launcher for galley-lite — opens a local HTML file in a live,
  commentable browser view where clicking an element and leaving a comment makes
  Claude edit the file in place. Use when the user says "open this html with
  galley", "launch galley-lite", "edit this rendered page", "open the report in
  galley", "let me comment on this page", or types "/galley" (optionally with a
  file path). Especially after building or editing an HTML artifact in this
  session — galley resumes THIS session so the agent inherits the full build
  context. Launches DETACHED and returns immediately; never blocks the session.
---

# galley — launch galley-lite (fire-and-forget)

Launch `galley-lite.mjs` on an HTML file so the user can view it live, click
elements, and leave comments that Claude turns into in-place edits. This is a
**fire-and-forget launcher**: you spawn the server detached, print the URL/PID,
and the skill turn ENDS while the server keeps running. Do NOT wait on it. Do
NOT stream its output. Do NOT hold the session open.

## Step 1 — Resolve the HTML file

- If the user passed a path (`/galley path/to/file.html`), use it (resolve to an
  absolute path).
- If no arg, pick the **most recently modified `*.html` in the current working
  directory**:

  ```bash
  ls -t *.html 2>/dev/null | head -1
  ```

  If that finds nothing, search one level down, then ask the user for a path if
  still empty. Convert the chosen file to an absolute path before launching.

## Step 2 — Find the current session id (for --resume)

The big advantage of launching galley from *inside* Claude Code is that THIS
session is the one that just built/edited the file. Resuming it (`--resume <id>`)
beats galley-lite's transcript auto-detection — it's exact and instant, and the
edit agent inherits this conversation's full context (sources, reasoning,
earlier drafts).

Get the current session id, trying these in order:

1. **Environment variable** — check `$CLAUDE_SESSION_ID` (and as a fallback
   `$CLAUDE_CODE_SESSION_ID`):

   ```bash
   echo "${CLAUDE_SESSION_ID:-${CLAUDE_CODE_SESSION_ID:-}}"
   ```

2. **Transcript path** — Claude Code transcripts live at
   `~/.claude/projects/<slugified-cwd>/<session-id>.jsonl`. The session id is the
   newest `.jsonl` filename (minus extension) under the project dir for THIS cwd.
   You can find it with:

   ```bash
   ls -t ~/.claude/projects/*/*.jsonl 2>/dev/null | head -1 | xargs -I{} basename {} .jsonl
   ```

   Prefer the project dir that matches the current working directory if you can
   identify it; otherwise the newest transcript across all projects is almost
   always this session.

3. **If you genuinely can't determine it, OMIT `--resume`.** galley-lite will
   auto-link to the session that wrote the file by scanning transcripts. Linking
   is best-effort, never required — the tool still works fresh.

Store the result in a shell var, e.g. `SID`.

## Step 3 — Launch DETACHED

Run galley-lite with `nohup ... &` so it survives the turn ending, redirect all
output to a log, and immediately disown. Pick a port (default 4321; galley-lite
auto-increments if taken). Example:

```bash
SID="$(echo "${CLAUDE_SESSION_ID:-${CLAUDE_CODE_SESSION_ID:-}}")"
PORT=4321
FILE="/abs/path/to/file.html"   # from Step 1
LOG="/tmp/galley-lite-${PORT}.log"

if [ -n "$SID" ]; then
  nohup node /Users/maggiechen/Documents/code/galley/galley-lite/galley-lite.mjs \
    "$FILE" --port "$PORT" --resume "$SID" --open >"$LOG" 2>&1 &
else
  nohup node /Users/maggiechen/Documents/code/galley/galley-lite/galley-lite.mjs \
    "$FILE" --port "$PORT" --open >"$LOG" 2>&1 &
fi
GL_PID=$!
disown 2>/dev/null || true
echo "galley-lite pid=$GL_PID port=$PORT log=$LOG"
```

Notes:
- `--open` tells galley-lite to open the browser itself.
- Use a single Bash call for the launch; do NOT set `run_in_background` on the
  tool and do NOT wait — `nohup ... &` already detaches it.
- Give it a moment then read the first lines of the log to grab the real bound
  port (galley-lite prints `galley-lite → http://localhost:<port>` and may have
  bumped the port if 4321 was taken):

  ```bash
  sleep 1; head -8 /tmp/galley-lite-4321.log
  ```

## Step 4 — Report and STOP

Print a short confirmation and end the turn. Include:
- The URL (`http://localhost:<bound-port>`) — read it from the log.
- The PID (`$GL_PID`).
- Whether it linked to this session (you passed `--resume`) or is running fresh.
- How to stop it: run `/galley-stop`, or `kill <PID>`, or
  `pkill -f galley-lite.mjs`.

Example message:

> galley-lite is running in the background at http://localhost:4321 (pid 12345),
> linked to this session so edits inherit our full context. Click "💬 Comment",
> point at an element, and describe the change — it edits the file live on your
> Claude subscription. To stop it: `/galley-stop` (or `kill 12345`).

This is fire-and-forget: the skill returns now, the server keeps running until
stopped.

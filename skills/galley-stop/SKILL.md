---
name: galley-stop
description: >-
  Stop any running galley-lite server(s) launched by the /galley skill. Use when
  the user says "stop galley", "kill galley-lite", "shut down the galley server",
  "close the live preview", or types "/galley-stop". Optionally accepts a PID to
  kill a specific instance.
---

# galley-stop — kill running galley-lite servers

Find and terminate galley-lite processes, then confirm what was stopped.

## Step 1 — Find running instances

```bash
pgrep -fl galley-lite.mjs || echo "none running"
```

This lists each matching PID and command line. If none are running, tell the
user there's nothing to stop and you're done.

## Step 2 — Kill them

- **If the user gave a specific PID**, kill just that one:

  ```bash
  kill <PID> 2>/dev/null && echo "stopped $PID"
  ```

- **Otherwise kill all galley-lite servers** by pattern:

  ```bash
  pkill -f galley-lite.mjs && echo "stopped all galley-lite servers"
  ```

If a process doesn't exit after a normal `kill`, escalate:

```bash
pkill -9 -f galley-lite.mjs
```

galley-lite installs SIGINT/SIGTERM handlers that kill its child `claude` edit
process on exit, so a normal `kill`/`pkill` cleans up the agent subprocess too.

## Step 3 — Confirm

Verify nothing is left and report:

```bash
pgrep -fl galley-lite.mjs || echo "all galley-lite servers stopped"
```

Tell the user which PID(s) were stopped (or that none were running).

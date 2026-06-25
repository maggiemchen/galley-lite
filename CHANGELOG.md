# Changelog

## 0.1.0 — 2026-06-25

First public release.

- Open any local HTML in the browser with an overlay; comment on elements or chat.
- A persistent warm Claude Code session edits the file in place and live-reloads it,
  on your own Claude subscription ($0 metered).
- **Auto-link:** resumes the Claude Code session that built the file (scans
  `~/.claude/projects` for a `Write`/`Edit` to that path) so edits inherit its context.
- Token-by-token streaming replies, markdown rendering, warming indicator, Stop, Undo,
  and a flash on the elements that changed.
- `--share`: opt-in, owner-gated trusted-pair collaboration over a cloudflared tunnel
  (every guest turn needs host approval; guest never receives the host token; expiry +
  turn cap + audit log).
- Ships as an npm CLI (`npx galley-lite <file>`) and a Claude Code plugin (`/galley`).

Security: loopback-only bind, per-run CSRF token, path-traversal-safe static serving,
the agent scoped to the file's directory.

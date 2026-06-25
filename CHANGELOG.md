# Changelog

## 0.1.1 — 2026-06-25

Security hardening (pre-launch adversarial review):

- Reject unexpected `Host` headers → defeats DNS-rebinding (a malicious site
  resolving to 127.0.0.1 can no longer read the conversation or local files).
- Host vs guest is now decided by a verified loopback socket (+ no forwarding
  header), not spoofable proxy headers. `--share` requires cloudflared (which
  stamps an unforgeable header); the "tunnel it yourself" path is removed so the
  host token can't leak to a remote visitor.
- Static file serving is gated by the same auth as the page — a tunnel guest can
  no longer read arbitrary files in the directory, and dotfiles/secrets are blocked.
- The agent runs with a deny-list (`--settings`): it can't read `~/.ssh`, `~/.aws`,
  `.env`, keys/credentials, or write shell rc files / git hooks — limiting the
  blast radius if a malicious document or a tricked approval drives it.
- Timing-safe token comparison; SSE-client and conversation-length caps (DoS).

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

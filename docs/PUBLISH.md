# Publishing galley-lite to npm

Everything is launch-ready (v0.2.0): package verified, ToS-clean, cold-install tested.
The only step left needs your npm 2FA. Pick ONE path.

## Path A — automation token (recommended; no OTP dance, reusable for CI)

1. npmjs.com → avatar → **Access Tokens** (`npmjs.com/settings/chenmanq/tokens`).
2. **Generate New Token → Classic → Automation** → copy it (`npm_…`).
   *(Automation tokens bypass 2FA — that's the point. Granular tokens can't target
   `galley-lite` yet since it isn't on the registry, so Classic/Automation is simplest
   for the first publish.)*
3. From `~/Documents/code/galley-lite`:
   ```bash
   echo "//registry.npmjs.org/:_authToken=npm_YOURTOKEN" >> ~/.npmrc
   npm publish
   ```
4. **Revoke the token** afterward on the same page (or keep it for CI).

You can paste the token to the assistant and it will run the publish + verify for you,
then you revoke it.

## Path B — authenticator OTP (if you add an app)

1. npmjs.com → **Account → Two-Factor Auth → Manage** → scan the QR with 1Password /
   Authy / iOS Passwords.
2. From `~/Documents/code/galley-lite`: `npm publish` → enter the 6-digit code at the
   `Enter OTP:` prompt.

## Verify after publishing

```bash
npm view galley-lite version          # → 0.2.0
cd /tmp && npx galley-lite@latest --help   # cold fetch from the registry, exit 0
```

## Notes

- Publish source is THIS repo (`github.com/maggiemchen/galley-lite`) — the public mirror
  of the canonical dev copy in the `galley` monorepo (`galley-lite/`). Re-sync on each
  release.
- `npm whoami` should print `chenmanq` first. If `ENEEDAUTH`, the token line above fixes it.

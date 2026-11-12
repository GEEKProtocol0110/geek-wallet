# Contributing to GEEK Wallet

GEEK Wallet's public release is a Public Alpha: a Kaspa Mainnet portfolio and receiving QR for a public address. It reads native KAS, featured GEEK, paginated KRC-20 holdings, and experimental covenant-token snapshots. Contributions are welcome when they keep that behavior honest.

## Before you start

- Use a GitHub issue for a reproducible bug or a clearly scoped change.
- Do not open a public issue for an unpatched vulnerability. Follow [SECURITY.md](SECURITY.md).
- This app must never request or store seed phrases or private keys. Do not add signing, sending, recovery, or key storage. The removed `legacy-wallet/` prototype stays removed.
- A pasted address is not proof of ownership, and one address may cover only part of a wallet.
- The Swap page is an external provider handoff. Do not submit exchange orders from this app, and do not put an amount, recipient, tracked address, nickname, affiliate ID, or API key on the outbound link.
- Missing, malformed, oversized, or failed upstream data stays unavailable. Do not substitute an invented zero, a mock price, or another asset's history.
- Read [README.md](README.md) before changing asset, history, or swap behavior. This Alpha has no independent security audit.

## Development setup

GitHub Actions uses Node.js 22. The README supports Node.js 20.9 or newer for local development.

```sh
git clone https://github.com/GEEKProtocol0110/geek-wallet.git
cd geek-wallet
npm ci --ignore-scripts
npm run dev
```

Use that install command. CI uses it, and the repository `.npmrc` sets `legacy-peer-deps=true`.

## Checks

`npm run verify` runs the same checks CI runs before the production dependency audit:

1. `npm test` — `node --test tests/*.test.cjs`
2. `npm run lint` — ESLint
3. `tsc --noEmit`
4. `npm run build` — `next build`
5. `node scripts/check-share-preview.mjs`

CI then runs `npm audit --omit=dev --audit-level=high`. Run that audit before opening a pull request.

Other scripts in `package.json`:

- `npm run dev` starts `next dev`.
- `npm start` serves a production build with `next start`.
- `npm run assets:share` regenerates the committed share image and app icons. Commit the generated files when those assets change.

Browser and physical-phone checks are outside CI.

## Pull requests

1. Branch from current `main`.
2. Keep the change small enough to review, and describe any effect on public-address handling.
3. Add or update tests when behavior changes.
4. Run `npm run verify` and `npm audit --omit=dev --audit-level=high`.

Accepted pull requests are squash-merged. `main` allows only squash merges, and the `verify` check must pass on a branch that is up to date with `main`. Passing that check is not an independent audit, and it does not by itself mean the change will be merged.

By contributing, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md) and to license code contributions under the repository's MIT License.

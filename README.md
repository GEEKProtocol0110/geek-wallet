# GEEK Wallet

Public Alpha **portfolio companion** for a Kaspa Mainnet public address. [GEEK HQ](https://www.geekprotocol.xyz/) is the main ecosystem product.

Paste an address to read native KAS, available/locked GEEK and up to 20 recent native transactions. A receiving QR and copy action use that same public address. Tracking does not prove ownership and one address may cover only part of a wallet. No seed phrases, private keys, signing, sending, recovery or exchange are exposed by the public app.

## Data and privacy

The server validates the address with the Kaspa SDK, then reads fixed Kaspa REST and Kasplex endpoints. The address is sent to those public services only after a lookup. Hosting and upstream services may log requests. No portfolio database or analytics is added. Nicknames and up to six addresses can be remembered in this browser when explicitly selected; Forget removes a remembered entry. The app does not read or delete earlier experimental encrypted wallet records.

Balances use integer base units and eight decimal places. Missing, malformed, oversized or failed responses show **Unavailable**, never an invented zero. A successful complete empty token list can report zero GEEK. Native transaction acceptance is shown only when reported by the source. Prices and historical charts are unavailable; no mock values are shown.

## Development

Node 20.9+:

```sh
npm ci --ignore-scripts
npm run dev
npm run verify
```

Tests cover checksum/network validation, exact amounts, malformed receipts and independent source failures. GitHub Actions runs tests, lint, type checks and the production build. Existing Vercel hosting remains in use.

## Earlier prototype

`legacy-wallet/` preserves the former create/restore/signing prototype as reference, excluded from the public build. It is not an audited wallet and its previous production-ready claims do not describe this release. Do not use its key handling or mock provider fallbacks with funds. The active app intentionally accepts public addresses only.

Primary API implementation references: [Kaspa REST server](https://github.com/kaspa-ng/kaspa-rest-server), [Kasplex indexer](https://api.kasplex.org/), [Kaspa SDK](https://github.com/kaspanet/rusty-kaspa).

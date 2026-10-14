# GEEK Wallet

**Kaspa first. GEEK featured. The wider Kaspa token ecosystem belongs here.** GEEK Wallet is a Kaspa wallet product; this public Alpha is its read-only portfolio companion for a Mainnet public address. [GEEK HQ](https://www.geekprotocol.xyz/) is the ecosystem learning product.

Paste an address to read native KAS first, featured GEEK, paginated KRC-20 holdings, experimental covenant-token snapshots and up to 20 recent native transactions. A receiving QR and copy action use that same public address. Tracking does not prove ownership and one address may cover only part of a wallet. No seed phrases, private keys, signing, sending, recovery or exchange are exposed by the public app.

## Data and privacy

The server validates the address with the Kaspa SDK, then reads fixed Kaspa REST, Kasplex and kcc20.info endpoints. The address is sent to those public services only after a lookup. Hosting and upstream services may log requests. No portfolio database or analytics is added. Nicknames and up to six addresses can be remembered in this browser when explicitly selected; Forget removes a remembered entry. The app does not read or delete earlier experimental encrypted wallet records.

KAS and GEEK use integer base units and eight decimal places. Other KRC-20 tokens use their own validated precision from zero to eighteen decimals; issue-mode contract IDs remain distinct from tickers. Missing, malformed, oversized or failed responses show **Unavailable**, never an invented zero. GEEK uses Kasplex's specific-token balance endpoint (`/v1/krc20/address/{address}/token/GEEK`), documented in the [official SDK](https://github.com/kasplex/sdk-kiwi/blob/06dc75ea1066aba4d78eb32711690f6f123a9575/src/api/kasplexApi.ts). The token-list endpoint ignores a `tick` filter and paginates holdings, so its first page cannot establish a missing GEEK balance. A successful, complete empty result or an explicit zero GEEK balance reports zero. Kasplex also returns a no-record sentinel with zero balance, zero locked, zero decimals and zero operation score; only that exact zero case is accepted outside GEEK’s eight-decimal format. Wrong tokens, duplicate results, pagination cursors and invalid amounts are rejected. Native transaction acceptance is shown only when reported by the source. Prices and historical charts are unavailable; no mock values are shown.

## Asset support and hierarchy

KAS is the primary asset and pays native network fees. GEEK is featured second; it does not define the wallet's asset scope. KRC-20 and covenant tokens have separate views, sources and identities. Unlike asset quantities are never added together or turned into an invented fiat total.

`/api/tokens` reads one bounded Kasplex holdings page at a time. The UI exposes Next page, Back to first page, per-page filtering and retry, and stops repeated cursors. Loaded pages are not represented as a complete wallet snapshot. Dedicated GEEK lookup remains independent of the holdings list.

`/api/covenants` reads experimental Mainnet address analysis plus status from the [kcc20.info OpenAPI](https://kcc20.info/openapi.json). Its current profiles are **legacy-kcc20** and **kron-native**, displayed with those identities. They are not silently reclassified as conformance to the current KCC-20 proposal. Results are source-reported snapshots, not independently verified ownership or spendability. Unverified source balances are hidden; failed/stale/incomplete/unsupported responses are unavailable. An empty snapshot is not proof that the address has no covenant assets. Source lag and unresolved transitions are visible. See [asset support and integration boundaries](docs/asset-support.md).

The official [KCC-20 specification](https://github.com/kaspanet/kccs/blob/main/kcc-0020.md) was in Last Call on 14 October 2026. Current-proposal ABI/state verification and generic KCC-20 signing remain future integration work. The public app exposes no signer for any asset.

## Understanding native activity

Each recent transaction opens a read-only explanation with the KAS asset and Mainnet network, exact input/output totals, tracked-address inputs and outputs, a net address change, full output destinations, source block time and transaction ID. Inputs can also be expanded. The list records when Kaspa REST was read and supports refresh and independent explorer links.

The provider is asked to resolve previous outpoint addresses and amounts (`resolve_previous_outpoints=light`). Amount arithmetic uses `BigInt` in sompi (eight decimal places); unsafe numeric amounts are unavailable. Missing/invalid input or output amounts, duplicate or missing positions, unsupported addresses, contradictory totals, or incomplete resolution prevent the affected totals, net movement or fee from being claimed. A valid output can still be displayed when input resolution is missing. Empty inputs do not imply a zero fee, including transactions that create native coins.

The whole transaction fee is all inputs minus all outputs. It is **not added again** to the net address decrease. Multiple input addresses do not establish which party paid the fee. The address change is outputs to the tracked address minus inputs from that address; it is not a complete wallet balance or necessarily a payment amount. Outputs to the tracked address may be change or a self-transfer. Other output addresses may also belong to the same wallet, so intended recipients and ownership are not inferred.

Acceptance is reported as accepted, not accepted, or unavailable **by the source**. A false or missing acceptance value is not relabeled pending, failed, or paid. Native KAS receipts do not establish GEEK token transfers, mints, burns, HQ payouts or learning rewards. Those require separate token-operation evidence; this release adds no token activity feed, payment, signer, or payout authority.

## Development

Node 20.9+:

```sh
npm ci --ignore-scripts
npm run dev
npm run verify
```

Tests cover checksum/network validation, exact per-asset amounts, pagination, route parameter validation, independent source failures, covenant identity/profile/freshness checks, incoming/spending/change/shared-input cases, incomplete resolution, acceptance states, and rendered explanations. GitHub Actions runs tests, lint, type checks, the production build and a production dependency audit. Existing Vercel hosting remains in use. Browser and physical-phone interaction checks remain a separate acceptance step.

## Earlier prototype

`legacy-wallet/` preserves the former create/restore/signing prototype as reference, excluded from the public build. It is not an audited wallet and its previous production-ready claims do not describe this release. Do not use its key handling or mock provider fallbacks with funds. The active app intentionally accepts public addresses only.

Primary API implementation references: [Kaspa REST server](https://github.com/kaspa-ng/kaspa-rest-server), [Kasplex indexer](https://api.kasplex.org/), [Kaspa SDK](https://github.com/kaspanet/rusty-kaspa).

# Kaspa first: asset support

Product direction agreed on 14 October 2026: GEEK Wallet is a Kaspa wallet first, GEEK second, and serves the wider KRC-20 and KCC-20 ecosystem. The current public release is read-only address tracking. This release adds no key handling or signing.

| Asset family | Public release | Identity and limits |
| --- | --- | --- |
| Native Kaspa | Primary KAS balance, receiving address/QR and explained native activity | SDK-validated Mainnet public address; one address may cover only part of a wallet |
| GEEK | Secondary featured asset, independent direct available/locked balance | Kasplex GEEK ticker, eight decimals; never dependent on the first holdings page |
| KRC-20 | Paginated read-only holdings, available/locked units and per-page filter | Ticker for mint-mode, contract ID for issue-mode; validated zero–eighteen decimals |
| Covenant tokens | Experimental provider snapshots from kcc20.info | Provider profiles `legacy-kcc20` and `kron-native`, full token IDs and source validation labels |
| Current KCC-20 proposal | Ecosystem target; universal conformance is not implemented | Requires versioned ABI/state and ownership validation before claiming proposal compatibility |

## Data boundaries

Public source references reviewed on 14 October 2026:

- [Kasplex SDK](https://github.com/kasplex/sdk-kiwi/blob/06dc75ea1066aba4d78eb32711690f6f123a9575/src/api/kasplexApi.ts): token-list pagination and dedicated token balances. Its address-token types support ticker and contract ID.
- [Kasplex executor validation](https://github.com/kasplex/indexer-executor/blob/main/operation/init.go): mint-mode ticker rules and zero–eighteen decimals.
- [KCC-20 specification](https://github.com/kaspanet/kccs/blob/main/kcc-0020.md): status Last Call at review time; KCC-1 ABI/state conventions, KCC-2 owner schemes, covenant families and extension commitments.
- [kcc20.info OpenAPI](https://kcc20.info/openapi.json): version 1.1.0, fixed Mainnet server, read-only address analysis and indexer status. Live directory and address responses identify legacy KCC20 and Kron Native profiles. These are provider classifications, not this wallet independently verifying current KCC-20 conformance.

No arbitrary RPC or indexer URL can be supplied through the public APIs. Address validation precedes upstream requests. Requests are GET only, no-store, with ten-second source deadlines and a one-million-character accepted-response limit. Public addresses are disclosed to the named services only after the user tracks an address; there is no account or portfolio database.

KAS, GEEK, KRC-20 pages and covenant snapshots fail independently. Native information can display before the separate token sections finish loading. The receiving QR continues to contain only the tracked Kaspa address; it does not construct a covenant recipient or token payment request.

## KRC-20 pages

`/api/tokens?address=...&cursor=...` accepts one address and at most one allowlisted ticker/contract-ID cursor. Responses contain at most 100 validated records. Duplicate IDs, invalid identities/precision/amounts, malformed pages and empty pages with a next cursor are unavailable. The UI checks cursor loops and allows retry or return to the first page. Each page is an independent changing source read; filtering affects only the displayed page, and no full-wallet total is inferred.

Amounts are base-unit strings with integer arithmetic. Zero decimals display whole units; eighteen decimals preserve the smallest unit without floating-point conversion. Symbols supplied by an indexer are not endorsements. No token images, arbitrary metadata URLs or HTML are loaded from token records.

## Experimental covenant coverage

`/api/covenants?address=...` requests address analysis with activity and counterparty limits of one and, independently, `/v1/status` on the fixed kcc20.info Mainnet service. Only holdings are rendered; activity and counterparties are not inferred as native KAS transactions or ownership proof.

The adapter requires the echoed address, a valid owner identifier/type, matching summary and portfolio record counts, at most 200 distinct token IDs, known provider profiles, valid precision/base units, and consistent source DAA scores. Unknown profiles fail closed. Only provider labels `verified` and `template_verified` expose a reported amount; other labels keep it unavailable. Those labels remain attributed to the provider, never presented as independent verification by GEEK Wallet.

The node checkpoint must be present, at most fifteen minutes old and no more than five minutes in the future. Invalid or stale checkpoints are unavailable. Indexer lag above 6,000 DAA scores displays a behind-network warning. Unresolved transitions display an incomplete-coverage warning. Node freshness does not establish that the full indexed history has caught up, so indexed and network DAA and lag remain inspectable. An empty result is described only as no holdings reported in this provider snapshot.

## Current-proposal KCC-20 integration still required

Before claiming generic current-proposal KCC-20 support, pin a convention version and program artifact, verify program/state bindings and supported KCC-2 owner schemes, and track accepted live cells through reorganizations and borrowed-receive outpoint changes. Keep covenant family identity and extension commitment distinct so assets with different extended-state commitments are not combined. Support unknown metadata without treating a ticker as an identity.

Before adding transfers, independently review the signer and transaction builder, validate intended asset/amount/recipient and KAS funding/fees, test each supported owner/profile on the appropriate network, and reconcile accepted receipts. A third-party snapshot, testnet transaction or KAS receipt cannot establish a Mainnet KCC-20 balance or completed token payment. These are implementation boundaries, not enabled functionality.

Browser and physical-phone interaction acceptance remains pending. CI verifies parsers, exact amounts, routes, failure isolation, rendered hierarchy and snapshot explanations.

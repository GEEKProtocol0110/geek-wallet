# GEEK Wallet Security

## Current status

GEEK Wallet is a Public Alpha. The public app is a Kaspa Mainnet portfolio and receiving QR for a public address. It reads native KAS, featured GEEK, paginated KRC-20 holdings, and experimental covenant-token snapshots. It has not completed an independent security audit.

This app must never request or store seed phrases or private keys. The public app does not expose signing, sending, recovery, or exchange execution. A visitor pastes a public address. The receiving QR and copy action use that same address. Nicknames and up to six addresses can be remembered in the browser only when the visitor explicitly chooses that. Forget removes a remembered entry. The app does not read or delete earlier experimental encrypted wallet records.

Tracking a public address does not prove ownership, and one address may cover only part of a wallet. The Swap page is an external provider handoff. This wallet submits no exchange orders and does not sign or move funds.

The earlier create/restore/signing prototype was removed because its key handling was unsafe. The active app accepts public addresses only.

The Geek Protocol HQ security policy is published at <https://github.com/GEEKProtocol0110/geek-protocol-hq/blob/main/SECURITY.md>. Report vulnerabilities in this wallet through the process below.

## Reporting a vulnerability

Private vulnerability reporting is enabled for this repository. Use GitHub private vulnerability reporting:

<https://github.com/GEEKProtocol0110/geek-wallet/security/advisories/new>

Do not open a public issue for an unpatched vulnerability. Include the affected commit, the expected behavior, the observed behavior, and the smallest evidence needed to reproduce the issue. Do not access another person's data, degrade the service, or move funds.

## Public-address handling

The server validates the address with the Kaspa SDK, then reads fixed Kaspa REST, Kasplex, and kcc20.info endpoints. The address is sent to those public services only after a lookup. Hosting and those upstream services may log requests. This app adds no portfolio database and no analytics. Missing, malformed, oversized, or failed responses are shown as unavailable.

---
title: OH-MY-PI Current Security Evidence
version: 2.0.0
status: blocked
created_date: 2026-10-03
tags:
  - oh-my-pi
  - security
  - supply-chain
confidence: 98
owner: MIKKOH Chen
---

# Security Evidence

This evidence binds the source inventory to code SHA
`e31c536eae2222224255e1f25719df5881f4be26`. It does not claim that the
documentation-only descendant, an uncreated PR, or a future merge has passed
hosted security gates.

## Evidence status

| Gate | Result | Current evidence |
|---|---|---|
| Full Git history secrets | PASS | Gitleaks 8.30.1 scanned 28,809 commits and 555.91 MB with no findings. |
| Working tree secrets | PASS | Gitleaks 8.30.1 scanned 187.76 MB with no findings. |
| CycloneDX inventory | PASS | Syft 1.52.0 generated 2,254 components and reconciled all 565 external Bun lock records. |
| SBOM identity | PASS | CycloneDX 1.7 metadata names `Frictionless-Labs/oh-my-pi` at exact code SHA `e31c536eae2222224255e1f25719df5881f4be26`. |
| SBOM checksum | PASS | SHA-256 `32d239b67847cebdbdb5164b7f5b2536bf6e9faa279ba8aced66b1f699e8a7be`. |
| Vulnerability scan | BLOCKED | Grype found 8 High and 3 Medium Go findings in installed TypeScript-Go developer binaries. |
| CodeQL | BLOCKED | PR#1 aggregate check failed with 9 new alerts: 7 High and 2 Medium. |
| Fresh hosted analysis | UNKNOWN | No focused-stack PR or workflow result exists for the fresh code SHA. |

## CodeQL alert inventory

| Severity | Query | Locations | Disposition |
|---|---|---|---|
| High | `js/polynomial-redos` | `packages/ai/src/error/flags.ts` (3), `packages/ai/src/error/rate-limit.ts` (1), `packages/tui/src/components/markdown.ts` (2) | Requires source remediation and a new hosted CodeQL result. |
| High | `js/remote-property-injection` | `packages/utils/src/json-parse.ts` (1) | Requires a data-structure change or reviewed false-positive disposition. |
| Medium | `js/network-data-written-to-file` | `packages/coding-agent/src/session/session-storage.ts` (1), `packages/utils/src/logger.ts` (1) | Intended persistence sinks, but no alert was dismissed; security review must decide. |

No CodeQL alert was dismissed or suppressed during this execution. GitHub’s
documented resolution paths are source remediation or an audited dismissal;
the latter is a security-governance decision, not an implementation shortcut.

## SBOM vulnerability inventory

The local scan ran with `GRYPE_DB_AUTO_UPDATE=false`; it did not contact an
external vulnerability service. Findings resolve to these installed developer
artifacts:

| Artifact | Findings | Installed evidence |
|---|---:|---|
| `node_modules/@typescript/typescript-darwin-arm64/lib/tsc` | Go standard library and `golang.org/x/text` findings | Go `1.26.4`; `golang.org/x/text v0.38.0` |
| `node_modules/@typescript/native-preview-darwin-arm64/lib/tsgo` | Same module-level findings | Go `1.26.4`; `golang.org/x/text v0.38.0` |

Syft reported no function symbols for those binaries, so Grype matched at
module granularity. Release closure requires either upgraded binaries or
evidence that release artifacts exclude them, followed by an artifact-scoped
scan. They cannot be silently accepted because the source-tree SBOM includes
development dependencies by design.

## Required closure

| Gate | Required proof |
|---|---|
| CodeQL High | New exact-SHA analysis with no unresolved High alerts. |
| CodeQL Medium | Written security disposition plus green required checks. |
| TypeScript-Go binaries | Upgrade or prove exclusion from distributable artifacts; rescan exact artifacts. |
| Dependency audits | Fresh Bun, Rust, and Python audit results on the exact candidate SHA. |
| Release SBOM | Regenerate from the merged SHA and verify checksum after merge. |

---
title: OH-MY-PI Fresh Stack Execution Ledger
version: 2.0.0
status: blocked
created_date: 2026-10-03
tags:
  - oh-my-pi
  - migration
  - evidence
confidence: 98
owner: MIKKOH Chen
---

# Execution Ledger

This ledger supersedes the v18.4.8 candidate narrative. It separates current
local evidence, remote branch identity, historical PR#1 evidence, and gates
that remain blocked. No entry authorizes a merge, release, registry publish,
approved-SHA installation, or Desktop launcher change.

## Canonical identity

| Field | Verified value |
|---|---|
| Repository | `https://github.com/Frictionless-Labs/oh-my-pi.git` |
| Upstream | `https://github.com/can1357/oh-my-pi.git` |
| Fork `main` | `717f97f4d22b3d65c4a4eef6a744255d46f4d1a6` |
| Upstream `v18.5.0` | `9348320cc4a30a7195d36a1f05a6c11bcb701a17` |
| Preserved PR#1 head | `9a7703654d51345120c3e4202a46412fc4ae8ff7` |
| Fresh code candidate | `e31c536eae2222224255e1f25719df5881f4be26` |

## Focused branch stack

Every listed SHA was compared with its remote branch on 2026-10-03.

| Order | Branch | SHA | Outcome |
|---:|---|---|---|
| 1 | `codex/oh-my-pi-upstream-v18-5` | `9348320cc4a30a7195d36a1f05a6c11bcb701a17` | Exact upstream v18.5.0 tag; fork main is an ancestor. |
| 2 | `codex/oh-my-pi-runtime-foundation` | `435dd07c1ef73530fb1189446439bd4580caeb55` | Local-only runtime, launcher, isolation, and dependency foundation. |
| 3 | `codex/oh-my-pi-operations-governance` | `b2345ecad0af53eda67fbcca934a4d04b94125c3` | Hosted CI, supply-chain controls, launcher tests, and release governance. |
| 4 | `codex/oh-my-pi-windows-correctness` | `06204fb4a0d69e5a5eaabe68f99993f49b1b3ed9` | Portable path, filesystem, and Rust behavior restored. |
| 5 | `codex/oh-my-pi-owned-source-security` | `e31c536eae2222224255e1f25719df5881f4be26` | Owned-source boundary hardening plus v18.5 integration reconciliation. |

The non-documentation tree at the fresh code candidate is byte-identical to
the preserved PR#1 head. The value of the fresh stack is reviewability and
rollback isolation, not a different product implementation.

## Current local verification

| Gate | Command | Exit | Evidence |
|---|---|---:|---|
| TypeScript | `CI=1 bun run ci:test:ts` | `0` | All package suites and the configured 110-file global-state, 66 UI, 31 runtime/session, and 85 native/tooling/browser buckets completed with zero failures. |
| Rust | `CI=1 bun run test:rs` | `0` | 3,075 nextest tests passed, 5 skipped; doctest pass completed, including one `tree_sitter_go` doctest. |
| Python RPC | `pytest -q python/omp-rpc/tests` | `0` | 93 tests and 19 subtests passed. |
| Python robomp | `pytest -q python/robomp/tests` | `0` | 672 passed, 4 skipped, 3 dependency deprecation warnings. |
| Static | `CI=1 bun check` | `0` | TypeScript, formatting, and Rust checks passed; one unchanged `no-unsafe-optional-chaining` warning remains in an upstream test. |
| Operational scripts | `CI=1 bun run test:scripts` | `0` | 132 passed, 1 platform skip. |
| Focused security | `bun test <20 owned-source files>` | `0` | 453 passed, 0 failed. |
| Secret history | `gitleaks git . --log-opts='--all'` | `0` | 28,809 commits and 555.91 MB scanned; no leaks. |
| Secret tree | `gitleaks dir .` | `0` | 187.76 MB scanned; no leaks. |
| Diff integrity | `git diff --check` | `0` | No whitespace errors. |

## Current security blockers

| Finding | Evidence | Classification |
|---|---|---|
| PR#1 aggregate CodeQL | GitHub check `111136751959` reports 9 new alerts: 7 High and 2 Medium. | `BLOCK_RELEASE` |
| Candidate SBOM scan | Local Grype scan without database auto-update reports 8 High and 3 Medium findings in bundled TypeScript-Go developer binaries. | `PROVE_NOW` |
| Fresh hosted CI | No PR exists for the focused stack, so no exact-SHA hosted matrix or CodeQL result exists. | `BLOCK_RELEASE` |
| Contributor attestation | Repository policy requires MIKKOH-authored understanding and personal review/exercise evidence. | `BLOCK_RELEASE` |

## Historical PR#1 state

At live verification, PR#1 was open, Draft, and Git-mergeable at head
`9a7703654d51345120c3e4202a46412fc4ae8ff7`. Fifteen jobs were successful,
but the aggregate CodeQL check failed. Therefore “15 of 15 required checks”
is not a defensible statement of overall readiness.

## Terminal state

`CODEX_OH_MY_PI_FRESH_STACK_BLOCKED_CODEQL_HUMAN_POLICY_HOSTED_CI`

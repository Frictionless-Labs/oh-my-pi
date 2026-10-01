---
title: OH-MY-PI Zero-Cost Production Operations
version: 1.0.0
status: candidate
created_date: 2026-10-01
tags:
  - oh-my-pi
  - operations
  - rollback
confidence: 97
owner: MIKKOH Chen
---

# Production Operations

## Approved operating boundary

| Control | Approved value |
|---|---|
| Repository | `Frictionless-Labs/oh-my-pi` |
| Upstream baseline | `v18.4.8@717f97f4d22b3d65c4a4eef6a744255d46f4d1a6` |
| Fork release tag | `v18.4.8+frictionless.1` |
| Runtime | Ollama 0.35.0, loopback only, cloud disabled |
| Model | `qwen3-coder:30b` |
| Model digest | `06c1097efce0431c2045fe7b2e5108366e43bee1b4603a7aded8f21689e90bca` |
| OMP profile | `frictionless-local` |
| Mandatory service cost | `$0` |

No package registry publication is authorized. GitHub-hosted public-repository
CI, local Ollama inference, and the local model are the only mandatory runtime
dependencies.

## Launcher contract

`Open-Pi.command` refuses to launch unless all of these are true:

- The canonical checkout is clean `main` at the owner-only approved SHA.
- Bun is at least 1.4 and locked dependencies/native/generated assets exist.
- Ollama cloud is disabled and the server listens only on loopback.
- The exact approved model digest is installed.
- The isolated profile exposes only the approved Ollama model.
- Telemetry export is disabled before the CLI starts.

The tracked launcher and Desktop copy must remain byte-identical. Operational
logs record event names only; they do not record prompts, model output,
credentials, or repository contents.

## Release procedure

1. Require green local gates, candidate-hosted gates, and CodeQL results on
   the exact candidate SHA.
2. Merge through the active `main` ruleset without force or history rewrite.
3. Verify the merged SHA, create the annotated fork tag, and build binaries
   with `bun scripts/ci-release-build-binaries.ts` only.
4. Generate checksums, CycloneDX SBOM, release notes, and a provenance manifest
   that all identify the merged SHA.
5. Create the GitHub Release and verify every downloaded asset checksum.
6. Write the exact merged SHA to the owner-only local approved-SHA file.
7. Rebuild the canonical checkout and run the Terminal and Finder launcher
   acceptance suites before declaring the release complete.

Never run `bun run release`; it includes registry publication behavior outside
this operating boundary.

## Rollback

The archived pre-synchronization fork is protected by
`frictionless-baseline-20260930` at
`969a94c1eeccb1b7528cd5621934bca1908ab622`. Validate rollback only in a
disposable worktree; never reset or rewrite canonical `main`.

| Objective | Target | Proof |
|---|---|---|
| RPO | Zero commits | Immutable baseline tag and release tag preserve both states. |
| RTO | At most 30 minutes | Timed disposable-worktree restore/build probe. |
| Canonical safety | No mutation | Rollback exercise uses a separate worktree. |

## Continuous controls

| Control | Schedule | Failure behavior |
|---|---|---|
| Full cross-platform CI | Wednesday 05:41 UTC | GitHub workflow notification |
| CodeQL and dependency/secret audit | Monday 06:17 UTC | GitHub workflow notification |
| Upstream release/divergence monitor | Monday 07:23 UTC | Fails on baseline tag drift or newer stable release |
| Dependabot | Weekly | Opens dependency pull requests, never issues |
| Launcher self-check | Every launch | Stops before model execution |

All workflows have explicit timeouts, read-only default permissions, immutable
third-party action SHAs, and no paid runner, registry, telemetry, or alerting
dependency.

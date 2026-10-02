---
title: OH-MY-PI Production Security Evidence
version: 1.1.0
status: candidate
created_date: 2026-10-01
tags:
  - oh-my-pi
  - security
  - supply-chain
confidence: 99
owner: MIKKOH Chen
---

# Security Evidence

This evidence applies to production-readiness candidate
`e42957edcca44d367951689d52884c723272cd73`, based on upstream `v18.4.8` at
`717f97f4d22b3d65c4a4eef6a744255d46f4d1a6`. All 15 ruleset-required GitHub
checks passed on that exact candidate. Release evidence must use the merged SHA
and externally generated artifacts before publication.

## Gate results

| Gate | Result | Same-run evidence |
|---|---|---|
| Full Git history | PASS | Hosted Gitleaks 8.30.1 scanned 20,957 commits and 323.08 MB at the exact candidate with no leaks; the detector-scope canary produced the required finding. |
| Candidate committed tree | PASS | The exact candidate is included in the hosted full-history scan; GitHub Actions checked out the committed tree with full history. |
| Candidate patch | PASS | Every candidate commit from the frozen base through the exact head is included in the same full-history scan. |
| JavaScript vulnerabilities | PASS | Hosted `bun audit --audit-level=high` reported no vulnerabilities across 516 packages. |
| Rust vulnerabilities | PASS | Hosted `cargo audit` reported zero vulnerabilities and four adjudicated maintenance warnings. |
| Rust policy | PASS | Hosted `cargo deny check` reported advisories, bans, licenses, and sources all OK. |
| Python vulnerabilities | PASS | Hosted pip-audit 2.10.1 reported no known vulnerabilities; editable local packages were intentionally skipped. |
| Cross-ecosystem scan | PASS | A fresh external SBOM for the exact candidate passed Grype 0.119.0 with `--fail-on medium --only-fixed`: no vulnerabilities found. |
| Static analysis | PASS | CodeQL v4.38.2 `security-extended` passed for Actions, JavaScript/TypeScript, Python, and Rust on the exact candidate. |
| Candidate SBOM | PASS | A fresh `git archive` scan produced 2,177 components and reconciled all 565 external Bun lock records. SHA-256: `fa0b35cac0531ca694ee021c53224d06186155d593d74794316f7c092e5c269b`. |

The exact-candidate SBOM is retained outside the scanned source at
`/tmp/omp-e429-sbom.kSCplu/SBOM.json`. The tracked
`docs/production-readiness/SBOM.json` is a 1,921-component snapshot generated
at `2026-10-01T10:01:12-04:00`; it is not exact-current evidence. A tracked
SBOM cannot attest to the commit that contains itself because committing it
changes the commit identity. The release authority is therefore an SBOM
generated outside a fresh archive of the merged SHA and published as a GitHub
Release asset with checksums and provenance.

## Hosted and governance evidence

| Control | Exact result |
|---|---|
| Required checks | 15/15 ruleset-required contexts passed on the candidate SHA. |
| Rust matrix | Ubuntu 3,083 passed/6 skipped; macOS 3,061 passed/5 skipped; Windows 2,814 passed/4 skipped; doctest passes completed. |
| Script suite | Ubuntu ran 47 tests across seven files: 40 passed, seven macOS-only launcher tests skipped, zero failed. |
| Repository alerts | At 2026-10-02T18:47:03Z, open CodeQL, Dependabot, and secret-scanning alerts were each zero. |
| Review state | PR#1 had zero reviews, zero review threads, and zero issue comments. Automated qualification is not human review. |
| Repository visibility | Public; there were no GitHub Releases or deployments at 2026-10-02T18:47:03Z. The runtime is local-only, not the repository or future release. |
| Upstream drift | Upstream published `v18.4.12` at commit `7318a70cf4ed04133366884d2723f72d9d490a15` on 2026-10-02; this candidate remains intentionally frozen at `v18.4.8`. Release approval must explicitly accept the frozen base or requalify a new base. |
| Publication boundary | Inherited npm publication scripts remain in the repository. PR#1 does not invoke or authorize them, and the operating runbook forbids `bun run release`; this is an operational exclusion, not code removal. |
| Main ruleset | Active ruleset `24312690` requires strict, up-to-date success for 15 contexts and permits squash or rebase merges. |
| Release-tag ruleset | Active ruleset `24312691` protects `v*+frictionless.*` creation, update, and deletion; organization administrators can bypass it. |

## Adjudicated Rust maintenance warnings

| Advisory | Dependency path | Decision |
|---|---|---|
| `RUSTSEC-2025-0141` | `syntect -> bincode 1.3.3` | No known vulnerability and no safe upgrade; advisory-specific exception. |
| `RUSTSEC-2024-0436` | `candle/gemm -> paste 1.0.15` | No known vulnerability and no safe upgrade; advisory-specific exception. |
| `RUSTSEC-2026-0192` | `fontdue/pdf-inspector -> ttf-parser 0.25.1` | No known vulnerability and no safe upgrade; advisory-specific exception. |
| `RUSTSEC-2024-0320` | `syntect -> yaml-rust 0.4.5` | No known vulnerability and no safe upgrade; advisory-specific exception. |

The yanked `yoke-derive 0.8.3` package was upgraded to `0.8.4`. Yanked
packages remain denied; the four exceptions above do not suppress future
vulnerabilities or maintenance advisories.

## Secret classification

The initial history scan reported 168 candidate detections across 66 commits.
Review classified them as public protocol identifiers, generated catalog model
IDs, synthetic credential fixtures, scanner signatures, or public debug key
material. `.gitleaks.toml` uses Gitleaks 8.30.1's `targetRules` key for
rule-and-path-scoped exceptions; an unrelated private-key canary under an
allowlisted catalog path remains detected. `.gitleaksignore` records exact
historical fingerprints. No detector is disabled globally.

## License inventory

| Ecosystem | Evidence | Result |
|---|---|---|
| Rust | cargo-deny 0.20.2, all features and targets | License policy PASS; package-scoped exceptions remain in `deny.toml`. |
| JavaScript | 379 unique installed package/version records | 377 permissive; `kitty-vt-wasm` is GPL-3.0-only and development-only; optional `sharp` carries an LGPL-3.0-or-later libvips binary. |
| Python | 34 installed distributions | Permissive or MPL-2.0; Ruff 0.13.3 carries an MIT license file and classifier despite omitting `License-Expression`. |

Release notices must preserve the existing `THIRD-PARTY-NOTICES.txt`. The
GPL-only terminal parser is not a production dependency and must not be added
to a release artifact. The optional libvips binary must retain its packaged
license and dynamic-linking replacement terms if distributed.

## Supply-chain provenance

- Every external GitHub Action reference resolves to its exact 40-character
  commit SHA through the GitHub API.
- Ollama 0.35.0 came from the official GitHub release ZIP, passed SHA-256
  verification, `codesign`, and Gatekeeper notarization checks.
- The approved model is `qwen3-coder:30b` with immutable Ollama digest
  `06c1097efce0431c2045fe7b2e5108366e43bee1b4603a7aded8f21689e90bca`.
- macOS release binaries are ad-hoc signed by the repository build script.
  They are not represented as Developer ID notarized artifacts.
- The Desktop launcher is local source, byte-matched to the tracked launcher,
  owner-executable only, and fail-closed on repository origin and SHA, model
  digest, exact Ollama version, live cloud status, loopback-only listeners,
  provider overrides, and clean-tree checks.

## Network and telemetry boundary

The isolated `frictionless-local` profile exposes exactly one model:
`ollama/qwen3-coder:30b`. Ollama cloud is disabled in server configuration and
through `OLLAMA_NO_CLOUD=1`; the launcher also requires the daemon's live
`/api/status` response to report cloud disabled. It requires every port 11434
listener and every effective Ollama client endpoint to be
`127.0.0.1:11434`, and exports `OTEL_SDK_DISABLED=true`. A sandboxed runtime
test denied external DNS/network access while preserving loopback inference.

## Historical documentation checks

Root `SPEC.md` and `RUNBOOK.md` do not exist in the frozen source tree. The
previously reported unverified strategy citation and obsolete `SyncResult`
terminology therefore require no source correction (`NO_OP_EVIDENCED`).

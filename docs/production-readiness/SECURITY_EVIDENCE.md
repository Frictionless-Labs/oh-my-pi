---
title: OH-MY-PI Production Security Evidence
version: 1.0.0
status: candidate
created_date: 2026-10-01
tags:
  - oh-my-pi
  - security
  - supply-chain
confidence: 97
owner: MIKKOH Chen
---

# Security Evidence

This evidence applies to the production-readiness candidate based on upstream
`v18.4.8` at `717f97f4d22b3d65c4a4eef6a744255d46f4d1a6`. Release evidence must replace
the candidate SHA with the merged SHA before publication.

## Gate results

| Gate | Result | Same-run evidence |
|---|---|---|
| Full Git history | PASS | Gitleaks 8.30.1 scanned 28,443 commits and 540.48 MB; no leaks found. |
| Candidate working tree | PASS | Gitleaks directory scan covered 178.07 MB; no leaks found. |
| Candidate patch | PASS | Gitleaks stdin scan covered the 119.94 KB redacted binary diff; no leaks found. |
| JavaScript vulnerabilities | PASS | `bun audit --audit-level=high` reported no vulnerabilities. |
| Rust vulnerabilities | PASS | `cargo audit` reported zero vulnerabilities and four maintenance warnings. |
| Rust policy | PASS | `cargo deny check` reported advisories, bans, licenses, and sources all OK. |
| Python vulnerabilities | PASS | pip-audit 2.10.1 reported no known vulnerabilities for 32 third-party distributions; the two editable local packages were intentionally skipped. |
| Cross-ecosystem scan | PASS | Grype 0.119.0 found no vulnerabilities in the CycloneDX SBOM at the Medium threshold. |
| Static analysis | CONFIGURED | CodeQL v4.38.2 uses `security-extended` for Actions, JavaScript/TypeScript, Python, and Rust. Hosted conclusions remain required before release. |
| SBOM | PASS | `SBOM.json` is CycloneDX with 1,921 components; SHA-256 `9cf57d033105eb0d3d635eb59e1b0280b09f6e88ab26bb41e8fe1958ced78138`. |

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
material. `.gitleaks.toml` contains rule-and-path-scoped exceptions for current
content; `.gitleaksignore` records exact historical fingerprints. No detector
is disabled globally.

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
  owner-executable only, and fail-closed on repository SHA, model digest,
  loopback binding, cloud disablement, and clean-tree checks.

## Network and telemetry boundary

The isolated `frictionless-local` profile exposes exactly one model:
`ollama/qwen3-coder:30b`. Ollama cloud is disabled in server configuration and
through `OLLAMA_NO_CLOUD=1`; the launcher binds the server to
`127.0.0.1:11434` and exports `OTEL_SDK_DISABLED=true`. A sandboxed runtime
test denied external DNS/network access while preserving loopback inference.

## Historical documentation checks

Root `SPEC.md` and `RUNBOOK.md` do not exist in the frozen source tree. The
previously reported unverified strategy citation and obsolete `SyncResult`
terminology therefore require no source correction (`NO_OP_EVIDENCED`).

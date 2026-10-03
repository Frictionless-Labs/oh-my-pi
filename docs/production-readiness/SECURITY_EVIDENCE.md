---
title: OH-MY-PI Production Security Evidence
version: 1.3.0
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

The production-readiness branch is being requalified by merging immutable
upstream tag `v18.4.12` at `7318a70cf4ed04133366884d2723f72d9d490a15`
into predecessor `3b99d9d8c908c281f7d16ac2cb965c14f8f95abe`. The pre-commit merge tree
passes the repository's isolated TypeScript harness, Rust wrapper, script suite,
type/lint/format checks, and the Python 3.9 prelude regression. The resulting
commit identity, hosted checks, and exact-head SBOM remain `PROVE_NOW` until the
merge is committed and qualified. The last candidate with all 15
ruleset-required GitHub checks passing is `e42957edcca44d367951689d52884c723272cd73`.

## Gate results

| Gate | Result | Evidence |
|---|---|---|
| Full Git history | PASS — predecessor | Hosted Gitleaks 8.30.1 scanned 20,957 commits and 323.08 MB at `e42957edcca44d367951689d52884c723272cd73` with no leaks; the detector-scope canary produced the required finding. |
| Candidate committed tree | PROVE_NOW | The current candidate requires its own hosted full-history scan. |
| Candidate patch | PROVE_NOW | The current candidate requires its own hosted full-history scan through the exact head. |
| JavaScript vulnerabilities | PASS — predecessor | Hosted `bun audit --audit-level=high` reported no vulnerabilities across 516 packages. |
| Rust vulnerabilities | PASS — predecessor | Hosted `cargo audit` reported zero vulnerabilities and four adjudicated maintenance warnings. |
| Rust policy | PASS — predecessor | Hosted `cargo deny check` reported advisories, bans, licenses, and sources all OK. |
| Python vulnerabilities | PASS — predecessor | Hosted pip-audit 2.10.1 reported no known vulnerabilities; editable local packages were intentionally skipped. |
| Cross-ecosystem scan | PASS — v18.4.8 predecessor | A fresh external SBOM for `d8a60d8c1caaac11bf9339f23a6ac679892ffe85` passed Grype 0.119.0 with `--fail-on medium --only-fixed`: no vulnerabilities found. The v18.4.12 merge requires a new exact-head scan. |
| Static analysis | PASS — predecessor | CodeQL v4.38.2 `security-extended` passed for Actions, JavaScript/TypeScript, Python, and Rust on `e42957edcca44d367951689d52884c723272cd73`; current-candidate CodeQL is pending. |
| Candidate SBOM | PROVE_NOW | The v18.4.8 predecessor archive produced 2,177 components and reconciled all 565 external Bun lock records. The v18.4.12 merge requires a fresh external archive scan after commit. |

The v18.4.8 predecessor SBOM is retained outside the scanned source at
`/tmp/omp-d8a60-sbom.LDcbOM/SBOM.json`. The predecessor SBOM remains at
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
| Required checks | 15/15 ruleset-required contexts passed on predecessor `e42957edcca44d367951689d52884c723272cd73`; the v18.4.12 merge requires its own external check record after commit. |
| Rust matrix | Predecessor hosted results: Ubuntu 3,083 passed/6 skipped; macOS 3,061 passed/5 skipped; Windows 2,814 passed/4 skipped; doctest passes completed. |
| Local TypeScript | v18.4.12 pre-commit merge tree: 193/193 isolated test chunks passed, zero failed. Two raw monolithic runs accumulated late-process failures consistent with shared-state/resource contamination; the repository's fresh-process CI harness passed every affected area and is authoritative. |
| Local Rust | v18.4.12 pre-commit merge tree: `bun run test:rs` exited zero, including nextest and the separate doctest pass. |
| Script suite | v18.4.12 pre-commit merge tree: 45/45 passed across seven files with 126 assertions. Predecessor hosted Ubuntu run: 40 passed, seven macOS-only launcher tests skipped, zero failed. |
| Repository alerts | At 2026-10-02T18:47:03Z, open CodeQL, Dependabot, and secret-scanning alerts were each zero. |
| Review state | PR#1 had zero reviews, zero review threads, and zero issue comments. Automated qualification is not human review. |
| Repository visibility | Public; there were no GitHub Releases or deployments at 2026-10-02T18:47:03Z. The runtime is local-only, not the repository or future release. |
| Upstream drift | Upstream published `v18.4.12` at commit `7318a70cf4ed04133366884d2723f72d9d490a15` on 2026-10-02. That immutable tag is now merged into the local candidate tree; hosted and exact-head security requalification remain pending. |
| Publication boundary | Inherited npm publication scripts remain in the repository. PR#1 does not invoke or authorize them, and the operating runbook forbids `bun run release`; this is an operational exclusion, not code removal. |
| Local operational state | At 2026-10-02T18:55:29Z, canonical `main` was clean at the frozen base and the profile configuration existed, but Ollama, its port 11434 listener, the approved-SHA file, and the Desktop launcher were absent. Final runtime canaries and Finder acceptance are blocked. |
| Drift monitor | The workflow exists only on the PR branch and is not listed by GitHub Actions on default `main`; scheduled drift detection is unproved until merge and its first successful run. |
| Actions policy | Selected external owners only, SHA pinning required, read-only default workflow permissions, and Actions may not approve PRs. |
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
- The previously qualified Ollama 0.35.0 artifact came from the official GitHub
  release ZIP and passed SHA-256, `codesign`, and Gatekeeper notarization checks.
- The approved model is `qwen3-coder:30b` with immutable Ollama digest
  `06c1097efce0431c2045fe7b2e5108366e43bee1b4603a7aded8f21689e90bca`.
- macOS release binaries are ad-hoc signed by the repository build script.
  They are not represented as Developer ID notarized artifacts.
- Prior qualification byte-matched a Desktop launcher to the tracked source and
  proved its fail-closed contracts. The Desktop copy is currently absent and
  must be installed owner-executable before final acceptance.

## Network and telemetry boundary

The qualified `frictionless-local` profile configuration exposes exactly one
model: `ollama/qwen3-coder:30b`. The launcher rejects all automatically loaded
provider override filenames, symlinked profile paths, inherited configuration
roots and overlays, and extension discovery. Discovery and execution share the
canonical repository cwd and pinned profile environment. The launcher also
requires cloud-disabled server configuration, `OLLAMA_NO_CLOUD=1`, a live
`/api/status` response reporting cloud disabled, loopback-only listeners and
endpoints, and `OTEL_SDK_DISABLED=true`. A prior sandboxed runtime test denied
external DNS/network access while preserving loopback inference. The current
daemon is not running, so live cloud, model, listener, and inference state are
unknown.

## Historical documentation checks

Root `SPEC.md` and `RUNBOOK.md` do not exist in the frozen source tree. The
previously reported unverified strategy citation and obsolete `SyncResult`
terminology therefore require no source correction (`NO_OP_EVIDENCED`).

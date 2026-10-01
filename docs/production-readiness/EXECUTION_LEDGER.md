---
title: OH-MY-PI Production Readiness Execution Ledger
version: 1.0.0
status: in-progress
created_date: 2026-10-01
tags:
  - oh-my-pi
  - production-readiness
  - evidence
confidence: 97
owner: MIKKOH Chen
---

# Execution Ledger

Append-only evidence for the production-readiness run against the public
`Frictionless-Labs/oh-my-pi` fork. Output is redacted before inclusion.

## 2026-10-01T12:01:55Z — Phase 0 repository identity

| Field | Value |
|---|---|
| Timestamp | `2026-10-01T12:01:55Z` |
| Phase | `0` |
| Mode | `AUDIT` |
| CWD | `/Users/mikkohchen/Developer/mkkh-labs/oh-my-pi` |
| Branch | `main` |
| HEAD | `969a94c1eeccb1b7528cd5621934bca1908ab622` |
| Command | `gh api repos/{fork,upstream}; gh api branches/main; gh api releases/latest; git ls-remote` |
| Exit code | `0` |
| Output evidence | Fork is public, active, and reports parent/source `can1357/oh-my-pi`; fork `main=969a94c1eeccb1b7528cd5621934bca1908ab622`; upstream `main=6e4ac4a1a7a07b0f48217f479441e15ab7cd7dea`; stable release `v18.4.8`, published `2026-10-01T06:08:07Z`. |
| Files changed | None |
| Classification | `NO_OP_EVIDENCED` |
| Follow-up | Recover the absent canonical checkout from the verified fork. |
| Reviewer | Executor |
| Secrets check | PASS — GitHub token value was not printed. |

## 2026-10-01T12:07:46Z — Phase 0 canonical recovery

| Field | Value |
|---|---|
| Timestamp | `2026-10-01T12:07:46Z` |
| Phase | `0` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi` |
| Branch | `main` |
| HEAD | `969a94c1eeccb1b7528cd5621934bca1908ab622` |
| Command | `git clone <verified fork> <canonical path>; git remote add upstream <verified upstream>; git fetch --tags` |
| Exit code | `0` |
| Output evidence | Git root equals the canonical path; `origin` and `upstream` match the verified HTTPS repositories; worktree is clean. |
| Files changed | Canonical checkout created; repository content unchanged. |
| Classification | `FIX_NOW` |
| Follow-up | Freeze the current stable release and preserve the fork baseline. |
| Reviewer | Executor |
| Secrets check | PASS — remote URLs contain no credentials. |

## 2026-10-01T12:08:29Z — Phase 1 frozen target

| Field | Value |
|---|---|
| Timestamp | `2026-10-01T12:08:29Z` |
| Phase | `1` |
| Mode | `AUDIT` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi` |
| Branch | `main` |
| HEAD | `969a94c1eeccb1b7528cd5621934bca1908ab622` |
| Command | `git rev-parse v18.4.8^{commit}; git merge-base; git rev-list --left-right --count; git tag -v` |
| Exit code | `0` for ancestry; `1` for signature verification |
| Output evidence | `v18.4.8=717f97f4d22b3d65c4a4eef6a744255d46f4d1a6`; merge-base is the fork baseline; fork is `0` ahead and `6532` behind; update is fast-forward. The upstream tag is lightweight, so Git reports `cannot verify a non-tag object of type commit`. |
| Files changed | None |
| Classification | `PROVE_NOW` |
| Follow-up | Preserve the baseline tag locally; record the absence of an upstream tag signature without treating it as verified. |
| Reviewer | Executor |
| Secrets check | PASS — no sensitive output. |

## 2026-10-01T12:09:10Z — Phases 1-2 rollback anchor and worktree

| Field | Value |
|---|---|
| Timestamp | `2026-10-01T12:09:10Z` |
| Phase | `1-2` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi/.worktrees/production-readiness` |
| Branch | `codex/oh-my-pi-production-readiness` |
| HEAD | `717f97f4d22b3d65c4a4eef6a744255d46f4d1a6` |
| Command | `git tag -a frictionless-baseline-20260930 <fork-main>; git worktree add <readiness-worktree> -b <readiness-branch> v18.4.8` |
| Exit code | `0` |
| Output evidence | Baseline tag peels to `969a94c1eeccb1b7528cd5621934bca1908ab622`; readiness branch and worktree resolve to the frozen release; canonical `main` remains clean. |
| Files changed | `docs/production-readiness/EXECUTION_LEDGER.md` |
| Classification | `FIX_NOW` |
| Follow-up | Bootstrap the source-required toolchain and prove the frozen baseline. |
| Reviewer | Executor |
| Secrets check | PASS — no credentials or private payloads recorded. |

## 2026-10-01 — Phase 3 reproducible toolchain

| Field | Value |
|---|---|
| Timestamp | `2026-10-01` — exact execution time not retained |
| Phase | `3` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi/.worktrees/production-readiness` |
| Branch | `codex/oh-my-pi-production-readiness` |
| HEAD | `717f97f4d22b3d65c4a4eef6a744255d46f4d1a6` |
| Command | Version checks; checksum/signature checks; `bun install --frozen-lockfile` |
| Exit code | `0` |
| Output evidence | Bun 1.4.2, CMake 4.4.3, Ninja 1.13.2, Rust nightly-2026-08-12, Python 3.12, Docker 29.8.1, GitHub CLI 2.96.0, cargo-nextest 0.9.146, and Bazelisk 1.29.0 available. Lockfile install completed. |
| Files changed | None |
| Classification | `NO_OP_EVIDENCED` |
| Follow-up | Prove the complete frozen source tree. |
| Reviewer | Executor |
| Secrets check | PASS — versions and public checksums only. |

## 2026-10-01 — Phase 4 frozen target validation

| Field | Value |
|---|---|
| Timestamp | `2026-10-01` — exact execution time not retained |
| Phase | `4` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi/.worktrees/production-readiness` |
| Branch | `codex/oh-my-pi-production-readiness` |
| HEAD | `717f97f4d22b3d65c4a4eef6a744255d46f4d1a6` |
| Command | `bun check`; `bun run ci:test:ts`; `bun run test:rs`; Python tests/lint; script, smoke, install-method, generator, and web build gates |
| Exit code | `0` |
| Output evidence | TypeScript 191/191 chunks; Rust 3,059 passed and 5 skipped plus doctest pass; omp-rpc 89 passed; robomp 665 passed and 4 skipped; scripts 37/37; smoke and binary/source/tarball install probes passed; generated lock/config checks and robomp web build passed. |
| Files changed | Runtime package-leak fix, deterministic test isolation fixes, Python formatting, local package install order, Ruff pin, changelog. |
| Classification | `FIX_NOW` |
| Follow-up | Replace unsafe private-runner/release workflows with hosted validation. |
| Reviewer | Executor |
| Secrets check | PASS — candidate patch scan found no leaks. |

## 2026-10-01 — Phase 5 workflow safety

| Field | Value |
|---|---|
| Timestamp | `2026-10-01` — exact execution time not retained |
| Phase | `5` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi/.worktrees/production-readiness` |
| Branch | `codex/oh-my-pi-production-readiness` |
| HEAD | `717f97f4d22b3d65c4a4eef6a744255d46f4d1a6` |
| Command | Workflow inspection; action SHA API verification; actionlint 1.7.12 |
| Exit code | `0` |
| Output evidence | Publish/release jobs and private-runner dependencies removed; hosted Ubuntu/macOS/Windows matrices added; default token permission is contents-read; all external Actions use GitHub-verified commit SHAs; actionlint passed. |
| Files changed | `.github/actions/bun-install/action.yml`; CI/Nix/security/upstream workflows; obsolete cache warm workflow removed. |
| Classification | `FIX_NOW` |
| Follow-up | Prove hosted checks on synchronized main and candidate SHA. |
| Reviewer | Executor |
| Secrets check | PASS — workflows do not expose or print secrets. |

## 2026-10-01 — Phase 6 local-only Ollama runtime

| Field | Value |
|---|---|
| Timestamp | `2026-10-01` — exact execution time not retained |
| Phase | `6` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi/.worktrees/production-readiness` |
| Branch | `codex/oh-my-pi-production-readiness` |
| HEAD | `717f97f4d22b3d65c4a4eef6a744255d46f4d1a6` |
| Command | Ollama signature/Gatekeeper checks; model pull; isolated profile probes; sandboxed offline test |
| Exit code | `0` |
| Output evidence | Official Ollama 0.35.0 is notarized; cloud disabled; loopback-only listener; one exposed model; immutable digest `06c1097efce0431c2045fe7b2e5108366e43bee1b4603a7aded8f21689e90bca`; plain response, read/bash/write tools, malformed-call rejection, timeout, restart, and no-egress inference passed. |
| Files changed | User-local Ollama and isolated OMP configuration only. |
| Classification | `FIX_NOW` |
| Follow-up | Gate Desktop launch on exact release and runtime identity. |
| Reviewer | Executor |
| Secrets check | PASS — no API key required or stored. |

## 2026-10-01 — Phase 7 launcher candidate

| Field | Value |
|---|---|
| Timestamp | `2026-10-01` — exact execution time not retained |
| Phase | `7` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi/.worktrees/production-readiness` |
| Branch | `codex/oh-my-pi-production-readiness` |
| HEAD | `717f97f4d22b3d65c4a4eef6a744255d46f4d1a6` |
| Command | `zsh -n`; byte comparison; `Open-Pi.command --check-only` |
| Exit code | `0` syntax/identity; `1` expected fail-closed pre-release |
| Output evidence | Tracked and Desktop launchers are byte-identical with SHA-256 `07e848564f6fa2e76f6f57f494d191e889bb16ea3aee5e79d267e7e59faf1bad`; launcher stops with `approval_missing` until the merged SHA is installed. |
| Files changed | Tracked launcher and owner-executable Desktop copy. |
| Classification | `PROVE_NOW` |
| Follow-up | Install merged SHA, run fault matrix, then Finder acceptance. |
| Reviewer | Executor |
| Secrets check | PASS — operational log contains event labels only. |

## 2026-10-01T13:40:00Z — Phase 8 security and supply chain

| Field | Value |
|---|---|
| Timestamp | `2026-10-01T13:40:00Z` |
| Phase | `8` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi/.worktrees/production-readiness` |
| Branch | `codex/oh-my-pi-production-readiness` |
| HEAD | `717f97f4d22b3d65c4a4eef6a744255d46f4d1a6` |
| Command | Gitleaks history/tree/patch; Bun audit; cargo audit/deny; pip-audit; Syft; Grype; action SHA API verification |
| Exit code | `0` |
| Output evidence | History 28,443 commits/540.48 MB clean; working tree 178.07 MB clean; patch 119.94 KB clean; zero known vulnerabilities; Grype zero findings at Medium threshold; cargo-deny all policy groups OK; final candidate CycloneDX SBOM contains 1,921 components; every external Action SHA resolves through GitHub. |
| Files changed | Gitleaks policy/baseline; Rust lock/policy; JavaScript overrides; security workflow; `SECURITY_EVIDENCE.md`; `SBOM.json`. |
| Classification | `FIX_NOW` |
| Follow-up | Regenerate SBOM/checksum on merged SHA and require hosted CodeQL conclusions. |
| Reviewer | Executor |
| Secrets check | PASS — all scanner output redacted; no detector disabled globally. |

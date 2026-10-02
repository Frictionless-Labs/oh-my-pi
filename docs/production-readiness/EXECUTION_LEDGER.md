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

## 2026-10-01T15:20:13Z — Phase 9 fork synchronization

| Field | Value |
|---|---|
| Timestamp | `2026-10-01T15:20:13Z` |
| Phase | `9` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi` |
| Branch | `main` |
| HEAD | `717f97f4d22b3d65c4a4eef6a744255d46f4d1a6` |
| Command | Remote identity and ancestry checks; baseline tag push; fast-forward `main` push; remote SHA verification |
| Exit code | `0` |
| Output evidence | Remote `main` equals the frozen `v18.4.8` commit; no force push occurred; `frictionless-baseline-20260930` peels to `969a94c1eeccb1b7528cd5621934bca1908ab622`. |
| Files changed | Remote references only. |
| Classification | `NO_OP_EVIDENCED` |
| Follow-up | Require hardened hosted validation on the readiness candidate and merged `main`. |
| Reviewer | Executor |
| Secrets check | PASS — remote URLs and object IDs only. |

## 2026-10-01T15:20:13Z — Phase 10 hosted validation repair

| Field | Value |
|---|---|
| Timestamp | `2026-10-01T15:20:13Z` |
| Phase | `10` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi/.worktrees/production-readiness` |
| Branch | `codex/oh-my-pi-production-readiness` |
| HEAD | `dbd8408b0d9ccd4a972bb1018f2bfc0df4439391` |
| Command | GitHub Actions and check-run API inspection; exact-SHA reruns; Windows failure-log review; full local Rust regression suite |
| Exit code | `0` for repaired local suite; prior candidate Windows job `1` |
| Output evidence | Candidate `8bad613b4e276dbcac75e64d43adfbeeb856d96f` passed Nix, security, CodeQL, Ubuntu install/smoke/Rust, macOS install/smoke/Rust, and exposed six Windows path-contract failures. Commit `dbd8408b0d9ccd4a972bb1018f2bfc0df4439391` repairs all six; local Rust result is 3,059 passed and 5 skipped plus doctests. |
| Files changed | Windows path handling and portable assertions in `crates/pi-builtins`, `crates/pi-edit`, and `crates/pi-shell`. |
| Classification | `FIX_NOW` |
| Follow-up | Require every hosted context green on the latest PR SHA, then repeat hardened workflows on merged `main`. |
| Reviewer | Executor |
| Secrets check | PASS — GitHub logs were redacted; no token material retained. |

## 2026-10-01T15:20:13Z — Phase 11 readiness PR and review

| Field | Value |
|---|---|
| Timestamp | `2026-10-01T15:20:13Z` |
| Phase | `11` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi/.worktrees/production-readiness` |
| Branch | `codex/oh-my-pi-production-readiness` |
| HEAD | `dbd8408b0d9ccd4a972bb1018f2bfc0df4439391` |
| Command | PR API inspection; full branch diff review; workflow permission and mutation scan; Gitleaks history/tree/patch scans |
| Exit code | `0` |
| Output evidence | Draft `PR#1` is mergeable with 10 focused commits and 47 changed files; review found no publication job, private runner, mutable third-party Action ref, workflow secret reference, stray artifact, or live secret. Windows findings were reproduced and corrected before readiness. |
| Files changed | No review-only mutation; fixes are recorded in their focused commits. |
| Classification | `PROVE_NOW` |
| Follow-up | Require latest-SHA hosted success, refresh the redacted patch scan, update the PR evidence, and mark ready. |
| Reviewer | Executor (Codex independent pass) |
| Secrets check | PASS — final candidate scan required again immediately before merge. |

## 2026-10-01T15:20:13Z — Phase 12 repository governance

| Field | Value |
|---|---|
| Timestamp | `2026-10-01T15:20:13Z` |
| Phase | `12` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi/.worktrees/production-readiness` |
| Branch | `codex/oh-my-pi-production-readiness` |
| HEAD | `dbd8408b0d9ccd4a972bb1018f2bfc0df4439391` |
| Command | GitHub repository, Actions permissions, security settings, and ruleset API configuration and verification |
| Exit code | `0` |
| Output evidence | Active `main` ruleset `24312690` requires pull requests, linear history, resolved conversations, 15 exact strict checks, and blocks deletion/non-fast-forward updates. Active release-tag ruleset `24312691` protects `refs/tags/v*+frictionless.*`. Actions are read-only by default with GitHub-owned and two selected third-party families allowed, and GitHub requires immutable SHA pins. Dependency graph, alerts, security updates, secret scanning, push protection, and private vulnerability reporting are enabled. |
| Files changed | GitHub repository settings only. |
| Classification | `NO_OP_EVIDENCED` |
| Follow-up | Verify the rulesets enforce the latest candidate merge and protected release-tag creation. |
| Reviewer | Executor |
| Secrets check | PASS — settings payloads contained no credential values. |

## 2026-10-01T17:14:37Z — Phase 10 Windows contract repair

| Field | Value |
|---|---|
| Timestamp | `2026-10-01T17:14:37Z` |
| Phase | `10` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi/.worktrees/production-readiness` |
| Branch | `codex/oh-my-pi-production-readiness` |
| HEAD | `c5aa2062411949f3bf7eb40ca51091e99d5c7b18` |
| Command | Failed Windows job inspection; regression RED/GREEN; `bun run fmt:rs`; `bun run check:rs`; `bun run test:rs`; `bun check`; `git diff --check` |
| Exit code | `0` for final local gates; authoritative Windows candidate job `1` before the repair |
| Output evidence | Windows run `36883753594`, job `110442215477`, ran 2,813 tests: 2,809 passed, 4 failed, 4 skipped. The failures were nested bare-name edit recovery and two trailing-separator-only `PWD` assertions. The repair compares validated trailing path components independent of slash spelling and tests path identity for Windows temp variables. Final local Rust result: 3,060 passed, 5 skipped, plus doctests; Rust checks and `bun check` passed. |
| Files changed | `crates/pi-edit/src/path_policy.rs`; `crates/pi-shell/src/shell.rs` |
| Classification | `FIX_NOW` locally; `PROVE_NOW` on hosted Windows |
| Follow-up | Push the exact candidate and require all 15 strict hosted contexts to succeed on its SHA. |
| Reviewer | Executor |
| Secrets check | PASS — only public CI diagnostics and path-shape values were retained. |

## 2026-10-01T20:11:59Z — Phase 11 independent review remediation

| Field | Value |
|---|---|
| Timestamp | `2026-10-01T20:11:59Z` |
| Phase | `11` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi/.worktrees/production-readiness` |
| Branch | `codex/oh-my-pi-production-readiness` |
| HEAD reviewed | `7d39995abc6e1429cb4c51262674692ff400de0c` |
| Command | Independent read-only whole-branch review; focused RED/GREEN tests; repaired Gitleaks canary; Rust, script, type, format, and SBOM/Grype verification |
| Exit code | `0` for repaired local gates; prior review classified release `BLOCK_RELEASE` |
| Output evidence | Review found malformed Gitleaks rule scoping, launcher endpoint/cloud/version/listener/origin gaps, path-filtered required Nix checks, incomplete Bun lock coverage in the SBOM, and a suffix-recovery symlink regression. Focused tests now pass: launcher faults 7/7, SBOM reconciliation 3/3, scripts 47/47, Rust 3,061 passed and 5 skipped plus doctests, and `bun check`. Reconciled candidate SBOM includes all 565 external Bun lock records and passes Grype 0.119.0 at the Medium threshold. |
| Files changed | Gitleaks policy; CI/Nix workflows; launcher and fault tests; suffix recovery test/implementation; SBOM generator/tests; production-readiness evidence. |
| Classification | `FIX_NOW` locally; `PROVE_NOW` on the final committed SHA and hosted checks |
| Follow-up | Commit and push focused repairs, then require every strict hosted context and the repaired redacted scans on the exact candidate SHA. |
| Reviewer | Independent Codex reviewer plus executor remediation |
| Secrets check | PASS — unrelated private-key canary remained detected inside a generic-key allowlisted path; the canary was synthetic and temporary. |

## 2026-10-02T18:47:03Z — Phase 12 durable evidence reconciliation

| Field | Value |
|---|---|
| Timestamp | `2026-10-02T18:47:03Z` |
| Phase | `12` |
| Mode | `FIX` |
| CWD | `/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi/.worktrees/production-readiness` |
| Branch | `codex/oh-my-pi-production-readiness` |
| HEAD verified | `e42957edcca44d367951689d52884c723272cd73` |
| Command | Live PR/ruleset/alert audit; exact hosted-log reconciliation; fresh `git archive`; external Syft 1.52.0 SBOM augmentation; Grype 0.119.0 `--fail-on medium --only-fixed` |
| Exit code | `0` for the final evidence commands; an initial disposable archive attempt failed because its source directory was absent, and the first retry found Bun missing from `PATH` before the explicit installed binary was used. |
| Output evidence | PR#1 remained Draft with zero reviews, threads, and comments. All 15 required contexts passed on the predecessor candidate. Hosted script result was 40 passed/7 macOS-only skipped across seven files. Hosted Rust results were Ubuntu 3,083/6, macOS 3,061/5, and Windows 2,814/4. A fresh exact-candidate external SBOM contained 2,177 components and all 565 Bun lock records; Grype found no fixed Medium-or-higher vulnerabilities. Open CodeQL, Dependabot, and secret-scanning alerts were each zero. |
| SBOM classification | The tracked 1,921-component SBOM is a historical snapshot, not exact-current evidence. Exact merged-SHA authority must be generated outside the archive and published as a checksummed GitHub Release asset. |
| Governance classification | Active rulesets exist out of band; PR#1 does not add them. The public repository has no releases or deployments. GitHub Discussions is disabled, and no retained proof of required prior Discord discussion was found. |
| Classification | `FIX_NOW` durable evidence repaired locally; `PROVE_NOW` successor-SHA hosted checks; `BLOCK_RELEASE` human review, hands-on testing, contributor sentence, prior-discussion proof or maintainer waiver, merged-SHA SBOM, launcher canaries, and rollback qualification. |
| Files changed | `docs/production-readiness/SECURITY_EVIDENCE.md`; `docs/production-readiness/EXECUTION_LEDGER.md` |
| Reviewer | Executor; independent whole-branch review pending on the successor SHA. |
| Secrets check | PASS — only public repository metadata, test totals, digests, and redacted scanner results were retained. |

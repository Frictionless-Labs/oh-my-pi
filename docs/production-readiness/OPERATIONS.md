---
title: OH-MY-PI Fresh Stack Operations
version: 2.1.0
status: blocked
created_date: 2026-10-03
tags:
  - oh-my-pi
  - operations
  - rollback
confidence: 98
owner: MIKKOH Chen
---

# Operations

## Current operating boundary

| Control | State |
|---|---|
| Canonical repository | `Frictionless-Labs/oh-my-pi` |
| Source baseline | Upstream `v18.5.0@9348320cc4a30a7195d36a1f05a6c11bcb701a17` |
| Fresh code candidate | `5728251d1839b537490ee5af7c2e3b74355ae701` |
| Mandatory service cost | `$0`; existing local/OSS stack only |
| Registry publication | Prohibited |
| Merge or release | Not authorized and not ready |
| Approved-SHA file | Not installed |
| Finder acceptance | Not run |

The implementation is a source candidate, not a production release. Existing
Pi installations were not changed or removed; their current live operation was
not reverified during this source qualification. Discarding or superseding
PR#1 does not remove those installations. The fresh stack must not be installed
as the approved runtime until every gate below closes.

## Review and integration order

| Step | Branch | Required acceptance |
|---:|---|---|
| 1 | `codex/oh-my-pi-upstream-v18-5` | Exact upstream tag and ancestry. |
| 2 | `codex/oh-my-pi-runtime-foundation` | Runtime/launcher behavior and focused tests. |
| 3 | `codex/oh-my-pi-operations-governance` | Workflow permissions, CI boundaries, and release exclusions. |
| 4 | `codex/oh-my-pi-windows-correctness` | Hosted Windows plus macOS/Linux parity. |
| 5 | `codex/oh-my-pi-owned-source-security` | CodeQL, dependency audits, and owned-source review. |
| 6 | `codex/oh-my-pi-readiness-evidence` | Independent-review fixes, dependency lock, and exact-SHA evidence. |

Each pull request must target the prior branch until the stack is reviewed.
After all layers are accepted, the maintainer may retarget or merge them in
order. No pull request may be created by automation until MIKKOH completes the
repository’s human-contributor policy.

## Release gates

| Gate | Current state | Closure |
|---|---|---|
| Human understanding | BLOCKED | MIKKOH writes one sentence in MIKKOH’s own words for each PR. |
| Personal exercise | BLOCKED | MIKKOH reviews the diff and exercises the changed behavior. |
| Hosted CI | BLOCKED | Exact focused-stack SHA passes Linux, macOS, and Windows. |
| CodeQL | BLOCKED | Resolve or formally disposition all 9 live alerts. |
| Artifact vulnerabilities | BLOCKED | Clear or prove exclusion of the 11 SBOM findings. |
| Upstream drift | BLOCKED | Review and qualify the `v18.5.0..v18.5.1` delta or explicitly retain the frozen baseline. |
| Merge | BLOCKED | Branch rules, reviews, and checks pass. |
| Release | BLOCKED | Merged-SHA SBOM, checksums, provenance, canary, rollback, and Finder acceptance pass. |

## Rollback

| Layer | Rollback target | Constraint |
|---|---|---|
| Fresh review stack | Prior focused branch SHA | Revert through a new commit; never rewrite published history. |
| Existing PR#1 | Preserved Draft PR#1 head `9a7703654d51345120c3e4202a46412fc4ae8ff7` | Keep as historical evidence until the fresh stack is accepted. |
| Fork baseline | `main@717f97f4d22b3d65c4a4eef6a744255d46f4d1a6` | Do not reset or force-push canonical main. |
| Runtime | Existing installed Pi/Ollama state | Do not replace until release and launcher gates pass. |

## Stop condition

`CODEX_OH_MY_PI_FRESH_STACK_BLOCKED_SECURITY_UPSTREAM_DRIFT_HUMAN_POLICY_HOSTED_CI`

## After completion

| Outcome | Next action |
|---|---|
| Human policy complete | Create Draft PRs in stack order. |
| Hosted check fails | Fix only the owning layer; rerun the exact gate. |
| Upstream delta accepted | Rebase a new qualified stack; do not rewrite these published branches. |
| All PR gates green | Obtain human approvals, then merge in order. |
| Merged SHA qualified | Generate release artifacts in a disposable workspace. |
| Any security gate unresolved | Do not merge, tag, publish, approve, or install. |

---
title: OH-MY-PI Fresh Stack Migration
version: 1.1.0
status: implemented-blocked
created_date: 2026-10-03
tags:
  - oh-my-pi
  - migration
  - pull-requests
confidence: 98
owner: MIKKOH Chen
---

# Fresh Stack Migration

## Decision

Start fresh at the pull-request architecture level, not at the product-code
level. Reimplementing Pi from zero would discard a tested upstream codebase and
increase security risk. Preserving the qualified changes while splitting them
into five focused code branches makes review, rollback, and fault isolation
materially easier.

## What is preserved

| Asset | Treatment |
|---|---|
| Existing Pi installation | Untouched; it can continue to run. |
| PR#1 | Preserved as Draft historical evidence; not merged or deleted. |
| Upstream v18.5.0 | Exact immutable base of the fresh stack. |
| Qualified source changes | Replayed or restored into focused branches. |
| Local tests and security controls | Re-executed against the fresh code candidate. |

## What is replaced

| Old shape | New shape |
|---|---|
| One broad PR spanning runtime, CI, Windows, security, and evidence | Five focused code layers plus one reviewer-remediation and evidence layer. |
| Stale v18.4.8 documentation | Current v18.5.0 evidence with explicit blocked states. |
| “All checks passed” summary | Live state: 15 successful PR#1 jobs plus one failing aggregate CodeQL check. |
| Stale 1,921-component SBOM claim | Exact 2,290-component SBOM bound to the fresh code SHA, including robomp's locked graph. |

## Migration invariants

| Invariant | Proof |
|---|---|
| No functional loss relative to PR#1 | Layer 5 is byte-identical to PR#1; the final candidate contains only independently reviewed fixes, workflow coverage, and dependency-lock expansion. |
| Upstream identity | Stack root equals upstream v18.5.0 commit. |
| Published history preserved | The first five focused branches were pushed without force or rewrite; the terminal branch is published only after fresh independent review. |
| Existing runtime preserved | No approved-SHA, Desktop launcher, merge, release, or registry mutation occurred. |
| Security truthfulness | CodeQL and Grype blockers are recorded, not converted into readiness claims. |

## Human contributor gate

Before each Draft PR is created, MIKKOH must personally review the relevant
diff, exercise the changed behavior, and provide one original sentence in this
shape:

> This PR changes [MIKKOH’s understanding] because [MIKKOH’s reason].

Generated summaries, transcripts, and checklists are context only; they are
not MIKKOH’s attestation.

## Upstream drift gate

Upstream `v18.5.1@d0cc52397dc2a68d39cba49b0009b9e50ffd643e`
was published after this stack froze at `v18.5.0`. This execution does not
silently absorb that delta. A maintainer must either qualify it in a new stack
or explicitly accept the frozen baseline before merge.

## Completion definition

The migration implementation is complete when the six remote branches exist,
their SHAs match local heads, the final evidence branch is clean, and a fresh
review finds no Critical or Important defects. Production readiness remains a
separate state requiring human policy, hosted CI, CodeQL, vulnerability,
merge, release, rollback, and launcher acceptance gates.

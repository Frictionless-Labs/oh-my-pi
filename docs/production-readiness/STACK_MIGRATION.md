---
title: OH-MY-PI Fresh Stack Migration
version: 1.0.0
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
| One broad PR spanning runtime, CI, Windows, security, and evidence | Five focused code layers plus one evidence layer. |
| Stale v18.4.8 documentation | Current v18.5.0 evidence with explicit blocked states. |
| “All checks passed” summary | Live state: 15 successful PR#1 jobs plus one failing aggregate CodeQL check. |
| Stale 1,921-component SBOM claim | Exact 2,254-component SBOM bound to the fresh code SHA. |

## Migration invariants

| Invariant | Proof |
|---|---|
| No functional loss relative to PR#1 | Non-documentation trees are byte-identical at the fresh code candidate and preserved PR#1 head. |
| Upstream identity | Stack root equals upstream v18.5.0 commit. |
| Published history preserved | Every focused branch was pushed without force or rewrite. |
| Existing runtime preserved | No approved-SHA, Desktop launcher, merge, release, or registry mutation occurred. |
| Security truthfulness | CodeQL and Grype blockers are recorded, not converted into readiness claims. |

## Human contributor gate

Before each Draft PR is created, MIKKOH must personally review the relevant
diff, exercise the changed behavior, and provide one original sentence in this
shape:

> This PR changes [MIKKOH’s understanding] because [MIKKOH’s reason].

Generated summaries, transcripts, and checklists are context only; they are
not MIKKOH’s attestation.

## Completion definition

The migration implementation is complete when the six remote branches exist,
their SHAs match local heads, the final evidence branch is clean, and a fresh
review finds no Critical or Important defects. Production readiness remains a
separate state requiring human policy, hosted CI, CodeQL, vulnerability,
merge, release, rollback, and launcher acceptance gates.

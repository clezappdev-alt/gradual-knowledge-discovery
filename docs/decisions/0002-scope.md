# ADR 0002 — Jurisdiction: GKD owns the truth about the repository, not the delivery

- **Status:** proposed (owner approval pending)
- **Date:** 2026-11-02
- **Deciders:** Carlos Leceta
- **Related:** `PRD.md` §6–§7, `docs/research/001-kaddo-audit.md`, `docs/research/002-kaddo-delivery-parity.md`

## Context

The owner's instruction was that GKD should cover "at least the same cases as Kaddo", as a module that
adds value to gentle-ai users. Kaddo is not one capability but two halves, and the audit measured them:

- The **delivery half** (work items, roadmap, plans, verify gates, importers, admin UI, capsules) is
  16 of 43 command files plus ~40 subcommands — the majority, not the remainder.
- The **discovery half** is thinner than it looks: Kaddo's knowledge base is seeded from templates and
  filled by agents and humans, its graph never reads source content, and no command takes a budget or a
  level.
- Its **"living documentation"** mechanism is a diff-participation heuristic: a knowledge artifact whose
  `code:` globs match touched files, but whose own file is absent from the same diff, produces a
  non-blocking FYI. Artifact content is never compared to the code. No re-derivation, no content hash,
  no freshness stamp against HEAD.

The parity map then compared all thirteen delivery capabilities against ODD, the `odd/tasks/` feature
document and RDD: **two clean duplicates** (the work-item lifecycle *decision*, the refinement
handoff), **six partial**, and **five gaps** — external import, per-criterion evidence ledger,
cross-feature plan aggregation, topology proposal validation, capsules.

## Decision

**GKD's jurisdiction is knowledge about the repository.** What it is, where things live, what is no longer
true, at the cheapest sufficient level, with evidence a human can check in one hop.

**The delivery lifecycle stays in gentle-ai** — ODD for tasks and phases, RDD for completion and review
authority, the tracked feature document for requirements and the journal.

The boundary rule, citable in future arguments:

> **gentle-ai governs the work; GKD governs the truth about the repository.**
> A capability belongs to GKD if its answer can be *derived from the tree* and must be *evidence-bound*.
> It belongs to the harness if it *decides*, *assigns*, *advances* or *gates* work.

## Consequences

**Explicitly not built:** work items and their state directories, roadmap, plans and epics, verify
gates, external importers, admin UI, knowledge capsules, multirepo mapping, topology apply.

**Accepted losses** (recorded in the parity map, §4): a team loses the standing tracker, the shared
status surface, the Jira/GitHub/Azure bridge, the machine-checkable work-item contract, and the
per-criterion evidence ledger.

**Two of those gaps belong to the harness, not to GKD**, and this ADR records that instead of absorbing
them: the per-acceptance-criterion evidence ledger and cross-feature plan aggregation are delivery
artifacts. Building them inside a module would create the second source of truth that `AGENTS.md` hard
rule 1 forbids. They are candidates for gentle-ai; GKD must not grow into them.

**What the decision buys:** one promise that can be tested — every GKD answer is derived from the tree,
carries evidence, respects a declared budget, and knows whether it is still true.

## Alternatives rejected

| Alternative | Why rejected |
|---|---|
| Full parity with Kaddo | Duplicates ODD/RDD outcomes, violates hard rule 1, and entrenches two sources of truth for delivery |
| Port `guard`/`drift` feature for feature | The audited mechanism is a participation heuristic; GKD's freshness stamp is strictly stronger, and cloning the weaker one would be regression dressed as compatibility |
| Absorb the two delivery gaps "because they are knowledge-shaped" | A ledger of completion is a delivery decision; keeping it out is what makes the boundary defensible |

## Revisit trigger

If a real user needs a durable tracker inside the repository, that is a gentle-ai feature request, not a
scope change here. The one exception worth entertaining: a **derived view** of work that answers a
knowledge-shaped question ("what is proposed but not started", "what changed without its documentation"),
which stays on GKD's side of the line because it derives rather than decides.

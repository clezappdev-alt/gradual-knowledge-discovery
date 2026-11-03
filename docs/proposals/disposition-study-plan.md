# Plan — deciding the four dispositions, block by block

**Status:** plan, awaiting execution in a clean session.
**Date:** 2026-11-02
**Why this exists:** the owner cannot approve `ADR 0002` from a table of verdicts. He needs, per
capability: **what stays and what goes relative to Kaddo, the reason, and the implementation design**.
This plan turns that into four blocks, each of session size, each with a decision and an artifact.

**The input table** is `docs/proposals/scope-and-design.md` §2 (13 parity rows) and §4 (5 things a team
would notice missing) — 18 lines in total. **The output of the whole plan** is that same 18-line table,
with every cell filled and every decision approved.

---

## The single artifact to converge on

One table, 18 rows, one row per capability, with six columns:

| Column | Question it answers |
|---|---|
| **capability** | which of the 18 |
| **disposition** | HARNESS / GKD / OUT / DEFERRED |
| **what stays, what goes** | relative to Kaddo, in one sentence |
| **reason** | why, with the citation that supports it |
| **design** | for GKD: the mechanism; for OUT/DEFERRED: the trigger or the acceptance |
| **status** | `proposed` → `approved` |

Nothing else counts as done. A block that ends without its rows filled is an open block.

---

## Order of work, and why this order

**OUT → HARNESS → DEFERRED → GKD.**

Subtract first: deciding what will *not* be built is the cheapest decision in the plan and the one that
protects every later block from scope creep. Then confirm that the things we are not building are
genuinely covered elsewhere — the block where blind spots appear. Then park what nobody owns, with a
trigger. Then design what remains, which is the only block that produces product.

A rule for all four blocks: **no row changes disposition without a citation.** The audit (`001`) and the
parity map (`002`) are the evidence base; a block that cannot cite belongs in "open questions", never in
the table.

---

## Block 1 — OUT (6 rows)

**Rows:** external import, admin UI, capsules, owners/ownership globs, topology apply, resources registry.

**The question:** for each, is the loss acceptable *with the loss written next to it*, and who would feel
it?

**Work:** for each row, one short paragraph — what Kaddo does (cited), what a gentle-ai user does instead,
what they lose, and the sentence a user would say when they feel it. Then the owner's verdict:
accept the loss, or move the row to DEFERRED with a trigger.

**Deliverable:** rows 6, 7, 8, 9, 11, 12 of the table filled; `ADR 0003 — Accepted exclusions` listing
each loss in the owner's terms.

**Exit criteria:** every row has a written loss and an owner decision; no row says "revisit later" without
a trigger.

**Why first:** it shrinks the surface from 18 rows to 12 before anything else is discussed.

---

## Block 2 — HARNESS (5 rows)

**Rows:** work-item lifecycle, plans/epics aggregation, verify + evidence ledger, learn/captured learning,
refinement handoff.

**The question:** does gentle-ai *actually* cover this outcome today, in a form a user can rely on — or are
we assuming coverage that does not exist?

**Work:** per row, name the exact artifact, phase or command (with citation), and write the **acceptance
sentence**: "a user who needs X does Y and gets Z". Where the sentence cannot be written, the row is a
**gap**, and gaps get one of two labels — `harness-issue` (belongs to gentle-ai) or `back to GKD` (it is
knowledge-shaped after all).

This block will confirm or break the claim that two rows are `duplicate`. That claim is the weakest link
in ADR 0002, so this block is where the ADR can be falsified.

**Deliverable:** rows 1, 3, 4, 5, 13 filled; **two issue briefs** (not issues posted — briefs) for the
per-criterion evidence ledger and cross-feature plan aggregation, each stating the gap, the evidence, and
why it belongs to the harness rather than to GKD.

**Exit criteria:** every HARNESS row has an acceptance sentence or is converted to a labelled gap.

---

## Block 3 — DEFERRED (2 rows)

**Rows:** roadmap/backlog as a durable artifact; deprecation planning.

**The question:** what exactly would have to happen for this to earn a build, and who notices when it
happens?

**Work:** per row, a **trigger** with four parts — the observable event, the person who observes it, the
cost that motivates it, and the review date. A trigger that is not observable is not a trigger.

**Deliverable:** rows 2 and 10 filled; a short "parked with triggers" section, plus the review date
entered in the manifest-style table so it is not forgotten.

**Exit criteria:** both rows have all four trigger parts; neither can be reopened by a feature request.

---

## Block 4 — GKD (the rows that are ours)

**Rows:** none of the 18 — by design. This block designs the three capabilities from `scope-and-design.md`
§3, in three sessions if needed:

| Session | Capability | Deliverable |
|---|---|---|
| 4a | **Truth and freshness** (slice 1) | the full design: claim shape, stamp contents, extractor contract, `current`/`stale`/`orphaned` semantics, the envelope, the four refusals, the three fixtures and their scripted refactors, and the acceptance tests written before code |
| 4b | **Orientation with a declared budget** (slice 2) | the level ladder made concrete for a real repository, the trimming order, the budget estimator, and what each level refuses to answer |
| 4c | **Impact** (slice 3) | what "what breaks if I touch this" can be derived without a call graph, and the honest boundary where it cannot |

**Exit criteria for 4a:** a design an implementer can follow without asking a question, plus the list of
tests in red-first order. Nothing is built until the owner approves it.

---

## What each block produces, in one line

| Block | Ends with |
|---|---|
| OUT | 6 rows decided, losses written, `ADR 0003` |
| HARNESS | 5 rows confirmed or falsified, 2 harness issue briefs |
| DEFERRED | 2 rows parked with observable triggers and a review date |
| GKD | the design of the first slice, testable, approved |

## Rules that apply to every block

1. **Cite or park.** No disposition without evidence.
2. **One row, one decision.** A block meeting may not decide a row it did not study.
3. **The owner approves, the agent proposes.** Every block ends with a proposal, never with a merge.
4. **Small sessions.** If a block does not fit in one session, split by row, not by disposition.
5. **No code.** Blocks 1–3 produce decisions; block 4 produces a design. Implementation starts only after
   `ADR 0002` is approved and 4a is accepted.

## Open questions this plan inherits

- The owner's stated end goal — a module that covers "at least the same cases as Kaddo" — needs an
  explicit restatement once block 1 and 2 are done: after 12 of 18 rows are decided as not-ours, the
  sentence should say what GKD *is*, not what it is not.
- Whether a durable tracker (row 1's loss) is acceptable for long-term work, or must be escalated to
  gentle-ai before any adoption decision.

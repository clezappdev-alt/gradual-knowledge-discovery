# Scope and design — what happens to each verdict

**Status:** proposal, awaiting owner approval. It settles the *dispositions* (who owns each outcome from
now on) and sketches the design of the first slice. It does not authorize code.
**Date:** 2026-11-02
**Inputs:** `docs/research/001-kaddo-audit.md`, `docs/research/002-kaddo-delivery-parity.md`,
`PRD.md` §1–§7, `docs/decisions/0002-scope.md`.

---

## 1. Read this first: a verdict is not a disposition

The parity map answered **"what exists today"** (duplicate / partial / gap). That is not the question that
lets anyone approve a scope. The question is **"who owns this outcome from now on"**, and there are only
four answers:

| Disposition | Meaning | Who acts next |
|---|---|---|
| **HARNESS** | gentle-ai (ODD / RDD / the feature document) already owns the outcome; GKD must not touch it | nobody here; if it hurts, it is a gentle-ai issue |
| **GKD** | GKD builds it, because the answer is derivable from the tree and must carry evidence | this project |
| **OUT** | excluded on purpose, with the loss accepted and written down | nobody |
| **DEFERRED** | nobody owns it today; it waits for a named trigger | owner, when the trigger fires |

**The single most clarifying fact in this document:** of the thirteen parity rows, **zero** are GKD's.
All thirteen are delivery capabilities, and delivery now belongs to the harness. The parity map does not
produce GKD features — it produces a **boundary**. GKD's scope comes from the five questions in `PRD.md`
§1 plus the living-documentation requirement, not from Kaddo's command list.

---

## 2. Dispositions, row by row

| # | Kaddo capability | Verdict | Disposition | Owner | What that means concretely |
|---|---|---|---|---|---|
| 1 | Work-item lifecycle states | duplicate | **HARNESS** | ODD phases + tracked feature document | Tasks live in `## Tasks` with a status per line; slice boundaries come from work-unit commits. Nothing to build. |
| 2 | Roadmap / candidate backlog | partial | **DEFERRED** | owner | Today: candidates live in `PRD.md` §7 and in issues. Trigger to revisit: the first slice ships **and** you actually look for a roadmap twice. Then GKD may render a **derived** view ("proposed, not started") — never an authored roadmap artifact. |
| 3 | Plans / epics / initiatives progress | gap | **HARNESS** | ODD tracking | Cross-feature aggregation is work state. Escalated as a gentle-ai gap (§4). |
| 4 | Verify: AC evidence + release gates | partial | **HARNESS** | RDD + ODD verification | The completion *decision* exists and is stronger than Kaddo's. The **per-criterion evidence ledger** does not, and it is work state, not repo truth. Escalated (§4). |
| 5 | `learn` — captured learning | partial | **HARNESS** | Engram + feature document `## Log` | Learning about a session belongs to memory; learning about the repository belongs to GKD (§3). The split is by subject, not by storage. |
| 6 | Integrations import (Jira/GitHub/Azure) | gap | **OUT** | — | Accepted loss: every item arrives manually. Reopening requires an owner decision, not a feature request. |
| 7 | Admin UI | gap | **OUT** | — | Accepted loss: no web surface. Any state view is a terminal artifact. |
| 8 | Knowledge capsules | gap | **OUT** | — | Cross-repo knowledge exchange is multirepo, which `PRD.md` §6 excludes. |
| 9 | Owners / `code:` globs ownership | gap | **OUT** (v0) | — | Authored ownership is the mechanism GKD's thesis explicitly rejects. What survives is **derived**: evidence pointers already name the paths a claim depends on. |
| 10 | Deprecation planning | gap | **DEFERRED** | owner | Today: an ADR under `docs/decisions/`. Trigger: the first real subsystem removal. Then the question is whether *finding* dead surface is knowledge (GKD) or planning (harness) — likely both, split by the same boundary rule. |
| 11 | Topology proposals → validate → apply | gap | **OUT** | — | GKD derives structure; it never accepts an authored structural model and never applies one. That is the inverse direction and it would violate "derived, not authored". |
| 12 | Resources registry | gap | **OUT** | — | Accepted loss: hand-written `docs/reference/` pages when they exist. No typed registry, no environment scoping. |
| 13 | Refinement handoff | duplicate | **HARNESS** | delegation (skills, subagents) | Worker briefs by reference already exist. Nothing to build. |

### Summary

| Disposition | Count | Rows |
|---|---|---|
| HARNESS | 5 | 1, 3, 4, 5, 13 |
| DEFERRED | 2 | 2, 10 |
| OUT | 6 | 6, 7, 8, 9, 11, 12 |
| GKD | 0 | none — by design |

---

## 3. What GKD actually owns (the part Kaddo cannot serve)

GKD owns the answers to `PRD.md` §1's five questions and the truth of §1.1's living documentation. Its
dispositions are not in the table above because Kaddo has no equivalent to dispose of.

| GKD capability | Question it answers | Design approach | Slice |
|---|---|---|---|
| **Truth and freshness** | "¿sigue siendo cierto lo que el repo afirma de sí mismo?" | §5 below | **1** |
| Orientation with a declared budget | "¿qué es este repo y dónde empiezo?" | L0 claims, trimmed to a declared budget, each with a pointer | 2 |
| Impact | "¿qué se rompe si toco esto?" | derived from evidence pointers that name paths, not from a call graph | 3 |

---

## 4. The five things a team would notice missing — and who answers

| Missing thing | Disposition | What the team experiences | If it becomes unbearable |
|---|---|---|---|
| Standing tracker | HARNESS | The feature document is a per-feature journal, not a queryable tracker | gentle-ai issue, not a GKD feature |
| Shared status surface | OUT | State is read from terminal artifacts or by asking an agent | owner decision to reopen |
| Jira/GitHub/Azure bridge | OUT | Every item is re-keyed by hand | owner decision to reopen |
| Machine-checkable work-item contract | DEFERRED | The feature document is a prose convention; nothing validates it | trigger: the first time a malformed feature doc costs a session |
| Decommission / structural-apply ritual | OUT | Removal is prose plus memory | covered by row 10's trigger |

**Two of these are escalated, not absorbed:** the per-criterion evidence ledger (row 4) and cross-feature
plan aggregation (row 3) are real holes in gentle-ai's delivery story. They are recorded here so they are
not silently rebuilt inside a module — the one thing `AGENTS.md` hard rule 1 forbids.

---

## 5. Design of slice 1 — truth and freshness

**The promise.** A claim GKD made about a repository can be re-checked later, cheaply, and GKD will say
whether it still holds, what moved, and which claim broke — without reading the whole repository again.

**The unit is a claim with evidence**, not a document:

```
claim   : "the package manager is pnpm"
evidence: [pnpm-lock.yaml#sha, package.json#sha]
stamp   : { head: <sha>, extractor: "manifests@1" }
```

**The loop, in four steps:**

1. **Derive** — an extractor reads the tree and emits claims, each with the files (and content hashes) it
   depended on. Deterministic: same tree, same claims, byte for byte.
2. **Persist** — claims and stamps go to one declared state directory (`.gkd/`), never into the tree being
   analysed.
3. **Re-derive** — on `check`, hash the evidence files again and re-run the extractor if the input set
   changed.
4. **Report** — every claim becomes `current`, `stale` (evidence changed, extractor output differs) or
   `orphaned` (evidence file gone). Nothing is "probably fine": a claim either re-derives or it does not.

**What it explicitly refuses to do**, because these are the ways a freshness tool lies:

- It never judges *content* it cannot hash (no "the architecture is still sound").
- It never re-stamps silently: a claim whose evidence changed is `stale` until it is re-derived.
- It never authors: if no claim can be derived for an area, it says so in `unknowns`, not in prose.
- It never blocks delivery. Staleness is reported; the harness decides what to do with it.

**Envelope.** Same contract as every GKD answer (`gkd/answer@1`): `claims[]`, `unknowns[]`, `next[]`, plus
a `freshness` block carrying `current` / `stale` / `orphaned` counts and the paths that moved.

**Why this is not Kaddo's `guard`.** Kaddo asks "was the artifact's file touched in this diff?" — a
participation heuristic (`001-kaddo-audit.md` §5.1). GKD asks "does the claim still re-derive from the
tree?" — a truth check. The first can be true while the knowledge is false; the second cannot.

**Validation, as decided (D3):** three synthetic fixtures, one per repository kind, each with a scripted
refactor that must produce exactly the expected `stale`/`orphaned` claims. No real repository is read
until the mechanism is proven on fixtures.

---

## 6. What this document does not decide

- Whether a derived roadmap view (row 2) or derived deprecation candidates (row 10) ever exist. Both wait
  for their triggers.
- The shape of slices 2 and 3 beyond the one-line design above.
- Where the escalated gentle-ai gaps go (an issue there, a PR, or nothing yet).

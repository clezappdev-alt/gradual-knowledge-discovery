# PRD — Gradual Knowledge Discovery (GKD)

**Status:** draft for owner review.

**This document states the problem, not the solution.** No command, flag, format or layout described here
is authorized; requirements land in the ODD feature document, `odd/tasks/<feature>.md`, only after the
owner approves this problem statement.

**Date:** 2026-11-02
**Owner:** Carlos Leceta

---

## 1. The problem

Anyone who lands in an existing repository — a human engineer or an AI agent — has to answer the same
five questions before touching a line of code:

1. **What is this repository, and where do I start?**
2. **Where does X live?**
3. **What breaks if I change this?**
4. **Who uses or calls this?**
5. **What here is stale, or simply lying?**

Today the answer comes from asking an agent and then auditing **both the code and the agent's claims**.
That audit is the expensive part, and no tool in the current stack addresses it:

| Property of the cost | What it means today |
|---|---|
| **Unbounded** | Nothing says when to stop reading; "enough context" is a guess |
| **Unverifiable** | Claims arrive without provenance, so the human re-reads to check them |
| **Unaccounted** | Nobody measures how much of a task went into orienting |
| **Non-cumulative** | Nothing trustworthy survives the session; the next one starts over |

The owner's own description of the current workaround: *"por lo general preguntaría al agente y revisaría
el código y las afirmaciones de este."* The buyer is not just "an agent that explores faster" — it is **a
human who needs the agent's claims to be checkable in one hop instead of re-reading everything**.

### The three repository kinds, same pain, different weights

| Kind | Where the knowledge lives | Weight of the cost |
|---|---|---|
| **New** | In the code and in recent decisions | Low today, grows as it ages |
| **Pre-AI** | In tests, a few heads, and a wiki nobody trusts | Medium |
| **Legacy** | In the heads of people who may have left; no tests | **Highest — this is the beachhead** |

### The long-term requirement: documentation that stays alive

Companies ask, as a condition of long-term work, that a system accumulate and **maintain living
documentation**: what the product is, why the code exists, what was decided and when. It is asked for in
onboarding, in audits, in handovers, and every time the person who knew leaves.

Today that requirement is met by writing documents and hoping, and it fails for a structural reason:
**nothing checks them.** A document that contradicts the code is indistinguishable from a truthful one —
until someone re-reads both. So the documentation rots in a predictable order: it starts accurate, becomes
optimistic, then becomes fiction, and finally nobody cites it and the knowledge returns to people's heads.

The cost lands on exactly the same people as §1's five questions, and it is the same root cause: **a claim
about a repository that nobody can check cheaply.**

## 2. Who feels it

**Primary:** a gentle-ai / gentle-shell user working in a pre-AI or legacy repository. They already have
the harness (ODD, review, subagents); what they lack is a trustworthy, cheap answer to the five questions
above, inside that flow. Their actual job in that position is **reviewing what an agent claims** — and
that is the work this product exists to shorten.

**Institutional:** a team that must satisfy the living-documentation requirement of §1.1 — onboarding,
handover, audit, long-term maintenance. They do not want a documentation project; they want the
repository to keep telling the truth about itself without a person assigned to police it.

**Secondary:** every other agent (opencode, Claude, Kiro, …) reached through the same capability by
protocol, never by per-agent adapters — the same posture gentle-ai already takes.

## 3. What they do today, and what it costs

1. Ask an agent for an overview; receive a plausible summary.
2. Open the files the summary named, to see whether it was true.
3. Grep for the real answer, because the summary skipped what mattered.
4. Ask a more precise question; receive another plausible summary.
5. Give up at "good enough" and change code with residual risk.

Every step after the first is **verification of the previous answer**, and none of it is reusable: the
next session repeats it from zero. This is the cost GKD exists to remove — not the agent's read time,
the **human's audit time**.

## 4. Why the tools we already have do not close it

| Tool | Owns | Why it does not close this |
|---|---|---|
| **codegraph** | Where a symbol is and what calls it | Mechanical, per-language, no task relevance, no budget, no freshness, no curated claims |
| **Engram** | What happened in past sessions | Narrative written by agents; not repo truth, not verifiable against the tree |
| **GGA** | Whether a diff is any good | Reviews a change, not a codebase |
| **gentle-ai / ODD / RDD** | Process, requirements, review authority | It is the consumer of knowledge, not its provider |
| **Kaddo** | Knowledge of the product, organized in four layers, plus a Work Item lifecycle | Built for its own ecosystem and its own mechanics: TTY-bound setup, its own lifecycle and admin UI, `.kaddo/` layout. Its goal and ours coincide; its mechanics and its audience do not |

**The gap is not "Kaddo, but ours".** Kaddo's own framing — *prepare any codebase for AI-assisted
evolution; help the repo remember why the code exists* — is the goal GKD shares. What differs is where it
lives: inside ODD's mechanics, where the execution lifecycle (requirements, tasks, review, delivery)
already exists and must not be duplicated.

## 5. What "solved" looks like (measurable, not aspirational)

1. The five questions from §1 can be answered with **a pointer per claim**, so a human checks one hop
   instead of re-reading.
2. Same repository at the same commit produces the **same answer** — byte for byte, twice in a row.
3. A declared context budget is **never exceeded**, and what was left out is named.
4. After a refactor, what went **stale is named**, not silently served and not vaguely warned.
5. The number of files a human must open to trust an answer drops, and the drop is measurable against a
   baseline recorded before the tool exists.
6. Documentation that has stopped being true is **named as stale, with the path that moved**, without a
   person assigned to police it — and a team can point at that check instead of promising diligence.

## 6. Scope boundaries

Out of scope, deliberately, for the first published version:

- **No dependency on Kaddo, no `.kaddo/` compatibility, and no fork.** A study clone of upstream is a
  reference, never a base.
- **No LLM, no API key, no network, no telemetry.** A credential-free, deterministic tool.
- **No delivery lifecycle**: no work items, roadmap, admin UI, external integrations (Jira/GitHub/Azure),
  or knowledge capsules. ODD and RDD already own that inside gentle-ai, and rebuilding it
  inside a module would duplicate the harness — the one thing this project's rules forbid.
- **No delivery gates.** The tool informs; gentle-ai decides.
- **No per-agent adapters** (`AGENTS.md`, `CLAUDE.md`, editor plugins): other agents are reached by
  protocol.
- **No human-facing knowledge authoring**: it does not commission documentation and does not ask a team to
  write knowledge before it can help.

## 7. Open decisions (owner)

**Sequencing decision (closed):** no scope decision and no first slice until a deep, cited audit of
upstream Kaddo exists — what it really offers, command by command, and how each capability maps onto
gentle-ai's mechanics. The audit lives at `docs/research/001-kaddo-audit.md`.

**D1 — Scope decomposition.** "Cover at least the same cases as Kaddo" splits in two halves: the
*discovery* half (`scan`, `context`, `understand`, `explain`, drift check) and the *delivery lifecycle
half* (work items, roadmap, verify, admin, integrations). The second half is what ODD + RDD already do
inside gentle-ai. **Proposal: GKD owns the discovery half only.** Confirm or reject — after the
audit.

**D2 — Which of the five questions leads the first slice.** Orientation (Q1) is the gate to the rest;
impact (Q3) is where trust matters most; staleness (Q5) is the one a human cannot get anywhere else today.
Deferred until the audit lands: Kaddo may already answer one of them well enough to change the order.

**D3 — Validation repositories.** Not one repository: the owner's instruction is that the three repo
kinds (new, pre-AI, legacy) have different shapes and must be validated separately. The ADABAS legacy
converter is the natural legacy candidate, but reading it requires explicit owner permission: it lives
outside this project root.

**D4 — Study clone.** A read-only clone of upstream Kaddo (v3.132.0) under `references/`, with a TTL and
a manifest entry, to study its behaviour with citations. Authorized in principle by the owner; not yet
created.

# GKD Charter — Gradual Knowledge Discovery

> **This is a draft, not a requirement.** It is a hypothesis for the product scoping dialogue.
> No command, flag, output or layout described here is authorized until the owner approves it in the
> ODD feature document. `docs/` explains; the feature document decides.

**Status:** hypothesis (v0, awaiting product scoping and owner sign-off)
**Date:** 2026-10-27
**Owner:** Carlos Leceta
**Supersedes:** nothing. This document is written from scratch for this repository; no charter from earlier attempts is inherited.

---

## 1. The problem

An AI agent that lands in a repository it did not write pays an **exploration tax** before it can do
anything useful: it greps, reads files, guesses boundaries, re-reads the same areas next session, and
burns context on facts that a deterministic tool could have handed it in one screen.

The tax has four properties, and every existing tool attacks at most one of them:

| Property of the tax | What it means | Who addresses it today |
|---|---|---|
| **Unbounded** | Nothing tells the agent where to stop reading; "enough context" is a guess | — |
| **Non-reproducible** | Two agents in the same repo at the same commit discover different things, at different costs | codegraph (partially: symbol graph) |
| **Unaccounted** | No one measures how many tokens a task spent just to orient itself | — |
| **Non-cumulative** | What was learned about the repo does not survive the session in a form the next session can trust | engram (as narrative, not as repo truth) |

The neighbors each own a different question, and none owns this one:

- **codegraph** — "where is this symbol and what calls it?" Mechanical, per-language, no notion of
  task relevance, budget, freshness or curated knowledge.
- **engram** — "what happened in past sessions?" Agent-written narrative memory; no repo-wide
  structure, no verification against the tree.
- **gga** — "is this diff good?" Review of a change, not orientation in a codebase.
- **kaddo** — "what should this project know about itself?" Prescribes a knowledge model
  (Business → Product → Tech → Delivery) and front-loads authored artifacts through agent packs.
- **gentle-ai / gentle-shell** — the harness: policy, ODD, review authority, subagents, routing.

The unowned question is the one GKD takes:

> **Given this task and this budget, what is the cheapest sufficient truth about this repository, with
> evidence I can verify?**

## 2. What GKD is

**GKD is a deterministic knowledge-discovery engine for existing codebases: it answers an agent's
question about a repository at the shallowest level that is still sufficient, spends a declared token
budget instead of an open-ended one, and accumulates what it discovered with provenance and freshness.**

It is a CLI plus a library, distributed as npm packages, that plugs into gentle-ai / gentle-shell the
way GGA and Engram do — as a module of the harness, not as a replacement for it, and not as a fork of
anything.

Three words carry the product:

- **Gradual** — knowledge is disclosed in levels, escalated only on demand (section 3).
- **Knowledge** — claims about the repository that carry evidence, not vibes and not generated prose.
- **Discovery** — GKD derives what is already implicit in the tree, git history and manifests. It does
  not ask a human to author a knowledge base before it can help, and it never calls an LLM.

## 3. The gradual mechanism

### 3.1 Disclosure levels

| Level | Shape of the answer | Typical cost | Question it answers |
|---|---|---|---|
| **L0 — Orientation** | One bounded brief: repo kind, layout, entry points, test and CI surface, churn hotspots, documentation inventory, explicit unknowns | ≤ ~600 tokens | "What is this repo and where does my change belong?" |
| **L1 — Area** | One directory/module: responsibility signals, public surface, config, tests, recent changes, churn owners | ≤ ~1200 tokens | "What does this module own and how do I not break it?" |
| **L2 — Topic** | One cross-cutting concern (auth, persistence, deploy, error handling): files, edges, configs, docs, tests | ≤ ~2500 tokens | "Where does this concern live and what enforces it?" |
| **L3 — Evidence** | Exact excerpts: `path:line` ranges, commit ids, diff hunks | caller's budget | "Show me the code you are talking about." |

**Escalation rule (the core discipline):** never answer at L(n+1) when L(n) satisfies the caller's
declared need. Every answer ends with the cheapest next step that would deepen it, plus the list of
things GKD could not establish at that level. Deepening is the caller's decision, never a default.

### 3.2 Accretion and freshness

Discovery is not throwaway. Each answer produces knowledge entries carrying:

- the claim, its level and its area;
- its **evidence** (`path:line`, commit ids, manifest keys — never a claim without one);
- a **freshness stamp** (HEAD sha + content hashes of the evidence files);
- the extractor id and version that produced it.

`gkd check` re-derives the stamps and marks entries **current**, **stale** or **orphaned**
(evidence file gone). Stale knowledge is reported, never silently served and never blocking. A refactor
therefore does not invalidate the knowledge base — it dates the parts that moved, and says which.

### 3.3 Principles

1. **Deterministic before AI.** No LLM, no API key, no network. Same tree, same commit, same bytes out.
2. **No evidence, no knowledge.** Every claim points at its proof; unsupported guesses are reported as
   unknowns instead of claims.
3. **Derived, not authored.** GKD's knowledge store is a cache of derivations, not a document humans
   maintain. It is regenerable by definition, so it is not versioned by default.
4. **Headless first.** Every command runs with stdin closed. Interactivity is an optional convenience,
   never a requirement (a hard-won correction: TTY-bound commands cannot be used by workers).
5. **One state directory, declared.** All writes go under a single repository-scoped directory
   (`.gkd/`, overridable). GKD never scatters artifacts into `knowledge/`, the worktree root or temp
   directories on its own initiative.
6. **Never blocking.** GKD informs the harness. Delivery gates are gentle-ai's business.

## 4. Integration contract

One narrow surface, three verbs, every one of them `--json` by default in machine mode:

| Verb | Purpose | Level |
|---|---|---|
| `gkd brief [--budget N]` | Orient in a repository | L0 |
| `gkd discover <query> [--area PATH] [--budget N]` | Answer a task- or area-scoped question | L1 / L2, escalates to L3 |
| `gkd check` | Re-derive freshness of accumulated knowledge | — |

Plus the non-interactive setup verb `gkd init` (writes `.gkd/config.json`, flags only, stdin closed).

**Response envelope** (stable, versioned, same for CLI, Pi tools and MCP):

```json
{
  "schema": "gkd/answer@1",
  "level": "L0",
  "budget": { "declared": 600, "estimated": 412, "trimmed": ["churn"] },
  "claims": [{ "id": "...", "area": "...", "claim": "...", "evidence": ["path:12-30"], "confidence": "high" }],
  "unknowns": ["..."],
  "next": [{ "command": "gkd discover --area src/core --level L1", "cost": 900 }]
}
```

**Transports**, all thin — no logic outside the core:

1. `@gkd/cli` — the binary `gkd`. The contract everything else wraps, and the only thing that must be
   correct for the harness to work.
2. `@gkd/pi` — a Pi package registering `gkd_brief` / `gkd_discover` / `gkd_check` tools, so
   gentle-ai's ODD explore step can call discovery instead of improvising it.
3. `@gkd/mcp` — the same three tools over MCP for every other agent (opencode, Claude, IDE). Other
   agents are reached by protocol, never by per-agent adapters.

**Where the harness uses it:** `brief` before an ODD explore phase (so the worker starts oriented
instead of grepping); `discover` when a task names an area or a concern; `check` during verify, next to
the drift/review checks that already exist.

## 5. Who it is for

The three repository kinds Kaddo already recognizes, in the order GKD will serve them:

1. **Legacy / pre-AI** — large, undocumented, no tests, one or two humans who know it. Orientation cost
   dominates everything; this is the beachhead and the target of slice 1.
2. **Pre-AI but healthy** — tests and CI exist, knowledge lives in a few heads and a wiki nobody trusts.
3. **New** — cheap to orient, so GKD's value shifts to accretion: keeping the derived map honest as the
   project grows.

## 6. Differentiation

| | kaddo | codegraph | engram | gga | **GKD** |
|---|---|---|---|---|---|
| Primary object | authored knowledge layers | symbol graph | session narrative | diff | **derived repo truth** |
| Cost model | unbounded authoring | per-query graph | per-memory | per-diff | **declared token budget** |
| Escalation | fixed workflow | none | none | none | **L0 → L3 on demand** |
| Freshness | manual | index age | none | n/a | **stamped and verifiable** |
| Role in the harness | alternative workflow | tool | memory | review | **discovery module** |

Kaddo is an **engine and dependency candidate**, never a base: when a repository already has `.kaddo/`
signals, GKD may consume them as one extractor's input. That is an implementation detail, not a
compatibility promise — Kaddo's `.kaddo/` layout and user base are out of scope.

## 7. Non-goals

- Forking, vendoring or reimplementing Kaddo; `.kaddo/` compatibility; Kaddo's users as a market.
- Any LLM call, API key, network request, telemetry, or daemon.
- Generating code, reviewing diffs (that is GGA), storing session memory (that is Engram), indexing
  symbols as its own product (that is codegraph).
- Deciding delivery, blocking commits, or owning review authority (that is gentle-ai).
- Per-agent adapters (`AGENTS.md`, `CLAUDE.md`, editor plugins). MCP covers other agents.
- Authoring a knowledge base for the human team; GKD derives, it does not commission documentation.
- Platform, web UI, multi-repo scanning, remote repositories.
- Publishing unscoped on npm (`gkd` is taken): packages are `@gkd/*`, the binary is `gkd`.

## 8. Success criteria for v0

1. On a repository the agent has never seen, `gkd brief` replaces the first exploration batch: the
   agent's own reads drop to zero for the layout/entry-points/test-surface questions.
2. Two runs at the same commit produce byte-identical output, and a declared budget is never exceeded.
3. After a refactor, `gkd check` names exactly which accumulated knowledge went stale — no false
   "all current", no false alarm on untouched areas.

## 9. Open questions (owner decides, not the agent)

- **Q1.** Is the "gradual" mechanism as defined in §3 — budgeted disclosure plus accreted, freshness-
  stamped knowledge — what the product must be? (Everything downstream follows from this.)
- **Q2.** Which slice proves it first: the L0 brief (orientation), the L1/L2 discover (task-scoped
  answer), or the check (freshness)? This draft recommends the brief: it is the smallest artifact that
  pins the envelope, the budget discipline and the determinism claim in one command.
- **Q3.** Does `@gkd/pi` ship with the first publishable version, or after the CLI contract is stable?
- **Q4.** Is `.gkd/` gitignored by default (derived cache) or committable (shareable, reviewable map)?

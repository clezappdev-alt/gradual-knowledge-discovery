# GKD — AGENTS.md

Working contract for this repository. `README.md` is the external face; this file is how agents work
here. Product requirements live in `openspec/` once SDD starts; what a human team reads lives in
`docs/` as a projection (see the `team-docs` skill).

**Status:** definition stage. No product source code exists. The product thesis, the stack ADR and the
first-slice proposal are drafts awaiting owner approval.

## Structure

```
Gradual_Knowledge_Discovery/        ← git root
├── AGENTS.md                       ← THIS file (English, tracked)
├── README.md                       ← external face (English, tracked)
├── LICENSE, CONTRIBUTING.md, SECURITY.md, CHANGELOG.md
├── docs/
│   ├── product/                    ← what the product is and does today (team-facing)
│   ├── proposals/                  ← unapproved drafts: thesis, slice proposals
│   ├── decisions/                  ← ADRs, numbered (technical, English)
│   ├── guides/                     ← how to use / operate (when there is something to use)
│   └── reference/                  ← commands, formats, contracts (when they exist)
├── openspec/                       ← requirement authority, per change (tracked) — created with the first SDD
├── odd/tasks/                      ← session journal: what was asked/done, evidence (LOCAL-ONLY)
├── .agents/skills/                 ← project-owned skills (tracked)
├── references/                     ← consultation clones: kaddo (git-ignored except README + manifest)
├── .atl/ .codegraph/ .pi/ scratch/ ← LOCAL-ONLY, never committed, never reviewed
└── packages/                       ← product source, created when the first requirement is approved
```

Empty directories are documented here before they exist; nothing is scaffolded to look complete.

## Conventions

- **Code, comments, commits, ADRs, README, AGENTS.md: English.** Owner- and team-facing pages under
  `docs/product/` and `docs/guides/` may be neutral Spanish. No retroactive translation churn.
- **Author field:** `clezapp` in every author/manifest/license field. Never `cleceta`. Git identity is
  repository-local: `Carlos Leceta <devCleceta87@gmail.com>` (no global identity on this machine).
- **Stack:** TypeScript, ESM, Node ≥ 20, pnpm workspace — *proposed* in
  [`docs/decisions/0001-stack.md`](docs/decisions/0001-stack.md), pending owner approval. No source
  layout is fixed before an approved requirement asks for it.
- **No trace of this machine** in tracked files: no absolute paths, no home directory, no hostname.

## Hard rules

1. **Nothing here competes with gentle-ai or its ODD flow.** Concretely: no second task list, no
   redefinition of ODD phases, no gate on a commit or a review, no edit to `odd/tasks/` or `openspec/`
   from any projection or helper, and no modification of gentle-ai installed files or global skills
   from a session in this repo. If an artifact here can only work by bending the harness, the artifact
   is wrong.
2. **Meta and code never share a commit.** Docs/contract/standard changes go separate from source
   changes, so review sees behavior only.
3. **No behavior without an approved requirement.** Definition-stage work is docs and proposals; a
   command, flag or output exists only after an `openspec/` change accepts it.
4. **Local-only state never enters a commit or a review:** `odd/`, `scratch/`, `.atl/`, `.codegraph/`,
   `.pi/`, `*.local.md`, `references/<clone>/`.
5. **Derived knowledge is not authored truth.** `docs/` explains; `openspec/` decides. When they
   disagree, the requirement wins and the doc is corrected — never the other way round.

## Authority map

| Question | Authority | Nature |
|---|---|---|
| What must the product do? | `openspec/changes/<change>/` | tracked, reviewed, archived |
| What was asked/done this session, with evidence? | `odd/tasks/` | local journal, pointers only |
| How do I explain this to a team? | `docs/` | projection; explains, never specifies |
| Why is it built this way? | `docs/decisions/` | ADRs, one decision each |
| How is this repo verified, licensed, contributed to? | `CONTRIBUTING.md`, `LICENSE`, `SECURITY.md`, CI | tracked standard, from day one |
| What does Kaddo actually do? | `references/kaddo` + `references/manifest.yml` | read-only clone, TTL, cited findings |
| How do agents work here? | `AGENTS.md` (this file) | tracked, normative |

## Decision gates

| Situation | Action |
|---|---|
| Product scope, target user, or "is this what the product is?" | Owner decides — in dialogue, then `PRD.md` and a thesis draft |
| Wants to build a command, flag or output | Needs an approved requirement first; until then, a proposal under `docs/proposals/` |
| Kaddo behavior in doubt | Cite it: a finding with `path:line` or URL. Never guess from memory, never fork |
| Question about the harness (gentle-ai, ODD, RDD, Pi) | Read the installed docs/skills; never invent harness behavior |
| New idea for a project skill | Try it local in `.agents/skills/`; promote to global only when a second project needs it |
| Anything meant to be published (npm, announcement) | The full standard must be green first: the verification command a stranger can run, CI proving it, license, metadata |
| Tempted to edit `odd/`, `openspec/` or `~/.pi` from here | Stop: that is the harness's business, not this repo's |
| A rule here conflicts with a real harness behavior | The harness wins; fix this file and record why in the commit message |

## Skills

- **`team-docs` (local, `.agents/skills/team-docs/`)** — projection of ODD/openspec evidence into
  human-readable `docs/`. Opt-in, read-only over the harness, never blocking. An experiment: if it
  earns its keep here, it is promoted to a global skill; if not, it dies here.
- **Not duplicated here:** `reference-repos` (lives in `GentlemanGateDiscovery`). This repo keeps the
  `references/` container plus a versioned `manifest.yml` with TTL, and documents it in three lines.
- **Planned, after evidence:** a global `deterministic-cli` skill (JSON envelope, budget, determinism),
  written from the first shipped slice, never before it.

## Verification

`pnpm verify` is the only verification command, and CI runs that exact command — no second recipe.
Today it checks required files, relative links, machine-specific path leaks and the author rule; when
source exists it gains typecheck and tests under the same name. A check is trusted only after it has
been seen to fail on the thing it claims to catch.

## Commits (clean reviews)

- Conventional Commits, English, imperative subject; one work unit per commit; tests and docs for the
  same behavior travel together; meta separate from code.
- Branch per work unit off `main`: `<type>/<slug>`. Published history is the owner's call.
- Every code change closes with a `Risk:` line (`Risk: none` or `Risk: item N (reason)`).

## Memories (Engram)

- Project: `gradual-knowledge-discovery`. Topics prefixed `gkd:` (e.g. `gkd:product-thesis`,
  `gkd:agentic-architecture`).
- Save decisions, verified findings and corrections as they happen; the session summary is the
  handoff, not a substitute for the requirement.

## What does not exist yet (and why)

| Artifact | Missing because |
|---|---|
| `PRD.md` | product scoping is the next dialogue, not a guess |
| `openspec/` change | no approved requirement yet |
| `packages/` source | no approved requirement yet |
| `team-docs` output beyond proposals | nothing shipped to explain |

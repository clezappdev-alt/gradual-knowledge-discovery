# Gradual Knowledge Discovery (GKD)

**Give an agent the cheapest sufficient truth about a repository, with evidence — then stop.**

GKD is a deterministic CLI and library that orients an AI agent in a codebase it does not know:
answers arrive in levels (L0 orientation → L1 area → L2 concern → L3 exact evidence), spend a declared
token budget instead of an open-ended one, and accumulate with provenance and freshness stamps. It
never calls an LLM, never needs a key, and never blocks delivery.

```bash
npx @gkd/cli brief --budget 600        # L0: what is this repo, where does my change belong
npx @gkd/cli discover auth --budget 1200   # L1/L2: how does this concern live here
npx @gkd/cli check                     # what went stale since my last discovery
```

## Positioning

GKD is a **module of the gentle-ai / gentle-shell harness**, next to GGA (review), Engram (memory) and
codegraph (symbols) — not a replacement for any of them, and not a workflow of its own.

| | Owns |
|---|---|
| codegraph | where a symbol is and what calls it |
| Engram | what happened in past sessions |
| GGA | whether this diff is any good |
| gentle-ai | policy, ODD, review authority, routing |
| **GKD** | **what is true about this repository, at the cheapest sufficient level, verifiably** |

## Boundaries

- **No fork.** [Kaddo](https://github.com/Kaddo-kdd/kaddo) (MIT) is a reference engine and a dependency
  candidate, never a vendored base. `.kaddo/` compatibility is explicitly out of scope.
- **Primary integration target:** gentle-ai and gentle-shell (CLI + Pi package).
- **Secondary, by construction:** every other agent, through MCP rather than per-agent adapters.
- **Packages:** `@gkd/core`, `@gkd/cli`, `@gkd/mcp`, `@gkd/pi`. The binary is `gkd`.

## Documents

| Document | What it decides |
|---|---|
| [`AGENTS.md`](AGENTS.md) | how agents work in this repo: authority map, hard rules, gates |
| [`docs/proposals/thesis-draft.md`](docs/proposals/thesis-draft.md) | hypothesis: the problem, the gradual mechanism, the contract, non-goals |
| [`docs/decisions/0001-stack.md`](docs/decisions/0001-stack.md) | proposed stack: TypeScript + pnpm + scoped npm packages |
| [`docs/proposals/slice-1-brief.md`](docs/proposals/slice-1-brief.md) | proposed first slice: `gkd brief`, specs and acceptance tests |
| [`.agents/skills/team-docs/SKILL.md`](.agents/skills/team-docs/SKILL.md) | how evidence becomes team-readable docs, without a second source of truth |

**Status: definition (v0).** No product source code yet. The thesis, the stack and the first slice are
proposals awaiting the owner; requirements land in `openspec/` only after they are approved.

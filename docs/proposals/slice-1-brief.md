# Slice 1 — `gkd brief` (L0 orientation)

> **This is a proposal, not a requirement.** It becomes buildable only when the owner approves the
> thesis and accepts the command, the envelope and the exit codes in the ODD feature document.

- **Status:** proposal (v0, awaiting thesis approval)
- **Depends on:** `docs/proposals/thesis-draft.md` §3–§4, `docs/decisions/0001-stack.md`
- **First commit target:** `feat(brief): deterministic L0 repo brief within a declared token budget`

## Why this slice

The brief is the smallest artifact that proves the whole thesis in one command: a level exists (L0), a
budget is spent deterministically instead of an open-ended one, every claim carries evidence, the
response envelope is real, and the result is reproducible. `discover` (L1/L2) and `check` (freshness)
build on the same envelope and the same extractor set; none of them can be built correctly before the
envelope and the budget discipline are pinned.

## Scope

One command:

```
gkd brief [--root <dir>] [--budget <tokens>] [--format json|md]
```

- Read-only. It never writes, never creates `.gkd/`, never touches the git index.
- Works with stdin closed, no TTY, no network, no LLM.
- Default `--budget 600`; `--format json` is the contract, `--format md` is a rendering of it.

## Specs

**S1 — Envelope.** `--format json` prints exactly one JSON object on stdout, matching
`schema: "gkd/answer@1"` with: `schema`, `level: "L0"`, `budget {declared, estimated, trimmed[]}`,
`claims[]` (`id`, `area`, `claim`, `evidence[]`, `confidence`), `unknowns[]`, `next[]`
(`command`, `cost`). No other keys at top level.

**S2 — Determinism.** Two consecutive runs on the same tree at the same commit produce byte-identical
stdout, for any format. No timestamps, no durations, no absolute paths, no readdir order: every list is
sorted lexicographically, paths are repository-relative with `/` separators, and the only varying
identifier (`head`) is the git commit sha.

**S3 — Budget invariant.** `budget.estimated` never exceeds `budget.declared`. The estimator is
`ceil(characters / 4)` over the printed payload and is documented as an approximation. When the payload
does not fit, sections are dropped in this fixed order — churn, documentation inventory, CI/config, test
surface, layout detail — and each dropped section name is listed in `budget.trimmed`. Identity,
unknowns and next are never dropped.

**S4 — L0 content.** The brief answers, using filesystem, manifest and git signals only: what kind of
repo this is (languages by file count, package managers, presence of tests and CI), its top-level
layout with a one-line responsibility hint per area, entry points, test surface, CI/config surface,
churn hotspots (top paths by commit count in the last 90 days), documentation inventory
(`docs/**`, `*.md`, `adr/`), and an explicit `unknowns[]` naming what L0 cannot establish.

**S5 — Evidence.** Every claim carries at least one `evidence[]` entry pointing at a repository-relative
path (optionally `path:start-end`) or `git:<sha>`. A claim with no evidence is reported in `unknowns[]`
instead. No claim is synthesized beyond what a signal directly shows.

**S6 — Degraded repositories.** In a directory that is not a git repository, or one with no commits:
exit `0`, still emit the envelope, put every git-derived section in `unknowns[]`, and keep S2/S3 true.
A directory that does not exist, or is unreadable: exit `2`, single-line message on stderr, nothing on
stdout.

**S7 — Budget floor.** Declared budget below `300` exits `4` with a single-line stderr message naming
the floor; stdout stays empty.

**S8 — Read-only guarantee.** After any successful run, the working tree is unchanged: no created,
modified or deleted files, no `.gkd/` directory, no writes in the git directory.

**S9 — Next step.** `next[]` always offers the cheapest useful deepening command(s) for what was found
(e.g. `gkd discover --area <area> --level L1`), with an estimated cost, and nothing stronger than L1 at
L0.

**S10 — Md rendering.** `--format md` renders the same claims, unknowns and next steps as human-readable
Markdown, preserving S2 (determinism), S3 (budget) and S5 (evidence pointers).

## Acceptance tests (written first, RED then GREEN)

1. **Determinism (S2):** two runs on the legacy fixture and on this repository → identical bytes, both
   formats.
2. **Budget (S3):** for declared `300`, `600`, `2000` → `estimated <= declared`; the trimmed list is
   exactly the sections the trimming loop dropped; identity/unknowns/next never trimmed.
3. **L0 on this repo (S4/S5):** detects the pnpm workspace (`pnpm-workspace.yaml`, `packages/`), the
   documentation inventory including `docs/decisions/`, the `head` sha matching `git rev-parse HEAD`, and every
   claim has evidence with no absolute path.
4. **Legacy fixture (S4):** a committed fixture tree under `test/fixtures/legacy-app/` with no tests and
   one entry point → the brief states that, and its `unknowns[]` says no test surface was found.
5. **Degraded (S6):** a `mktemp -d` directory without git → exit 0, git sections in `unknowns[]`,
   envelope valid, determinism holds.
6. **Bad root (S6):** nonexistent path → exit 2, stderr non-empty, stdout empty.
7. **Budget floor (S7):** `--budget 100` → exit 4, stdout empty.
8. **Read-only (S8):** hash the tree before and after a run (file list + content hashes) → identical.
9. **Envelope validity (S1):** output validates against the zod schema in `@gkd/core`; an unknown top
   level key fails the test, not the user.

## Non-goals for this slice

- No L1/L2 answers, no `discover`, no `check`, no `.gkd/` state.
- No Pi package, no MCP server, no publishing.
- No language parsers: only manifests, paths, file counts, git history.
- No rendering polish beyond S10.
- No Kaddo/Kaddo-config consumption.

## Definition of done

`pnpm test` green with the nine tests above, `pnpm build` clean, `gkd brief` run manually on this
repository and on the legacy fixture, output committed in the PR body (not in the repo), and every claim
in the output traceable to a path or a commit sha.

## Notes on implementation order (test-first)

1. `@gkd/core` envelope types + zod schema + budget estimator + trimming loop, with tests 2, 9.
2. Extractors: layout/manifest, entry points, test surface, CI, churn, docs — each pure, each with a
   fixture test; wire into the assembler, test 3, 4.
3. `@gkd/cli` argument parsing, exit codes, formats, read-only guard, tests 1, 5, 6, 7, 8.
4. `--format md` rendering, test 10 folded into test 1.

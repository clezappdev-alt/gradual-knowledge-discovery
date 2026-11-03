---
name: team-docs
description: "Trigger: close a slice, change a contract, or the owner asks for team-facing docs. Projects evidence into docs/ without a second source of truth."
license: MIT
metadata:
  author: "clezapp"
  version: "1.1"
---

## Activation Contract

Load when a work unit closes (slice, change, release), when a command, flag, format or contract changes,
when the owner asks how a teammate would learn something, or when `docs/` describes behavior the code no
longer has. Do not load per commit, and do not load while a requirement is still unapproved: there is
nothing to explain yet.

## Hard Rules

1. **Read-only over the harness.** Never edit `odd/tasks/` or any gentle-ai file. Write only under
   `docs/`.
2. **Never blocking.** An unfinished projection is reported as a gap, never as a gate on a commit,
   review, merge or release.
3. **Explain, never specify.** A page links its sources; when a page and a requirement disagree, the
   requirement wins and the page is corrected.
4. **No copied task lists.** Link `odd/tasks/`; never mirror it.
5. **Evidence or nothing.** Every behavioral sentence traces to a requirement id, a `path:line`, a test
   name or a commit. Untraceable sentences are deleted, not softened.
6. **Tracked sources only.** The journal may inform the narrative, but every assertion must be
   reproducible from tracked artifacts.
7. **No machine traces.** No absolute paths, home directory, hostname or local skill paths.

## Decision Gates

| Situation | Action |
|---|---|
| Behavior a user notices changed | update the product page under `docs/product/` |
| A task a user performs changed | update or add a guide under `docs/guides/` |
| A contract someone must obey changed | update `docs/reference/` |
| A choice with consequences was made | add an ADR under `docs/decisions/` |
| Nothing a human reads changed | write nothing — this is the common case |
| A page contradicts a requirement | fix the page |
| A requirement looks wrong | report it; never edit it from here |

One page answers one question; a page that needs a table of contents is two pages. An eligible page
carries three lines: what it explains, what it is not, and its sources.

## Execution Steps

1. **Collect** the closed unit's evidence: approved requirement, merged commits or diff, the tests that
   pin the behavior, and the journal for the *why*.
2. **Decide** the affected pages with the gates above.
3. **Write or update** only those pages, in place.
4. **Trace** every behavioral sentence; delete what cannot be traced.
5. **Freshen** the pages touched: list the paths each covers; a covered path that changed here while the
   page did not means the page is stale — fix it or report it as a gap.
6. **Report** per the output contract.

## Output Contract

Return: the work unit referenced; pages written, updated, or deliberately untouched; each stale page with
the path that moved; gaps that need an owner decision; and confirmation that `git status --short` shows
`docs/` only.

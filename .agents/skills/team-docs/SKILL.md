---
name: team-docs
description: "Trigger: close a slice, change a public contract, or the owner asks for team-facing docs. Projects ODD/openspec evidence into human-readable docs/ without becoming a second source of truth or adding friction to gentle-ai."
license: MIT
metadata:
  author: "clezapp"
  version: "1.0"
---

## Activation contract

Run when a work unit closes (slice, change, or release), when a command/flag/format/contract changes,
when the owner asks a team-facing documentation question ("how would a teammate learn this?"), or when
`docs/` is found describing behavior the code no longer has.

Do not run on every commit, and do not run while a requirement is still unapproved: there is nothing to
explain yet.

## What this is, and what it is not

This skill is a **projection**: it turns evidence the harness already produced into pages a human team
can read without knowing what ODD is.

It is not a workflow, not a phase, not a second task list, and not an authority. It adds no requirement,
removes none, and never decides delivery.

## Hard rules

1. **Read-only over the harness.** Never edit `odd/tasks/`, `openspec/`, or any gentle-ai installed file
   or global skill. Read them; write only under `docs/`.
2. **Never blocking.** A projection that cannot be completed is reported as a gap. It never gates a
   commit, a review, a merge or a release.
3. **Explain, never specify.** A page under `docs/` describes and links; it does not restate a
   requirement as if it were the requirement. When `docs/` and `openspec/` disagree, the requirement
   wins and the page is corrected.
4. **No copied task lists.** Never mirror `odd/tasks/` or `openspec/tasks.md`. Link them.
5. **Evidence or nothing.** Every behavioral statement on a page must trace to something a reader can
   open: a requirement id, a `path:line`, a test name, or a commit. A statement that cannot be traced is
   removed, not softened.
6. **Tracked sources only.** The projection may consult `odd/tasks/` for narrative and rationale, but
   everything a page asserts must be reproducible from tracked artifacts (requirement, code, tests,
   commits). Never make a page depend on a git-ignored file.
7. **No trace of a machine** in a page: no absolute paths, no home directory, no hostname, no local
   skill paths.

## Structure

Create a directory only when it has content. No `.gitkeep` padding.

| Directory | Holds | Language |
|---|---|---|
| `docs/product/` | what the product is, who it serves, what it does today | neutral Spanish ok |
| `docs/guides/` | how to install, run, operate; one page per task a user has | neutral Spanish ok |
| `docs/reference/` | commands, flags, formats, JSON contracts, exit codes | English |
| `docs/decisions/` | ADRs: one decision per page, status and consequences | English |
| `docs/proposals/` | unapproved drafts (thesis, slice proposals) — clearly marked | either |

One page answers one question. If a page needs a table of contents, it is two pages.

Eligible pages carry a three-line header: **what this page explains**, **what it is not** (usually "not
a requirement"), and **its sources** (requirement ids, paths, commits).

## Steps

1. **Collect** the closed work unit's evidence: the approved requirement, the diff or merged commits,
   the tests that pin the behavior, and the session journal for the *why*.
2. **Decide** which pages change: product (behavior a user notices), guides (a task a user performs),
   reference (a contract someone must obey), decisions (a choice with consequences). Most work units
   touch one or two. A work unit that changes nothing a human reads writes nothing.
3. **Write or update** only those pages, in the structure above, with the three-line header.
4. **Trace** every behavioral sentence to evidence (rule 5). Delete what cannot be traced.
5. **Check freshness** of the pages touched: for each page, list the paths it covers; if a covered path
   changed in this work unit and the page did not, the page is stale — fix it now or record the gap.
6. **Report** the projection: pages written/updated/stale, and every gap (rule 2) in one short list.

## Output contract

Return: the work unit referenced; pages written, updated, or deliberately not touched; any page marked
stale with the path that moved; gaps that need an owner decision; and confirmation that nothing outside
`docs/` was modified (`git status --short` shows `docs/` only).

If the projection found that `docs/` contradicts a requirement, say so plainly and fix the page. Never
fix the requirement from here.

## Boundaries with the harness

| The harness owns | This skill owns |
|---|---|
| ODD phases, task list, journal | nothing — it only reads them |
| Requirement authority (`openspec/`) | nothing — it only points at it |
| Review authority, delivery gates | nothing — it is non-blocking by rule 2 |
| `docs/` readability for a team | this |

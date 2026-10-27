# Contributing

Thanks for looking. This repository is small on purpose and it is honest about its state: today it
contains documentation and the repository standard, and it contains no product source code yet. The
verification below is therefore a documentation check, and it grows with the code.

## Setup

Requirements: Node.js ≥ 20 and pnpm (the version is pinned in `package.json` under `packageManager`).

```bash
corepack enable          # provides the pinned pnpm
pnpm install --frozen-lockfile
```

Nothing is installed globally, and the verification never depends on a toolchain that lives outside
this repo. A clean clone is the supported state.

## Verify

```bash
pnpm verify
```

That is the whole contract, and CI runs that exact command on every push and every pull request. If it
is green locally it is green there; there is no second, secret recipe. When source code exists,
`verify` also runs the typecheck and the tests — the command name never changes, so you never have to
learn a new one.

## Branches and commits

- Branch from `main`: `<type>/<slug>`, where `type` is one of `feat`, `fix`, `docs`, `chore`,
  `change`, `refactor`, and `slug` is kebab-case.
- Conventional Commits, English, imperative subject.
- One work unit per commit. Code, tests and docs for the same behavior travel together; documentation,
  contract and standard changes go in their own commit so a review sees behavior only.
- Every code change ends its description with a risk line: `Risk: none` or `Risk: item N (reason)`.

## Pull requests

A pull request must state:

1. **Problem** — what is wrong or missing, with evidence (a file, a command, an issue).
2. **Change** — what it does, and what it deliberately does not do.
3. **Verification** — the exact commands run and their result.
4. **Risk line** — `Risk: none` or `Risk: item N (reason)`.
5. `Closes #N` when it closes an issue.

The PR title is the Conventional Commit subject. Small, reviewable slices are strongly preferred: a
change that cannot be read in one sitting is split, not excused.

## Forks

Fork, branch, open a pull request. CI runs on forks with a read-only token and no secrets, so a fork
gets the same verification you get locally. Never put a credential in a workflow.

## What gets merged

- Behavior without an approved requirement is not merged. In this repo the requirement lives in
  `openspec/` once SDD starts; before that, product changes are proposals under `docs/proposals/`.
- Documentation that contradicts a requirement is a bug in the documentation.
- A rule that only works with one person's machine, one person's global tools, or one person's shell
  history is not a rule.

## Response expectations

This is a personal project maintained on its own schedule: no SLA. Issues and pull requests are read,
and a "no" comes with a reason. Security reports follow [`SECURITY.md`](SECURITY.md) instead of a public
issue.

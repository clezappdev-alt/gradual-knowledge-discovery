# Security

## Reporting a vulnerability

Report privately through GitHub Security Advisories:
`https://github.com/clezappdev-alt/gradual-knowledge-discovery/security/advisories/new`.

Do not open a public issue for a vulnerability. There is no bounty and no SLA; you will get an honest
answer and a fix, in that order.

## Data map

**Today** the repository ships documentation and the repository standard. It runs no product code, so
it reads nothing and writes nothing beyond the checkout.

**When product code exists**, this section states, in the same place and in the same words the tool's
own documentation uses:

- what it reads (the working tree, git history, manifests — locally, in the repository it is pointed at);
- where it writes (one declared repository-scoped state directory, overridable);
- that it makes no network request and sends no telemetry;
- that it never receives credentials, because it requires none.

A change that makes any of those statements false updates this file in the same commit. A security
claim that is not in this file is not a claim.

## Runtime baseline

Once code exists, `package.json` `engines.node` is the supported floor, CI runs the same verification on
that floor and on the current LTS, and the CI log prints `node --version` — the runtime is part of the
evidence, not background.

## What this project will never ask for

A token, an API key, a password, or access to a private service. Anything asking for those is not this
project.

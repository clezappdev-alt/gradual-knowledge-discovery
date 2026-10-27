# Security

## Reporting a vulnerability

Report privately through GitHub Security Advisories:
`https://github.com/clezappdev-alt/gradual-knowledge-discovery/security/advisories/new`.

Do not open a public issue for a vulnerability. Acknowledge within 7 days, fix or publish a mitigation
within 30, best effort, no bounty. Exposing a vulnerability is an emergency, not a policy discussion.

## Runtime baseline

<!-- runtime-floor: 22.23.4 -->

The floor is a **patched micro version**, not a major line. A major version says what the code targets;
it says nothing about which runtime vulnerabilities are already fixed in the binary you are running.

| Line | Status | Security support until | Patched baseline | Notes |
|---|---|---|---|---|
| **22.x** (Jod) | Maintenance LTS | 2027-04-30 | **22.23.4** | floor declared in `engines.node` |
| **24.x** (Krypton) | Active LTS | 2028-04-30 | **24.22.1** | |
| **26.x** | Current, LTS from 2026-10-28 | 2029-04-30 | **26.12.1** | |
| 20.x (Iron) | **end of life 2026-04-30** | — | — | unsupported: no further patches |

Baseline of 2026-10-21 (Node.js security release of that date): 22.23.4, 24.22.1 and 26.12.1 fix ten
advisories across the three lines, four rated High. The worst, **CVE-2026-111497** (CVSS 4.0 9.2), is an
out-of-bounds write in the bundled Brotli decoder that permits remote code execution; the release also
carries TLS and DNS fixes (CVE-2026-106069/106072, CVE-2026-105482, CVE-2026-105483) and dependency
updates to c-ares, OpenSSL, SQLite (22.x), Undici and the CA bundle (eMudhra Intermediate CA compromise).

**Why an audit would not have found it.** Those vulnerabilities live in the Node.js runtime, not in a
package this project installs. `npm audit`, Dependabot and every lockfile scanner are blind to them by
construction: there is no dependency to bump. The runtime is therefore covered three ways — the floors
above, CI running the verification on the declared floor and on Current with `node --version` printed,
and the rule below.

**The 14-day rule.** When Node.js publishes a security release on a supported line: raise the floor and
`engines.node` in this repository, add the line to the table above with its date, and land it within 14
days. The publish gate stays closed until the table and the floor agree.

The host used to develop this repo runs Node **24.22.1**, which is the patched baseline for its line.

## Other ecosystems

This project's runtime is Node.js only. No PHP, Composer or PHP runtime is installed on the development
host, and nothing here executes PHP.

The 2026-10-21 PHP release is recorded anyway, because it is the same lesson from the other side: PHP
8.2.35, 8.3.36, 8.4.27 and 8.5.12 fix **CVE-2026-109618** and **CVE-2026-109619**, two use-after-free
defects rated CVSS 4.0 9.2 that allow unauthenticated remote code execution, with no complete mitigation
other than updating. If a future requirement makes this project read PHP repositories, that ecosystem
becomes a *target* signal — never a runtime dependency — and the data map below must say so in the same
commit.

## Untrusted-content trust boundary

This project's whole purpose is to read repositories it did not write, including legacy ones full of
arbitrary text, and to hand the result to an AI agent. That makes repository content a hostile input
class, not merely untrusted data. The following invariants are part of the security contract: they bind
any code that ships, and a change that violates one is a security change, not a feature.

1. **Repository content is data, never instructions.** It is quoted verbatim with a provenance pointer,
   marked as untrusted in any machine-readable output, and never paraphrased into a directive. Text in
   a repository that says "ignore your instructions" is text, and the output must make that impossible
   to misread. No output field carries free-form imperatives.
2. **No repository-provided code runs.** No package scripts, no Makefile targets, no test suites, no
   language toolchains from the scanned tree. Git is invoked with hooks, filters, fsmonitor and system
   configuration disabled, with terminal prompts off and with a timeout; arguments are always passed as
   an argv array, never through a shell.
3. **Containment.** Every path is resolved and proven to stay inside the declared root before it is read;
   symlinks are not followed out of the root; file count, file size and output size are capped, and
   binary or undecodable content is skipped, not rendered.
4. **Secrets are not knowledge.** Files that conventionally hold credentials are excluded, and
   secret-shaped values are redacted rather than quoted. A tool that reports "here is what this repo
   contains" must never become a credential exfiltration path.
5. **No network, no telemetry, no credentials.** The tool requires no API key and sends nothing anywhere.
6. **Read-only over the analysed tree.** The only writes are to this project's own declared state
   directory, never into the repository being analysed.

## Data map

**Today** the repository ships documentation, the repository standard and the verification script. It
reads only its own checkout, executes only `git ls-files`, and writes nothing.

**When product code exists**, this section states — in the same words the tool's own documentation uses —
what it reads, where it writes, that it makes no network request and needs no credentials. A change that
makes any of those statements false updates this file in the same commit. A security claim that is not in
this file is not a claim.

## CI and supply chain

- Every action is pinned to a full commit SHA with its version in a comment; a mutable tag is a remote
  code execution path into CI.
- `permissions: contents: read`, always. A workflow gains a permission only when a documented step needs
  it.
- `pull_request_target` is forbidden, no secrets are readable from a pull request, and publishing is
  manual.
- The verification command CI runs is the same one `CONTRIBUTING.md` documents — and the repository
  check enforces the pinning, the forbidden trigger and the presence of the floor marker, so a drift
  fails before merge.

## What this project will never ask for

A token, an API key, a password, or access to a private service. Anything asking for those is not this
project.

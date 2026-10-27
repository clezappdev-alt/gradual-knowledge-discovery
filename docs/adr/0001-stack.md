# ADR 0001 — Stack: TypeScript, pnpm workspace, scoped npm packages

- **Status:** proposed (v0)
- **Date:** 2026-10-27
- **Deciders:** Carlos Leceta
- **Related:** charter §4 (integration contract), §7 (non-goals)

## Context

GKD must be callable by three consumers with very different launch paths: a shell (`gkd` binary), the Pi
runtime (a Pi package registering tools), and any other agent (MCP over stdio). It must also stay
deterministic, dependency-light and headless.

Three stack options were live:

1. **Go single binary** — the shape of `engram` and `gga`. Fast start, trivial install, no runtime.
2. **TypeScript on Node, npm/npx distribution** — the shape of `kaddo` (`@kaddo/cli`, `@kaddo/mcp`,
   Node ≥ 18) and of the `gentle-engram` package that wraps Engram's binary for Pi.
3. **Hybrid** — a TypeScript Pi/MCP surface over a Go core.

Evidence that matters:

- The engine we may want to depend on (Kaddo) is pure TypeScript with zero native dependencies, so a
  TypeScript host can consume it as a library instead of shelling out.
- The harness itself (Pi, gentle-pi) runs on Node 24, and its package ecosystem is npm-based
  (`~/.pi/agent/settings.json` installs `npm:` packages). A Pi package is a Node package either way.
- No measured constraint (startup latency, scan performance, binary size) currently argues for Go. GKD's
  slice 1 is filesystem, manifest and git-history reads — the trivial end of the performance curve.
- The previous attempt in this product line went Go and never shipped; distribution and invocation
  friction was not the reason, but it also produced no advantage.

## Decision

**TypeScript, ESM, Node ≥ 20, pnpm workspace, published as scoped npm packages.**

Layout:

```
packages/
  core/   @gkd/core   — extractors, levels, budget, freshness. No I/O beyond fs/git. Pure and testable.
  cli/    @gkd/cli    — the `gkd` binary. Argument parsing, envelope emission, exit codes.
  mcp/    @gkd/mcp    — stdio MCP server exposing brief/discover/check.
  pi/     @gkd/pi     — Pi package registering the same three tools.
```

Rules that keep the decision reversible:

- `@gkd/core` never imports `cli`, `mcp` or `pi`. Consumers depend on core, never the reverse.
- The published contract is the **JSON envelope on stdout plus documented exit codes** — not the module
  API. Any future reimplementation in another language can replace the binary without touching
  consumers.
- Toolchain: `tsup` for the build, `vitest` for tests, `zod` for envelope validation, `yaml` only if a
  config format needs it. No native addons, no post-install scripts.

## Consequences

**Positive.** One language from extractor to Pi tool. Kaddo is consumable as a library. `npx` and
`npm:` installation match how the harness already installs packages. Tests are ordinary Node tests, and
fixture repositories are cheap to build.

**Negative.** A Node runtime is required at every call site (already true for Pi and for kaddo). Cold
start is tens of milliseconds rather than single-digit, which matters only if GKD is called in a tight
loop — it is called a handful of times per task. Single-binary distribution is lost.

**Revisit trigger.** Reopen this ADR if any of these become measured facts: GKD must run where Node is
not available (e.g. inside a Go-only installer path), cold start exceeds ~200 ms on the target repos, or
scan cost on large legacy trees makes a compiled core necessary. In that case the core moves and the
envelope contract stays.

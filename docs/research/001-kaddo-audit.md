# Kaddo Audit — upstream v3.132.0

> Study of the read-only clone at `references/kaddo/` (v3.132.0, per `packages/cli/package.json:3`).
> **No file under `references/kaddo/` was modified; no Kaddo command was executed.** All citations
> below are `path:line` relative to `references/kaddo/`. Read-only methods only: grep + reading of
> command sources, core logic, MCP server, and the repo's own tracked knowledge (its self-hosted
> instance). Scope: `README.md`, `architecture/`, `packages/cli/src/{index.ts,commands/,core/}`,
> `packages/mcp/src/`, `packages/integrations/src/` listing, own `knowledge/` tree. Not read:
> generated assets, lockfiles, images, test fixtures.

---

## 1. What Kaddo claims to solve (its own words, condensed)

| # | Claim (condensed) | Where |
|---|---|---|
| C1 | "Prepare any codebase for AI-assisted evolution. Kaddo helps your repo remember why the code exists." | `README.md:7-8` |
| C2 | It "scans your repo, structures product knowledge into four layers (Business, Product, Tech, Delivery), manages the full Work Item lifecycle — from captured intent through implementation handoff, evidence collection and verification — and keeps knowledge alive as the system evolves." | `README.md:10-13` |
| C3 | Division of labor: "The CLI does the deterministic work — no AI, no API key. Your LLM does the interpretation." | `README.md:16-19` |
| C4 | Kaddo "applies" Knowledge Driven Development principles; "it did not invent them" (KDD is prior art). | `README.md:22-23` |
| C5 | Its lifecycle "ensures every change is traceable from intent to verified delivery", enforced "by convention — no lock-in, no platform dependency". | `README.md:100-125` |
| C6 | Explicit boundaries: "Not a code generator… Not a platform… Does not call an LLM or require an API key." | `README.md:316-321` |
| C7 | Historical positioning once used the exact frame **"Repository Exploration Tax"** (v3.7.1: "Context Efficiency positioning: Repository Exploration Tax"). | `architecture/roadmap.md:44` |

**Reading of the claims.** Kaddo is two products in one binary: (a) a **knowledge-base builder**
around a prescribed Business→Product→Tech→Delivery artifact model, and (b) a **delivery lifecycle**
(work items, verify, gates, integrations) in the same repo namespace. The stated purpose of the whole
system (C1–C2) is much wider than what its deterministic detectors actually do (see §2 and §5): the
"life" of the knowledge is human/LLM authoring plus a diff-time ownership check, not derivation from
the tree.

---

## 2. Command inventory

Entry: single CLI `kaddo`, commander-based, 40+ commands across `packages/cli/src/index.ts` and 43
command files in `packages/cli/src/commands/`. Grouped by the problem each solves. Notational keys:
**W** = writes under the repo, **TTY** = may prompt interactively, **NET** = network call, **GIT** =
reads/uses git.

### G1 — Workspace setup and knowledge scaffolding
`init` (`index.ts:100`), `bootstrap` (`index.ts:124`), `add [module]` (`index.ts:802`; also `add agents|skills`),
`tech organize` (`index.ts:589`, moves files into `knowledge/tech/discovery/`),
`modules map|discover --apply` (`index.ts:777`).
- **W:** heavy — creates `.kaddo/config.yml` plus seeded template files per layer
  (`commands/bootstrap.ts:29-44`; never overwrite).
- **TTY:** yes — `init` prompts project name, state, language, mode
  (`commands/init.ts:244, 255, 287-300` with `confirm/text/select` from `utils/ui.js:3`);
  `scan` prompts on overwrite/save (`commands/scan.ts:92-96, 112-116`). ~10 more G4 commands accept a
  `--yes` flag instead of a general non-interactive switch (`index.ts:140-452`).
- **NET:** no. **GIT:** no (bootstrap explicitly "never runs scan/context/git",
  `commands/bootstrap.ts:8-9`; bootstrap "never runs scan/context/git", `commands/bootstrap.ts:9-10`).
- Exceptions: `init` has non-interactive paths when config exists; POC mode skips standard bootstrap
  (`commands/bootstrap.ts:105-109`).

### G2 — Deterministic context generation (the .kaddo/ derived layer)
`scan` (`index.ts:117`), `context` (`index.ts` context command description
`packages/cli/src/commands/context.ts:1-56`), `understand` (`commands/understand.ts:32-276`),
`explain` (`commands/explain.ts:57-271`), `graph export` (`index.ts:177-181`,
`core/graph.ts:1-11`), `knowledge consolidate` (`index.ts:190-200`), `report impact|savings|drift` (`index.ts:473-537`), `drift` (`commands/drift.ts:10-27`), `questions` / `readiness`
(`index.ts:547, 554`), `capsule export` (`index.ts:161-164`), `okf export|validate` (`index.ts:391`), `savings init`, `adr` (read-only list of ADR candidates, `index.ts:599`),
`owners suggest` (`index.ts:755`), `classify` (`index.ts:745`).
- **W:** yes — all of G2 writes into `.kaddo/` (`context-pack.md/.json` `commands/context.ts:29-40`;
  `understand.md` `commands/understand.ts:271`; `explain.md/.json` `commands/explain.ts:223-224`;
  `scan.json` + possibly `knowledge/inventory.md` `commands/scan.ts:85-103`; `.kaddo/graph.json`,
  `graph.mmd` `index.ts:181-185`; guard runs `.kaddo/history/*` `commands/guard.ts:284-302`,
  `core/guard-history.ts:31`).
- **TTY:** mostly no — `scan` is the exception (overwrite prompts); `explain`/`understand`/`drift`
  contain no prompt calls (read of each file; `understand.ts` only `log.*`).
- **NET:** no. **GIT:** `guard`/`classify` read `git diff` (`commands/guard.ts:1, 192-194`,
  `commands/verify.ts:3-92`); `explain`/`understand` do not.

### G3 — Knowledge and state reading (status / report / inspect)
`status` (`commands/status.ts:24-82`), `explain` (already above), `history` (`index.ts:734`),
`resources list|get` (`index.ts:240`), `deprecation list|show|status|plan|analyze|candidates`
(`index.ts:286-368`), `modules list|discover|validate` (`index.ts:777`),
`integrations list|status|work-items|work-item` (`index.ts:410-441`), `agents status` (`index.ts:561`) / `skills status` (`index.ts:575`), `topology validate` (`index.ts:221`), `okf validate`, `poc report --json` (described as "no LLM call, no write" `index.ts:151-152`).
- **W:** none, except: `explain` without filters *writes* `.kaddo/explain.md|json`
  (`commands/explain.ts:214-224`) — a read-only-sounding command that persists derived files.
- **TTY:** no filters path is prompt-free.
- **NET:** `integrations status|verify|work-items` go out to external systems
  (`packages/integrations/src/` — jira/registry/preview adapters present, `integrations/src` file
  listing; endpoint logic is adapter-side).
- **GIT:** no.

### G4 — Work Item lifecycle writing (the delivery half)
`create [type|--from roadmap]` (`index.ts:131-136`), `ready <id>` (`index.ts:139-142`), `work-item import` (`index.ts:459`), `integrations import` (`index.ts:450`), `learn`
(`index.ts:721`), `verify <id>` (`index.ts:727`, `commands/verify.ts:59-266`), `initiative *`
(`index.ts:821`), `plan create` (`index.ts:204`), `epic create` (`index.ts:212`),
`resources create|update|delete` (`index.ts:240`),
`deprecation create|add-target|update-target|remove-target|runbook` (`index.ts:286`),
`topology apply`, `capsule add` (`index.ts:170`), `ignore add|remove` (`index.ts:665`),
`modules discover --apply`.
- **W:** every one writes `knowledge/**` frontmatter or files (verify persists evidence into the WI's
  frontmatter, `commands/verify.ts:242-257`; ready moves the draft, `index.ts:143`).
- **TTY:** yes by default — verify asks "Update Work Item frontmatter…?" unless `--yes`/`--json`
  (`commands/verify.ts:242-244`); `ready`, `topology apply`, `resources delete`, `integrations
  import` all honor a `--yes` escape instead of a `--no-interactive` general flag (per-command
  options in `index.ts:140-452`).
- **NET:** the integrations import path. **GIT:** verify reads git changed paths
  (`commands/verify.ts:92`); lifecycle itself does not.

### G5 — Guard and drift (the living-knowledge mechanism)
`guard` (`index.ts:651`, `commands/guard.ts:186-490`), `guard --record`, `guard --ci|--json`,
`guard --no-interactive`, `ignore` (`index.ts:665`), `drift` (`index.ts:528`).
- See §5 for the mechanism. **W:** only with `--record` (to `.kaddo/history/`) or `--ci` ignore
  flows; otherwise output-only. **TTY:** interactive ignore prompts unless `--no-interactive` or
  `--ci` (`commands/guard.ts:188-189, 487`); ignore requires a reason, no blank allowed
  (`commands/guard.ts:111`). **GIT:** yes — requires a git repository and reads diff
  (`commands/guard.ts:192-194`). **NET:** no.

### G6 — App and transport interfaces
`admin` — starts a local web server, default port 4173, optionally opens the browser
(`index.ts:811`; `commands/admin.ts:17-18, 129`); `adapters install|list|status` and
`export <adapter>` — generate `AGENTS.md` / `CLAUDE.md` (`commands/adapters.ts:1-120`;
`README.md:251-258`); `telemetry status|enable|disable` (`index.ts:873`) + consent hook running on **every** command
(`index.ts` preAction/postAction; `core/telemetry-consent.ts:27-30`; `core/telemetry.ts:19` —
endpoint `https://telemetry.kaddo.org`).
- **NET:** telemetry posts to `telemetry.kaddo.org` (`core/telemetry.ts:19, 61`), gated by consent
  (`core/telemetry-consent.ts`), skipped silently when not a TTY (`telemetry-consent.ts:27-30`,
  hook never blocks, `index.ts` preAction catch). **W:** adapters write `AGENTS.md`/`CLAUDE.md`
  (`commands/adapters.ts:75-120`). **TTY:** admin opens a browser (`commands/admin.ts:129`).

---

## 3. Artifacts — who makes them

| Artifact family | Path | Made by | Evidence |
|---|---|---|---|
| Project config | `.kaddo/config.yml` | Human (init prompts; scan may append `scan:` with user confirm, never domains) | `commands/scan.ts:57-84` ("never overwrite domains — user owns those") |
| Stack inventory | `.kaddo/scan.json`, `knowledge/inventory.md` | Derived deterministically (regex/dirs scanner) | `commands/scan.ts:82-103`; `services/scanner.js` called at `scan.ts:110` |
| Knowledge baseline seeds | `knowledge/{business,product,tech,delivery}/*.md` | **Templates written by the CLI** — placeholders only, never overwritten | `commands/bootstrap.ts:8-9, 29-44`; placeholder heuristics `core/artifact-quality.ts:1-12` |
| Layer knowledge content | same paths | **LLM agents** (paste `context-pack.md` + agent prompts) then humans confirm | `README.md:37` ("use your LLM with the context pack and agents to extract capabilities, architecture and a roadmap"); bootstrap prints "your LLM creates the understanding" `commands/understand.ts:275` |
| Work Items | `knowledge/delivery/work-items/{draft,ready,in-progress,…}/*.md` | CLI creates (from roadmap candidate or import); work-item-agent (LLM) refines ACs; humans review/approve | `README.md:112-125` lifecycle; "Import is always human-confirmed" `README.md:159` |
| Work Item evidence | frontmatter `implementation_evidence`, `validation_status`, `verified_at` | CLI `verify` writes it deterministically (AC checkboxes + git changed paths + reported validations) | `commands/verify.ts:92-99` (git) and `242-257` (persist) |
| Ownership | artifact frontmatter `code:` globs | Human/agent suggestion (`owners suggest` computes proposals) | `README.md:296-315`; `commands/owners.ts` |
| Ignore list | `.kaddo/ignores.yml` | Human-confirmed, with required reason | `commands/guard.ts:100-121` ("Reason is required.", `guard.ts:111`) |
| Guard history | `.kaddo/history/` | CLI only | `core/guard-history.ts:31`; `commands/guard.ts:284-302` |
| Context pack, understand.md, explain.md/.json, graph.json/.mmd, consolidation plan, reports, OKF bundle, capsule exports | Derived deterministically from the above; never read `src/` source content for the graph | `core/graph.ts:1-11` ("reads only knowledge artifacts… never source code content"); `commands/context.ts`, `understand.ts`, `explain.ts:223-224`, `index.ts:177-209, 473-547` |
| External capsules | `.kaddo/external.yml` + imported capsule files | Human registration of an external artifact | `index.ts:170-173`; `README.md:163-170` |
| Adapters | `AGENTS.md`, `CLAUDE.md` | Deterministic projections "of the project's knowledge map — Kaddo stays the source of truth" | `README.md:251-258`, `commands/adapters.ts` |
| Kaddo's own knowledge | `knowledge/**` in this very repo | Self-hosted instance of the above process (agent/human authored, git-tracked) | `README.md:288-295`; own tree listing `knowledge/business/business.md`, `knowledge/tech/codebase.md` etc. |

**Key property:** almost nothing in `knowledge/` is machine-derived. The CLI seeds templates and
reorganizes; the substance arrives via LLM agents and human edits; the only *checks* applied to
content are conservative heuristic classifications (`core/artifact-quality.ts:7-12` —
`missing/placeholder/weak/useful`, "when in doubt it classifies down") and frontmatter stringency
(`core/metadata-health.ts:5-15` — required `type`, `generated_by`, `template_version`).

---

## 4. Interfaces

| Interface | Scope | Exclusive capability (can do, others cannot) |
|---|---|---|
| **CLI** `@kaddo/cli` | Everything in §2 | Full write path: init/bootstrap, lifecycle writes, guard with git, adapters install. The only transport that writes everything; MCP and Admin are dependent surfaces (`README.md:127-135`). |
| **MCP** `@kaddo/mcp` | **80 registered tools** (`grep 'kaddo_' server.ts`), plus resources/prompts | Agent prompts & skills as first-class tools (`kaddo_get_agent_prompt` via `mcp/src/tools.ts:255`, `kaddo_list_agents`, `kaddo_get_skill`); system-graph traversal tools `kaddo_system_search|node|neighbors|paths` (`server.ts:516-537`); planning reads `kaddo_list_plans|get_plan|get_epic…` (`server.ts:748-766`). Mostly read-only: "Everything stays read-only" (`server.ts:2`); lifecycle tools write only under `knowledge/delivery/work-items/` and derived tools under `.kaddo/` (`README.md:138-139`). |
| **Admin** `@kaddo/admin` + `admin-server` | Web UI (local server on 4173) | Work Item management via browser, integration configuration, external item discovery + import provenance (`README.md:135-137`). No CLI writes for these flows have UI-equivalents elsewhere. |
| **Agents / Skills** prompt packs (`kaddo add agents|skills`) | `knowledge/agents/*` and `knowledge/skills/*` | LLM-side reasoning: capability extraction, refinement, implementation planning ("Kaddo ships agent *prompts*, it does not run them", `README.md:317-318`). |

---

## 5. Living documentation — the mechanism, not the marketing

### 5.1 What "drift" is in Kaddo's code

Stated mechanism (owner's own words): "`kaddo guard` reads `git diff`, finds artifacts whose `code:`
globs match changed files, and shows a **non-blocking FYI** when the artifact was not updated in the
same diff." (`README.md:312-313`).

In code, precisely:

1. Guard enumerates modified files via git (`getModifiedFiles` head or staged, `guard.ts:197` via `services/git.js`), normalizes git-root-relative paths to project-relative (`core/diff-analysis.ts:14-30`, VS-060.1).
2. Every `knowledge/**` artifact whose frontmatter declares `code:` globs is matched against the touched files (`services/knowledge-artifacts` discovery; `core/diff-analysis.ts:118-126` `analyzeGuard` keeps only artifacts with globs and computes matches).
3. An artifact is "updated in the diff" when its *own file path* is among the touched files, matched leniently by substring of paths (`core/diff-analysis.ts:89-93` — `artifactFileWasModified` uses `endsWith` either direction).
4. Any match where the artifact file was **not** touched becomes a "possible knowledge drift" FYI listing matched files, declared globs and evidence signals (`guard.ts:65-80` `printFYI`, emitted at `guard.ts:361`; evidence = "N/M globs matched + knowledge level + domains", `core/diff-analysis.ts:95-115`).
5. Guard is **silent** by default when no artifact declares ownership (`guard?.silent_without_ownership ?? true`, `commands/guard.ts:198`; `analyzeGuard` returns `silenced: true` when there are zero glob-bearing artifacts, `core/diff-analysis.ts:105-109`). "No ownership declared → no noise on day one" (`README.md:313-315`).
6. Extra non-ownership signals ride along in the same run: metadata health (missing frontmatter fields on bootstrap-seeded files, `core/metadata-health.ts:5-15`), legacy-risk intersections (touched files vs declared legacy-risk globs, `guard.ts:390`), cross-repo evidence for Work Items, scope-coverage findings, domain-owner notification (`guard.ts:428, 454, 470`).

**So: Kaddo drift = "code was touched in a diff; an authored artifact claims to own that code via
frontmatter globs; the artifact's own file did not participate in the same diff."** It is a
change-event check, not a continuously maintained truth comparison. It says nothing about whether the
artifact's content is actually true of the code, and it has no notion of re-derivation, content hash
or freshness stamp of knowledge against HEAD.

### 5.2 What each named command actually detects

| Command | Detects (mechanically) | Citation |
|---|---|---|
| `status` | Repo knowledge census: work items by status, share with `code:` ownership, active ignores, domains, stack line from config | `commands/status.ts:45-70` |
| `explain` | What the knowledge repo currently contains: `knowledge/knowledge.md` text, active work items, per-filter artifact lists (domain/type/since textual match); full mode also persists `explain.md/.json` | `commands/explain.ts:96-150, 214-224` |
| `understand` | "What should I do now": phase assessment from real knowledge state (layers, roadmap, WIs, ownership), next-step recommendation, blocking-count of open questions | `commands/understand.ts:112-150` (`assessPhase`, `resolveNextStep`, `buildOpenQuestionsReport`) |
| `verify` | Whether a Work Item is evidentially complete: AC list parsed from body headings, explicit checkbox = evidence reference (`verify.ts:36-57`), git changed paths as implementation evidence (`verify.ts:92-99`), release gates, completion decision `READY_TO_COMPLETE / READY_WITH_EXCEPTIONS / NOT_READY`; persists evidence into frontmatter | `commands/verify.ts:59-266` |
| `guard` | §5.1 change-event ownership drift — git diff vs `code:` globs | `commands/guard.ts:186-490`, `core/diff-analysis.ts:89-126` |
| `classify` | "cheap Classification Drift from diff signals": whether declared work-item `type` is consistent with observed diff content signals (heuristic content classifier) | `index.ts:745`; `architecture/roadmap.md:24` (v1.2.0 entry) |
| `drift` report | Aggregates recorded guard runs: per code path "threads" that stay open across comparable runs (resolved when a later run stops warning), hotspots, trend, plus deterministic deprecation-target topology checks and graph hints | `core/guard-history.ts:56-110` (`resolveDriftThreads`), `core/drift-report.ts:15-100` |

### 5.3 What keeps knowledge "alive" — and what happens when it goes stale

The living loop is: authors declare ownership (`code:` globs) → every code change is opportunistically
compared against that ownership (`guard`, `guard --record` to `.kaddo/history/`) → a repeat offender
becomes a "drift thread" in the trend report → the report tells the human/agent which artifact to
re-check (`guard.ts:284-302` recording; `guard.ts:298-306` warnings with
`status: 'open'`; resolution semantics `core/guard-history.ts:67-68` — "A code path's warning is
resolved when a later comparable run no longer warns"). `understand` then steers the next
authoring/refinement step (`commands/understand.ts:111-248`).

What happens when knowledge goes stale and no one acts:

- Nothing automatic. Guard warnings carry no state change; the offending artifact stays served by
  `explain`/`context`/`understand` unchanged.
- Safety nets are conservative *downgrades*, not repair: `context/explain/readiness` don't present
  placeholder/no-content knowledge as consolidated since `artifact-quality.ts` classifies missing |
  placeholder | weak | useful "when in doubt it classifies down" (`core/artifact-quality.ts:7-12`).
  Metadata drift on seeded files is flagged (`core/metadata-health.ts:5-15`).
- Trend hardened only if humans adopt the protocol: ≥2 comparable `guard --record` runs are required
  before historical drift exists at all (`core/drift-report.ts:69-74`: `h.total_runs >= 2`; "one run
  creates an observation, while multiple comparable runs are needed for a historical trend",
  `core/drift-report.ts:100-102`).
- The design doc says the central architectural open question *is* exactly this: "Central question:
  *How does Kaddo know the right knowledge was impacted by this change?*" (`architecture/knowledge.md:12`,
  restated as source of truth in `architecture/roadmap.md:8-9`).

**Assessment of the claim C2 ("keeps knowledge alive as the system evolves")** — the mechanism is
subscribed: freshness exists only for artifacts that declare ownership; staleness is detected only at
commit/PR time via a diff; the artifact content is never compared to the code, only the artifact's
own *file path* to the diff file list (`core/diff-analysis.ts:89-93`). Kaddo keeps the *catalog* alive
by convention; the *contents* survive on human diligence.

---

## 6. Mapping matrix — Kaddo capability ↔ gentle-ai/GKD coverage

Verdicts against this repo's mechanisms: ODD phases, `openspec/` changes, RDD review authority,
skills, subagents, Engram, CodeGraph (`codegraph`). Strictness: `duplicate` means gentle-ai/GKD
already owns the outcome; a Kaddo port of it would be forbidden by `AGENTS.md` hard rule 1 and PRD §6.

| # | Kaddo capability (what it does) | gentle-ai / GKD mechanism | Verdict |
|---|---|---|---|
| 1 | `init`+`bootstrap`: state-aware project mode, layered template scaffolding | `openspec/` change scaffold + `AGENTS.md` working contract; skill `team-docs` | `duplicate` — scaffolding of a prescribed knowledge model is what ODD artifacts already standardize |
| 2 | `scan`: deterministic stack/dir/contract inventory → `.kaddo/scan.json` | GKD L0 brief (orientation, `docs/proposals/thesis-draft.md:68`) | `complementary` — same output type; Kaddo's is thin and feeds authoring, not answering; GKD can absorb the *idea* of a baseline artifact |
| 3 | `context`/`understand`: LLM context pack built from authored knowledge + phase-based next-step | ODD explore step + Pi tools (CodeGraph, Read) + skills | `duplicate` — the trigger and the *content source* differ, but gentle-ai agents already assemble context; Kaddo adds no evidence mechanism the harness lacks |
| 4 | `explain`: what the knowledge repo knows, human/agent renderings | Engram session memory + `docs/` projections | `duplicate` for session knowledge; `arguably gap` for *repo-scoped, verifiable* knowledge — but GKD's derivation closes it, not an explain-port |
| 5 | `create/ready/import/learn` Work Item lifecycle, directories as state | ODD phases with `odd/tasks/` journal + `openspec/` change directories | `duplicate` — PRD §6 explicitly excludes it; `AGENTS.md` hard rule 1 forbids a second lifecycle |
| 6 | `verify`: AC evidence + gate decision to complete | RDD review authority + ODD verification; gentle-pi review | `duplicate` — completion decisions are the harness's; PRD "No delivery gates" (`PRD.md:120`) |
| 7 | `guard`: diff-time ownership drift FYI to code artifacts | No direct owner: GGA reviews the *diff for code quality*, not knowledge-authoring coverage | `gap` (as a *pattern*), `complementary` in mechanism — GKD's `gkd check` covers derived-claim staleness (thesis §3.2 `docs/proposals/thesis-draft.md:80-87`); Kaddo's ownership-frontmatter FYI is an authored-knowledge mechanism GKD should not clone |
| 8 | `drift` trend report from recorded guard history (`--record`, threads, hotspots) | RDD defect workflow records review evidence; ODD verification log | `duplicate` in lifecycle (evidence accumulation), `complementary` in artifact (trend report) — GKD's `check` output must include stale-but-served detection it already plans |
| 9 | `owners` (frontmatter `code:` globs + `owners suggest`) | none (gentle-ai has no code-ownership-by-glob model) | `complementary` — cheap provenance idea; but it is *authored, not derived*; keep out of GKD v0 per thesis "Derived, not authored" (`docs/proposals/thesis-draft.md:95`) |
| 10 | Knowledge Capsules (cross-repo, no source access) | none | `gap` — but explicitly out of GKD scope: no multi-repo (`docs/proposals/thesis-draft.md:175`) |
| 11 | Multirepo modules mapping | none | `duplicate` of nothing / `out of scope` — GKD scope excludes platform, multi-repo (`docs/proposals/thesis-draft.md:174-175`) |
| 12 | `graph export`: project knowledge graph from artifacts, never from source | CodeGraph (code symbol graph) | `complementary`, not duplicate — different node space; but careful: GKD should not need Kaddo's protocol graph |
| 13 | POC mode (`--mode poc`, hypothesis → evidence → verdict) | ODD proposal path (`docs/proposals/`), skill-improver experiment flow | `duplicate` |
| 14 | `questions`/`readiness` gate over blocking Decisions | ODD decision-gate table (`AGENTS.md` "Decision gates") + owner-only sections in PRD | `duplicate` |
| 15 | Admin web UI, integrations (Jira/GitHub/Azure), telemetry, OKF format, `deprecation` planning machinery | ODD/open-spec norms; PRD out-of-scope text bans delivery lifecycle, admin, integrations, telemetry explicitly (`PRD.md:114-123`) | `duplicate` / `excluded` |

---

## 7. What this should change about GKD's scope (decision D1)

The facts that should inform decision D1 (PRD `PRD.md:132-135`: does GKD own the discovery half
only?). D1 splits Kaddo into the *discovery* half and the *delivery-lifecycle* half and proposes
owning only the first. The audit's answer:

1. **The "discovery half" of Kaddo, strictly, is not a discovery engine.** The two deterministic
   detectors (`scan`, `classify`, `guard`) read manifests, directory names and git diffs — never
   inferred repo truth. The knowledge base is *seeded by templates and filled by agents and humans*
   (`commands/bootstrap.ts:8-9`; `README.md:37`). Cite: `core/artifact-quality.ts:1`.
2. **The specific "living documentation" mechanism is narrower than the claim (C2):** only artifacts
   that declare `code:` globs get any staleness signal; staleness = artifact file was not touched in
   the same diff (`core/diff-analysis.ts:89-93`), which is a *participation heuristic*, not a truth
   check. So GKD's plan — freshness stamps re-derived against HEAD (`docs/proposals/thesis-draft.md:83-87`) —
   is a strictly stronger mechanism than anything in Kaddo. Cite: `core/diff-analysis.ts:89-126`.
3. **There is no budget, no level control, no evidence-pointer discipline** anywhere in the CLI
   response paths: every answer is either full-file or full-report; no budget/level parameter exists
   in `context` (`index.ts:701`; only a format flag, `index.ts:701-707`), `explain` (`index.ts:690`;
   only `--for/--scope/--type/--since`) or `understand` (`index.ts:705`; takes no options at all).
   Nothing is ever trimmed, levelled or budgeted. GKD's declared budget + level is un-owned
   territory. Cite: `commands/context.ts:1-56`, `index.ts:690-707`.
4. **The Kaddo *content* is unverifiable by construction**: ownership and knowledge artifacts carry
   prose and globs; the graph tool explicitly "never reads source code content" (`core/graph.ts:1-11`)
   so the knowledge model is intentionally code-free. This *asset* is not the thing to copy into GKD;
   the *of* (`docs/proposals/thesis-draft.md:162`, "Kaddo is an engine and dependency candidate, never
   a base") should stay: GKD should consume Kaddo-style artifacts only as *signals* in its derived
   layer, never as a truth source.
5. **`guard`'s interaction model is a good, conservative contract** to match inside GKD where it
   overlaps *only* with Kaddo-shared concepts: silent without ownership (`commands/guard.ts:198`; design decision "Silent without ownership",
   `architecture/knowledge.md:31`), non-blocking by design (`architecture/knowledge.md:30`),
   explicit escape-hatch flags.
   But the *inheritance* (frontmatter ownership, ignore-with-reason store) is Kaddo-native authoring
   machinery. GKD's corresponding loop is `gkd check` naming stale derived claims.
6. **The delivery half is not half — it is the majority**: lifecycle/integration/admin/planning
   machinery owns 16 of the 43 command files (G4/G6 above: `create`, `ready`, `work-item`,
   `integrations`, `verify`, `learn`, `initiative`, `plan`, `resources`, `deprecation`, `topology`,
   `capsule`, `ignore`, `admin`, `adapters`, `telemetry`) plus ~40 workflow subcommands in
   `index.ts:131-880`. This is exactly the "covered by" logic the PRD claims: the harness already
   owns that outcome — strict `duplicate` verdicts in rows 5, 6, 13, 14, 15 above.
7. **Contradiction check vs `PRD.md` and `AGENTS.md`** — the code confirms both:
   - Spec: PRD says Kaddo-style `.kaddo/` state is a real, convention-enforced directory layout —
     confirmed (`commands/bootstrap.ts:29-44`, `commands/guard.ts:23`, `core/guard-history.ts:31`);
     every write path is a fixed `join(dir, …)` in code, never configurable to land elsewhere.
   - Spec: PRD says Kaddo has TTY-bound setup — confirmed (`commands/init.ts:244,255,287-300`;
     `commands/scan.ts:92-96,112-116`), with partial headless relief only in `--ci`/`--json` modes
     (`guard.ts:188-189`).
   - **No contradiction found in the Kaddo-facts section of PRD §4.** But PRD §4's table row "Kaddo:
     knowledge of the product, organized in four layers, plus a Work Item lifecycle" understates
     Kaddo's *actual* ambition: the README also claims "keeps knowledge alive" (C2), which, per fact
     2, is only partly true. GKD should *not* inherit the "knowledge of the product is the real goal"
     frame scoped to human-authored layers; the change warranted is: keep D1 as proposed, but drop
     any aspiration to "duplicate Kaddo's guard/drift" as a *feature for feature* — replace it with
     the stronger `check`/staleness design already in the thesis.

---

## 8. Open questions for the owner

1. **Should GKD track *authored* knowledge staleness (Kaddo-style, frontmatter ownership globs), or
   *only* derived-claim staleness, which `gkd check` already promises?** The code establishes that
   Kaddo's version of "drift" is diff-file-shape/participation, not content truth
   (`core/diff-analysis.ts:89-93`); keeping it verbatim would re-implement an authored mechanism the
   thesis forbids (`docs/proposals/thesis-draft.md:95`, "Derived, not authored").
2. **Is the Kaddo `.kaddo/` directory layout (config.yml + scan.json + history/) worth mirroring as
   the single-state-directory shape in `docs/proposals/thesis-draft.md:98-100` (`.gkd/`)?** The audit
   cannot decide: it is an owner question about state layout, not about mechanism.
3. **Should GKD define a *derived-only* knowledge artifact, like Kaddo's `knowledge/inventory.md`, as
   the one regeneration target, with overwrites guarded like `scan` does
   (`commands/scan.ts:85-103`)? Or is the whole answer set re-derivable statelessly?** The lucky gap:
   Kaddo mixes "human-editable knowledge" and "regenerable inventory" under one `knowledge/` root
   (`commands/scan.ts:100`); GKD's contract says a single declared state dir. Choose explicitly.
4. **Explain-level report equivalence**: Kaddo's `explain.md/json`, `understand.md`,
   `impact/savings/drift` reports are five different renderings of the same knowledge base. Should
   GKD standardize on exactly one envelope (as the thesis §4 envelope already does,
   `docs/proposals/thesis-draft.md:116-120`) even when other downstream consumers of derived knowledge
   appear? (Owner call: envelope depth vs interface count.)
5. **Guard/ownership FYI belongs conceptually to *any* pending harness mechanism of the same shape
   (not Kaddo-native)**: since the harness (gentle-ai) is planning `gkd check` under ODD verify, does
   the owner want the check to *also* admit "external knowledge artifact outlines that have not been
   re-validated" — or strictly derived truth? This is the same as question 1 restated at the product
   level; kept open because the answer depends on where the owner bites the bullet on "authored"
   auxiliary artifacts.

---

### Method notes and limitations

- Read-only method: grep and file reads only; no Kaddo binary execution was performed in this audit
  (per `PRD.md:114` and `AGENTS.md` hard rule 4: the clone is a reference, never executed).
- Version target: v3.132.0 (confirmed `packages/cli/package.json:3`).
- Not verified in this audit (candidates for a follow-up citation pass): (a) runtime behavior of the
  docs site (`apps/docs/` Astro + `netlify.toml`, only listed, not read); (b) whether the
  `packages/integrations/src/` adapters reach the network only under explicit read commands (`git`
  status shows jira/mock adapters present but their bodies were not read); (c) UI source of the Admin
  panel beyond the command entry (`packages/admin/`, not read).

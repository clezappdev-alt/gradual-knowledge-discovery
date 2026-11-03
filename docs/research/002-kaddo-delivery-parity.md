# Kaddo delivery-lifecycle parity — collision map against gentle-ai (ODD, RDD)

> Scope: the **delivery half** of Kaddo v3.132.0 only. Build on `docs/research/001-kaddo-audit.md`
> (command inventory, §2 G4/G6 and mapping matrix §6); this file answers the narrower owner question:
> *where exactly does parity collide and duplicate, and how does what Kaddo contributes get
> substituted, documented, by gentle-ai's own artifacts?* It is a decision aid for D1
> (`PRD.md:132-136`), not a proposal.
>
> Sources, read-only: the clone at `references/kaddo/` (no file touched, no command executed) and the
> installed gentle-ai/gentle-pi material of the active gentle-shell version. **Citation
> conventions:** all Kaddo citations are `path:line` relative to `references/kaddo/` (same convention
> as `001-kaddo-audit.md`). All `gentle-pi/…` citations resolve inside the installed gentle-pi package
> root of that version, relative to the package; no absolute path is recorded here. Repo-side
> citations are plain `path:line`.
>
> **`openspec/` is NOT a harness mechanism.** The ODD contract injected by the harness never
> mentions it; its authority artifact is the feature document `odd/tasks/<feature>.md`
> (`gentle-pi/assets/orchestrator-memory.md:7`; the delegation handoff sends workers to that same
> document's `## Specs`, `gentle-pi/assets/orchestrator-delegation.md:7`). `openspec/` is a
> project-adopted SDD convention (`AGENTS.md:4,24`) with no installed CLI on this machine;
> wherever it appears below it is labeled as such, and a row whose only substitute is openspec is
> treated as a `gap` for ODD users.
>
> Verdict strictness: `duplicate` = gentle-ai/GKD already owns the outcome; a Kaddo port would be
> forbidden by `AGENTS.md:46-49` (hard rule 1) and `PRD.md:117-119`. `partial` = the outcome is
> covered by a different-shaped harness mechanism with a real loss. `gap` = nothing covers it (even
> when the exclusion is deliberate per `PRD.md:112-124`).

## 1. Collision matrix

| # | Kaddo capability (what the code does) | gentle-ai artifact / flow that covers the outcome | Verdict |
|---|---|---|---|
| 1 | **Work-item lifecycle with directory-as-state**: items live under `knowledge/delivery/work-items/` (`create.ts:14-16`), are created into `draft/` (`create.ts:22-31`), validated and moved `draft/ → ready/` by `ready` (`ready.ts:20-63, 80-106`), and completed/archived by `learn` (`learn.ts:17-22, 29-52`); the allowed transition graph (`draft→ready→in-progress→completed/blocked`) is hard-coded (`core/lifecycle.ts:9-32`) | ODD phase vocabulary `authorizing → exploring/deciding → planning → implementing → checking/closing` (`gentle-pi/assets/orchestrator-tracking.md:37`); large work is tracked in one feature document `odd/tasks/<feature>.md` with `S#` specs and per-task status + commit identity or RED/GREEN evidence (`gentle-pi/assets/orchestrator-memory.md:7-13`); delivery is work-unit commits in reviewable slices (`gentle-pi/skills/work-unit-commits/SKILL.md:81-91`) | `duplicate` — the *decision authority* over a work item's state is exactly what the harness owns (`PRD.md:117-119`); state lives in the feature document + `todo` projection, not in per-increment directories |
| 2 | **Roadmap candidate materialization**: `create --from roadmap` parses candidates from `knowledge/delivery/roadmap.md` (`core/roadmap.ts:333`, `create.ts:17`) and walks the user through selecting a candidate, resolving type/level and prefilling answers (`create.ts:583-663`); `initiative materialize <id> <candidateId>` does the same from an initiative block (`initiative.ts:242-249`) |Nothing equivalent exists. The nearest artifacts are the feature document's `## Specs` (requirements captured verbatim, `gentle-pi/assets/orchestrator-memory.md:10`) and the delivery-strategy forecast at its creation (`gentle-pi/assets/orchestrator-tracking.md:41`); there is no durable backlog of candidate items awaiting materialization | `partial` |
| 3 | **Plans / epics / initiatives progress machinery**: `plan`/`epic` list/show/progress computes planning coverage, completed/blocked work-item counts and a "human approval required" completion-readiness flag (`plan.ts:41-97`; epics aggregate via `plan.ts:69, 144`; initiative show/progress/analyze same shape, `initiative.ts:32-186`); `initiative complete` evaluates readiness, then requires an explicit confirm even when not ready (`initiative.ts:201-219`) | Feature documents are per-feature, not per-roadmap; chaining exists but at the delivery level: slice boundaries and which commits each PR holds are recorded in the feature document (`gentle-pi/assets/orchestrator-tracking.md:41-53`); the closest readiness ritual is the ODD close gate — continue or quote the user's stop, or one **Needs your decision** (`gentle-pi/assets/orchestrator-tracking.md:13`) | `partial` |
| 4 | **`verify` — AC evidence, release gates, completion decision**: parses AC checkboxes from the body (`verify.ts:35-59`), reads git changed paths as implementation evidence (`verify.ts:92`), marks each AC passed only if explicitly checked (`verify.ts:131-139`), evaluates release gates from frontmatter (`verify.ts:185-193`, `core/implementation-evidence.ts:236-241`), prints a `READY_TO_COMPLETE / READY_WITH_EXCEPTIONS / NOT_READY` decision and persists evidence into frontmatter (`verify.ts:242-257`) | The *completion decision* is duplicated by harness authority: candidate risk assessment at each work-unit commit boundary via `gentle_review assess` (`gentle-pi/assets/orchestrator-tracking.md:39`), the verification tier table with independent verify on high risk (`gentle-pi/assets/orchestrator-verification.md:10-24`), and evidence recorded in the `## Log` (`gentle-pi/assets/orchestrator-memory.md:9`). But no artifact stores *per-acceptance-criterion* evidence — review evidence is candidate-bound receipts, not a checklist ledger | `partial` — decision duplicated, evidence record is not |
| 5 | **`learn` — captured completion learnings**: blocks completion on failed gates/rejected exceptions/failed validation unless `--force` (`learn.ts:125-151`), prompts for required free-text learning, enriches it with exception/gate notes and rewrites the artifact's `## Learning` section, moving the item to `completed/` (`learn.ts:17-22, 29-52, 159-192`) | Subagents save discoveries via Engram before returning, and the parent mirrors them (`gentle-pi/assets/orchestrator.md:67-69`); ODD log rules put verification evidence and progress in the feature `## Log` (`gentle-pi/assets/orchestrator-memory.md:9-13`); but `odd/` is local-only (`AGENTS.md:56`) and Engram persists outside the repo — there is no repo-tracked, per-artifact learning section | `partial` |
| 6 | **External work-item import**: `integrations import <id> <external-id>` previews, shows captured intent and requires explicit confirmation before creating a draft (`integrations.ts:129-158`); `work-item import` accepts file/`--text`/stdin, dedups by content hash with conflict resolution, and ends with an agent-refinement handoff (`work-item.ts:16-139`, dedup at `work-item.ts:57-58`, conflict options ~84-99, handoff `work-item.ts:127-130`) | No automatic importer exists. The harness's intake is human-mediated: an approved issue (`status:approved`) plus clean-`main` reproduction gates implementation (`gentle-pi/skills/rdd-defect-workflow/SKILL.md:19`); `gentle-pi/skills/issue-creation/SKILL.md:3` covers issue creation/triage from repository evidence. Refinement itself is covered by explore/writer delegation (`gentle-pi/assets/orchestrator.md:55-58`) and skill resolution (`gentle-pi/assets/orchestrator.md:71-73`) — the *lifecycle* part is `duplicate`, the *import bridge* is not | `partial` |
| 7 | **Admin web UI**: local server on 4173 serving a built frontend (`admin.ts:72`), SQLite-backed storage under `.kaddo/admin/` (`admin.ts:99`), server creation, auto browser open (`admin.ts:102-117, 129`) | Nothing. No browser UI for work items, integrations or import provenance exists anywhere in the harness surface read; the closest text-only analogues are `todo` projection + feature documents | `gap` (excluded by `PRD.md:117`) |
| 8 | **Knowledge Capsules**: `capsule export` writes `.kaddo/exports/*.capsule.md|json` for project/system/module scope (`capsule.ts:21-40`); `capsule add <path>` registers an external capsule under `.kaddo/external.yml` and folds it into the context pack (`capsule.ts:58-77`, `capsule.ts:74`) | Nothing, and explicitly out of scope: no knowledge capsules (`PRD.md:117-118`); the audit already recorded the verdict against the multi-repo boundary (`001-kaddo-audit.md:126-127` row 10) | `gap` (deliberate) |
| 9 | **Owners / code-ownership frontmatter**: `owners` lists domain ownership from frontmatter, `owners suggest` proposes `code:` globs interactively from diff signals, with suggested-vs-custom choice and confirmation prompts (`owners.ts:18, 76-113`) | Nothing — no code-ownership-by-glob model exists on the harness side (first recorded in `001-kaddo-audit.md` §6 row 9); the GKD alternative is derived staleness, a strictly different mechanism (thesis direction, `001-kaddo-audit.md:124-125` row 7) | `gap` (deliberate by GKD's own thesis: authored, not derived) |
| 10 | **Deprecation planning**: plans and targets per environment (`deprecation.ts:88-100`), removal-wave computation dependents-first (`deprecation.ts:88-103` via `core/deprecation-intelligence.ts`), unused-confidence analysis with mandatory human confirmation windows (`deprecation.ts:102-133`), candidate work items for removal (`deprecation.ts:120` forward), production runbooks created/validated from plan context (`deprecation.ts:237-265`) | Nothing. The only repo-side substitute today is prose: a decision record under `docs/decisions/` (`AGENTS.md:66-82` authority map) — no waves, no windows, no runbook scaffolding | `gap` |
| 11 | **Topology proposals**: an external agent authors a YAML proposal; `topology validate` checks it deterministically (`topology.ts:41-55`); `topology apply` re-validates, requires explicit human confirm, applies atomically to `knowledge/tech/system-topology.yml`, and guards against concurrent change via the revision it was validated against (`topology.ts:55-77`, revision guard at `topology.ts:71`) | Nothing — no harness artifact accepts an agent-authored, validated-overwriting topology proposal. GKD's design travels the inverse direction (derive structure from the tree), and ODD gates anything novel on user authorization, not auto-apply. No generic "proposal → validate → confirm → apply" artifact engine exists | `gap` |
| 12 | **Project resources registry**: `resources list/get` render type, provider, environments, access interfaces, boundaries and auth *references* (never values) from `knowledge/tech/resources/` (`resources.ts:23-105`); create/update/delete with reference-preview and forced confirmation (`resources.ts:82-105, 121-177, 185-205`) | Nothing. The harness holds environment facts only in session state; the repo-contract file for what is allowed to be checked in is `SECURITY.md`, unrelated to resource catalogs | `gap` |
| 13 | **Per-WI refinement handoff (agent prompts/skills)**: import surfaces end by recommending the agent and skill to refine the new draft (`work-item.ts:127-130`; `integrations.ts:157`) | Skill Registry Protocol: the parent resolves skill paths once per session and workers read injected `SKILL.md` first (`gentle-pi/assets/orchestrator.md:71-73`); explore/writer/verify delegation covers the roles (`gentle-pi/assets/orchestrator.md:55-58`) | `duplicate` |

## 2. Substitution paragraphs (every `partial` or `gap` row)

**#2 Roadmap candidate materialization — substitute: the feature document's `## Specs` + issue of tasks.**
A gentle-ai user plans work when authoring the feature document: requirements are captured verbatim
in `## Specs` numbered `S1..Sn` with their checks (`gentle-pi/assets/orchestrator-memory.md:10`), and
tasks are one line per unit with a stable ID, linked `S#` and route (`...orchestrator-memory.md:11`).
That replaces "roadmap → candidate → work item" for *a feature already authorized to build*. What is
lost: there is no place to park *future* candidate work that nobody authorized yet. Kaddo's roadmap is
a durable backlog; the harness's spec list is created only after exploration of an authorized task
(`gentle-pi/assets/orchestrator-tracking.md:13`). A backlog substitutes to an issue tracker or
markdown proposal — that is a **user-maintained artifact, not owned by the harness**, so no
candidate-selection, prefill or traceability frontmatter (`create.ts:585-661`) comes with it.

**#3 Plans / epics / initiatives progress — substitute: ODD slice boundaries in the feature document.**
Multi-feature structure is replaced by chaining: the delivery-strategy paragraph records slice
boundaries and which commits each PR holds in the feature document
(`gentle-pi/assets/orchestrator-tracking.md:41-53`). What is lost: (a) *aggregated progress across
planned-but-unstarted work* — a plan's completed/blocked counts over a candidate set
(`plan.ts:83-93`) have no equivalent when the candidate set is future (see #2); (b) *milestone exit
criteria and blocking-dependency reporting* (`plan.ts:85-93`) exist nowhere machine-checked; (c)
completion readiness that names "human approval required" as a computed state (`plan.ts:93`,
`initiative.ts:210-214`) is replaced by the ODD close gate, which is a *procedural* guarantee
(`gentle-pi/assets/orchestrator-tracking.md:13`) rather than a queryable readiness verdict.

**#4 `verify` AC evidence — substitute: RDD review receipts + verification tiers.**
"Is this work done and provably so?" is answered at the work-unit commit boundary: `gentle_review`
assess per commit with a reviewed boundary (`gentle-pi/assets/orchestrator-tracking.md:39`), tiered
verification where high risk adds an independent `gentle-ai-verify`
(`gentle-pi/assets/orchestrator-verification.md:10-24`), and observed evidence recorded per requirement
in the `## Log` (`gentle-pi/assets/orchestrator-memory.md:9-13`). What is lost: the *granularity* of
evidence. Kaddo refuses completion while any single criterion is unchecked
(`verify.ts:36-57`, `core/implementation-evidence.ts:236-241`) and stores that ledger in the artifact's
frontmatter (`verify.ts:253-256`). The harness records outcomes per requirement, in prose, local-only —
no machine-readable "AC 3 of 5 unverified" ledger exists, and nothing blocks a completion on one
missing criterion except README/verify discipline itself.

**#5 `learn` — substitute: Engram observations + ODD `## Log`.**
"What did we learn" goes into subagent memory saves and the parent's mirrors
(`gentle-pi/assets/orchestrator.md:67-69`) and into the feature document's log section
(`gentle-pi/assets/orchestrator-memory.md:9-13`). What is lost: learning tied to the finished artifact
in the tracked repo. `learn.ts:29-52` rewrites a `## Learning` section on the completed item and moves
it to `completed/` — anyone reading the repo later sees why the change happened. The ODD equivalents
are either local-only (`odd/`, `AGENTS.md:56`) or live outside the repository entirely (Engram), so a
future contributor without the session or memory does not inherit the learning from the file tree.

**#6 External work-item import — substitute: manual issue flow, human-keyed.**
An external ticket becomes an approved GitHub issue (`status:approved` gate,
`gentle-pi/skills/rdd-defect-workflow/SKILL.md:19`) which then requires clean-main reproduction before
any implementation; the issue-creation skill covers triage from repository evidence
(`gentle-pi/skills/issue-creation/SKILL.md:3`). What is lost: everything deterministic in Kaddo's
bridge — no network fetch, no preview/captured-intent display (`integrations.ts:132-148`), no content
hash dedup (`work-item.ts:57-58`), no conflict resolution preserving or replacing by ID
(`work-item.ts:84-107`), and no per-source provenance fields (`create.ts:385-432` fills
`source:*` frontmatter from roadmap candidates). Re-keying is the operator's full manual burden.

**#7 Admin UI — substitute: none.**
The honest answer: reading work state from the terminal artifacts (`odd/tasks/<feature>.md`, feature
documents, `todo` projection, `git log`/PR list) is what substitutes Kaddo's browser view
(`admin.ts:102-117`). What is lost: a single visual surface over *everything* — work items, integrations
config, external item discovery, import provenance (its exclusive capability per
`001-kaddo-audit.md:148`) — that a non-harness user (manager, reviewer without a Pi session) could open
without training. There is no harness artifact a stranger can open. This is acceptance of
`PRD.md:117`, and the cost is paid by humans outside the agent session.

**#8 Capsules — substitute: none inside gentle-ai; a proposal would be a docs artifact.**
A user who wants to hand another team's agent "what this repo knows without its source" today writes a
curated document by hand and shares it — the harness has no capsule format, no
`type: knowledge-capsule` marker check (`capsule.ts:74-76`), and no mechanism feeding imported external
knowledge into a context pack (`capsule.ts:77`, "the pack now includes an External Knowledge
section"). What is lost: the *protocol* — a standard, self-describing, secret-free export that a second
agent can ingest. Out of scope by decision (`PRD.md:117-118`), so the loss is accepted, but it is real
for any future multi-repo desire (forbidden by `001-kaddo-audit.md:126-127` row 11 for v0).

**#9 Owners/frontmatter ownership — substitute: nothing current; GKD's answer is derivation, not
authoring.**
The harness has no per-file ownership declaration and no diff-time FYI that a knowledge artifact "owns"
touched code. GKD's planned `gkd check` staleness design is the recorded substitute
(`001-kaddo-audit.md:124-125`, row 7), and the thesis forbids cloning the authored-glob mechanism
(row 9, citing the "Derived, not authored" rule). What is lost: Kaddo's ownership frontmatter answers
*who to tell* when a file changes — a social routing Kaddo's guard performs automatically
(`001-kaddo-audit.md:104-121` §5.1). No gentle-ai artifact performs that routing; substitution is a
promise that derived staleness detection makes alerting unnecessary, which is a design bet, not parity.

**#10 Deprecation — substitute: prose ADR; the machinery is gone.**
A deprecation intent is written as a decision record under `docs/decisions/` (authority table,
`AGENTS.md:66-82`) and executed as ordinary work items through the harness. What is lost, concretely,
from `core/deprecation-*` as surfaced in `deprecation.ts`: deterministic removal waves (dependents
first, `deprecation.ts:88-103`), per-target lifecycle pipelines and eligibility windows requiring human
confirmation (`deprecation.ts:102-133`), auto-proposed removal work items (`deprecation.ts:120`
forward), and production runbooks with validation (`deprecation.ts:237-265`). Replacement is entirely
human diligence — the exact thing this project's PRD says it refuses to rely on for staleness
(`PRD.md:107`), yet accepts here by silence.

**#11 Topology proposals — substitute: nothing; the direction is intentionally inverted.**
GKD has no artifact that ingests an agent-authored system-topology proposal with validate/apply/atomic
conflict-guard semantics (`topology.ts:41-77`). ODD delegation and `gentle-ai-explore` produce
*findings*, not overwritable state (`gentle-pi/assets/orchestrator.md:56`); anything novel goes through
user authorization (`orchestrator-tracking.md:13`) and, if this repo ever adopts requirements,
`openspec/` review (project-adopted convention, not a harness mechanism — header note above).
What is lost: a repeatable machine check that a proposed structural model is well-formed before a human
confirms it, and an atomic revision guard against stale concurrent proposals (`topology.ts:71`). A user
would substitute an Eyeball of the proposal in a PR — slower and error-prone, and WiP-lost
concurrency is unguarded.

**#12 Project resources — substitute: hand-written env/runbook docs.**
Where Kaddo renders access boundaries and auth *reference names* (never values) from a registry
(`resources.ts:92-105`), a gentle-ai user writes or reuses whatever `docs/guides/` or
`docs/reference/` pages exist (`AGENTS.md:66-82` — "when they exist", i.e. nothing today). What is
lost: any structure at all — typed resources, environment scoping, reference-preview before delete
(`resources.ts:185-205`), and the guarantee that auth values never enter the store
(`resources.ts:101-105`). Nothing harness-side checks those properties of a hand-written doc.

## 3. What a team would notice missing

Plain statements, no defense of the harness read here:

1. **No standing tracker.** There is no place to look up what work items exist, their states and owners
   without a live agent session: the artifacts are per-feature (`gentle-pi/assets/orchestrator-memory.md:7`),
   and `odd/` never enters a commit or review (`AGENTS.md:56`). Kaddo's `work-items/` tree with status
   directories (`core/lifecycle.ts:9-32`) is exactly the missing object.
2. **No shared visual or status surface.** No web UI (#7), no plan/epic progress reports (#3), no drift
   trend reports (`001-kaddo-audit.md:120-121` row 8). Everyone who wants the state of delivery must
   read a transcript artifact or ask the agent.
3. **No bridge to the tools the team already uses.** Tickets in Jira/GitHub/Azure do not flow in
   (#6); external knowledge does not flow in (#8). Every item arrives manually.
4. **No machine-checkable work-item contract.** Frontmatter like `phase`, `code`, `domains`,
   `implementation_evidence`, `verified_at` (`create.ts:131-149`, `verify.ts:253-256`) is greppable,
   lintable and queryable. The ODD feature document is a prose convention, not a schema; nothing
   validates it.
5. **No decommission or structural-apply ritual.** Removing old subsystems (#10) and adopting an
   agent-proposed structure (#11) have no commands or guards — only prose and a human's memory.

## 4. Closing table — the owner's question in one view

| Kaddo capability | What substitutes it (gentle-ai/GKD) | Cost of not having Kaddo's version |
|---|---|---|
| Work-item lifecycle states (row 1) | ODD phases + feature-document task status + work-unit commits (`gentle-pi/assets/orchestrator-tracking.md:37,39`; `.../orchestrator-memory.md:11-13`) | None for the *decision*; per-increment directory convention exists only inside one feature's lifetime |
| Roadmap / candidate backlog (row 2) | `## Specs` of an authorized feature; future candidates stay in an issue tracker or hand-made doc | No durable, traceable backlog deep in the repo; future items are un-governed until a feature starts |
| Plans/epics/initiatives progress (row 3) | Delivery strategy + recorded slice boundaries (`gentle-pi/assets/orchestrator-tracking.md:41-53`) | No cross-feature aggregated readiness, no milestone exit criteria, no blocking-dependency report |
| Verify: AC evidence + gates (row 4) | `gentle_review` assess + verification tiers + `## Log` evidence (`gentle-pi/assets/orchestrator-tracking.md:39`; `.../orchestrator-verification.md:10-24`) | No per-criterion evidence ledger; nothing machine-blocks completion on a single unverified criterion |
| learn: captured learning (row 5) | Engram saves + ODD `## Log` (`gentle-pi/assets/orchestrator.md:67-69`) | Learning does not live in the tracked repo, next to the artifact it explains |
| Integrations import (row 6) | Approved-issue gate + manual triage (`gentle-pi/skills/rdd-defect-workflow/SKILL.md:19`) | All fetching, preview, dedup, conflict resolution, provenance are human work |
| Admin UI (row 7) | Terminal artifacts only | Nobody outside an agent session gets a usable state view |
| Capsules (row 8) | None (out of scope, `PRD.md:117-118`) | No standard cross-repo knowledge exchange; hand-written docs must carry the load |
| Owners/`(code:)` ownership (row 9) | None; future `gkd check` derived staleness (`001-kaddo-audit.md:124-125`) | No "tell the author when this file changes" routing; staleness is a design bet, not a mechanism |
| Deprecation planning (row 10) | Prose ADR under `docs/decisions/` (`AGENTS.md:66-82`) | No waves, eligibility windows, auto-proposed removal items, or validated runbooks |
| Topology proposals (row 11) | None — GKD derives structure instead | Ingesting an agent-authored structural model has no validated/atomic path |
| Resources registry (row 12) | Hand-written docs (`docs/guides|reference/` when they exist) | No typed, environment-scoped, auth-value-free catalog with delete previews |
| Refinement handoff (row 13) | Skill Registry Protocol + explore/writer/verify delegation (`gentle-pi/assets/orchestrator.md:55-58,71-73`) | None of substance |

## 5. Contradictions note (evidence vs. the written claims)

- `PRD.md:117-119` states ODD, `openspec/` and RDD "already own" the delivery half. For the work-item
  lifecycle *decision* and the completion *gate*, the code evidence confirms it (rows 1, 4, 13 are
  `duplicate`). But for rows 2, 3, 4(evidence), 5, 6 the coverage is a differently-shaped,
  session-shaped mechanism with genuine tracked-repo losses, and the PRD's mechanism list itself is
  partly wrong: the injected ODD contract never references `openspec/` — the harness authority
  artifacts are the `odd/tasks/<feature>.md` feature document and the reviewed work-unit boundary
  (`gentle-pi/assets/orchestrator-memory.md:7`, `gentle-pi/assets/orchestrator-delegation.md:7`) —
  while `openspec/` is only a project-adopted SDD convention (`AGENTS.md:4,24`), not installed and
  not part of the flow an ODD user gets without choosing it. The PRD sentence is true as a
  jurisdiction claim for ODD/RDD and weaker as a capability claim. Nothing here contradicts
  `AGENTS.md` hard rule 1: every substitute above is a harness artifact, phase or command (or a
  labeled project convention) — this doc proposes no GKD-owned lifecycle piece.
- The audit's row 6 of `001-kaddo-audit.md` (§6) strictly marked `verify` `duplicate`, citing
  `PRD.md:120` "No delivery gates". This file separates the two sides of the same row: the *gate*
  is duplicated (RDD authority), the *evidence ledger* is not. That is a refinement of the audit's
  verdict based on the same code, not a disagreement about authority.

## 6. Method notes and limitations

- Read-only method for both sides: grep + file reads. No Kaddo command executed, no network, no
  installs. Not read (consistent with `001-kaddo-audit.md`): `packages/admin/` frontend internals
  (UI flows behind the server), `packages/admin-server/`, `packages/integrations/src/` adapter
  bodies (network side), `core/deprecation-intelligence.ts` internals beyond its call sites.
- Engram *tool behavior* on the harness side is cited only where it is stated in the harness assets
  (`gentle-pi/assets/orchestrator.md:67-69`, `gentle-pi/assets/orchestrator-memory.md`). The injected
  memory tool set itself has no file I could cite beyond that; the claims about Engram state location
  (outside the tracked repo) rest on `AGENTS.md:56` plus those assets.
- The gentle-pi skills `chained-pr` and `judgment-day` were read only at trigger/authority level
  (`gentle-pi/skills/judgment-day/SKILL.md:20,86`); their mechanics are not load-bearing in rows 1-13
  and are not cited for capability coverage.

---
name: snail-alternatives
description: Suggest up to 3 viable alternatives for a code or design decision. Includes mandatory independent review. Use when the user asks for alternatives, options, "better ways", or review of supplied options.
---

# Alternatives

## Review supplied text

When the user asks only to review existing alternatives, read `references/review.md` and dispatch a `readonly` `general-purpose` Task subagent with the full contract and supplied text. Do not self-review, draft, rewrite, create a flow or advance gates. Triage its findings using that protocol and return the findings only. Reviewers never rewrite; edits require an explicit request. Draft mode below always includes the mandatory independent review loop.

## Slug and flow folder

From the project working directory, run `node <skill-dir>/scripts/artifact-path.mjs` using this skill's absolute installed path; store its output as `<flow-root>`. In every shell command double-quote expanded paths, e.g. `init "$flow_root/snail-$slug"`; for scans quote the root but leave the wildcard outside: `"$flow_root"/snail-*/`. It resolves project-specific `$XDG_STATE_HOME/snail` state (fallback `~/.local/state/snail`). Discover and write all workflow artifacts there, including standalone use. Pass `--in-repo` only on an explicit user request, never because old files or policy exist. Leave old artifacts untouched; ask before moving, deleting or resuming them. On errors stop, never fall back to the repo.

1. If the user provided a slug, use `<flow-root>/snail-<slug>/`.
2. If the user gave no clear context, look for a stuck flow: one where `0 - EXPLORE.yaml` exists and `1 - ALTERNATIVES.yaml` is missing. If one, suggest continuing it. If several, list them and ask. If none, derive a slug from the decision and confirm.
3. Create the folder if needed. Create the runbook if missing: `node ../snail-flow/scripts/flow-state.mjs init <flow-root>/snail-<slug> --slug=<slug> --goal=<one-line goal> --at=1`. If slug `review` is requested while the standalone review artifact (`<flow-root>/snail-review/4 - REVIEW.yaml`, no runbook) exists, do not `init` over it and do not delete the file: surface the collision and let the user pick a different slug or explicitly approve moving or removing it.
4. Write the final doc to `1 - ALTERNATIVES.yaml` from `../snail-flow/templates/1 - ALTERNATIVES.yaml`, then `node ../snail-flow/scripts/flow-state.mjs advance <dir>` for row `1`, and `advance <dir> --valid=0` for row `1r` once the review loop's latest pass is clean. If the run ends early, `note <dir> <what happened>` instead.

This skill can run on its own; it still maintains the flow folder and runbook when `../snail-flow/scripts/flow-state.mjs` exists — a standalone install skips every `flow-state.mjs` call. For external artifacts no git ignore configuration is needed. With explicit `--in-repo` and no flow-state script, first check that `git rev-parse --git-common-dir` succeeds; outside git there is nothing to ignore. Inside git, add the flow root's repo-relative path on its own line to `$(git rev-parse --git-common-dir)/info/exclude` before writing (escape gitignore special characters); warn if artifacts are already tracked. Do not change `.gitignore`.

## Steps

1. **Identify** — up to 3 distinct approaches. If only one is viable, document that in `1 - ALTERNATIVES.yaml` and still produce the file.
2. **Present** — for each option: idea, snippet (if relevant), pros, cons.
3. **Review** — read `references/review.md`, then dispatch a `readonly` `general-purpose` Task subagent with its full review contract and the options text (paste both; do not point at files). Include the goal, constraints, recommendation and prior false-positive records. Do not self-review or skip this step. Triage each finding per the protocol in `references/review.md` — act on `valid` only and carry false-positive records into the next pass. Resolve every `valid` finding and re-review. Continue until the latest pass has zero `valid` findings after triage.

    **Exit rule:** stop when the latest alternatives review pass is `Lean & valid. Ship.` or has zero `valid` findings after triage (all `false_positive` or all `unvalidated`). **Stuck guard:** if the same `valid` finding persists after 3 passes, stop and report the blocker.

4. **Recommend** — one clear choice based on clarity and maintainability.
5. **Write** — save options, review findings (with triage counts), recommendation, and decision to `1 - ALTERNATIVES.yaml`.
6. **Wait** — stop for the user's choice. Do not edit code files.

## Output

`1 - ALTERNATIVES.yaml` contains:

- Goal
- Options (Idea, Snippet, Pros, Cons)
- Review findings
- Recommendation
- Decision

## Alternatives review contract

Read `references/review.md` for the complete reviewer input, findings format, criteria and standalone protocol fallback.

## Example

**Option 1: Shared helper**

- **Idea:** Extract common logic.
- **Snippet:**
    ```ts
    function processData(d: Data[]) {
    	return d.filter(validate).map(transform);
    }
    ```
- **Pros:** DRY, consistent.
- **Cons:** Adds indirection.

**Recommendation:** Option 1 — best balance.

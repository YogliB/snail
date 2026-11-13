---
name: snail-explore
description: First-link discovery. Gather repo context and write a structured report that feeds into snail-alternatives or snail-planning.
---

# Explore

## When to use

- Starting work when the problem, scope, or repo context is unclear.
- The user asks to explore, research, or understand X in this repo.
- Before `snail-alternatives` or `snail-planning` when context is missing.

## Goal

Produce a self-contained `0 - EXPLORE.yaml` so the next phase can proceed without re-exploring.

## Slug and flow folder

From the project working directory, run `node <skill-dir>/scripts/artifact-path.mjs` using this skill's absolute installed path; quote its output as `<flow-root>`. It resolves project-specific `$XDG_STATE_HOME/snail` state (fallback `~/.local/state/snail`). Discover and write all workflow artifacts there, including standalone use. Pass `--in-repo` only on an explicit user request, never because old files or policy exist. Leave old artifacts untouched; ask before moving, deleting or resuming them. On errors stop, never fall back to the repo.

1. Derive a short kebab-case slug from the goal (confirm with the user if not provided).
2. Create `<flow-root>/snail-<slug>/` if needed.
3. Create the runbook if missing: `node ../snail-flow/scripts/flow-state.mjs init <flow-root>/snail-<slug> --slug=<slug> --goal=<one-line goal>`. If slug `review` is requested while the standalone review artifact (`<flow-root>/snail-review/4 - REVIEW.yaml`, no runbook) exists, do not `init` over it and do not delete the file: surface the collision and let the user pick a different slug or explicitly approve moving or removing it.
4. Write `0 - EXPLORE.yaml` from `../snail-flow/templates/0 - EXPLORE.yaml`, then `node ../snail-flow/scripts/flow-state.mjs advance <dir>`.

A standalone install has no `../snail-flow/scripts/flow-state.mjs` or templates — skip every `init`/`advance`/`check` call above and work flow-less. For external artifacts no git ignore configuration is needed. With explicit `--in-repo` and no flow-state script, add the flow root's repo-relative path on its own line to `$(git rev-parse --git-common-dir)/info/exclude` before writing (escape gitignore special characters); warn if artifacts are already tracked. Do not change `.gitignore`.

## Output

`0 - EXPLORE.yaml` includes:

- **Goal**: restated scope.
- **Files and Context**: relevant files and inline facts.
- **Findings**: what exists, what's missing, patterns, constraints, edge cases.
- **Assumptions and Open Questions**: unknowns with acceptance impact.
- **Risks**: known blockers or high-risk areas.
- **Next Step Recommendation**: `snail-alternatives` or `snail-planning` with a one-line reason.

## Steps

1. **Clarify** — restate goal and scope. If ambiguity is high, ask or list assumptions.
2. **Search** — find relevant code, tests, docs, and config.
3. **Read** — inline the relevant snippets or facts.
4. **Synthesize** — summarize current state, constraints, and gaps.
5. **Recommend** — `snail-alternatives` if the approach is unclear, `snail-planning` if it is clear.
6. **Write** — save the report and `advance` the runbook.

Do not edit non-report files.

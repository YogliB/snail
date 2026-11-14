---
name: snail-verify
description: Verify that changes do what they aim to do and introduce no regressions. Use after implementation and before creating a PR.
---

# Verify

## When to use

- After implementation and before creating a PR.
- When the user asks "did this work?", "verify the changes", or similar.
- This skill exercises the feature end-to-end. Lint, tests, and security checks are prerequisites here, not the verification.

## Slug and flow folder

From the project working directory, run `node <skill-dir>/scripts/artifact-path.mjs` using this skill's absolute installed path; store its output as `<flow-root>`. In every shell command double-quote expanded paths, e.g. `init "$flow_root/snail-$slug"`; for scans quote the root but leave the wildcard outside: `"$flow_root"/snail-*/`. It resolves project-specific `$XDG_STATE_HOME/snail` state (fallback `~/.local/state/snail`). Discover and write all workflow artifacts there, including standalone use. Pass `--in-repo` only on an explicit user request, never because old files or policy exist. Leave old artifacts untouched; ask before moving, deleting or resuming them. On errors stop, never fall back to the repo.

1. If the user provided a slug, use `<flow-root>/snail-<slug>/`.
2. Else run `node ../snail-flow/scripts/flow-state.mjs check <dir>` on each `<flow-root>/snail-*/` that has a `runbook.yaml` (skip runbook-less folders such as the standalone `snail-review` location) and pick the flow whose `next` is `5` (a standalone install skips every `flow-state.mjs` call and works flow-less). For external artifacts no git ignore configuration is needed. With explicit `--in-repo` and no flow-state script, first check that `git rev-parse --git-common-dir` succeeds; outside git there is nothing to ignore. Inside git, add the flow root's repo-relative path on its own line to `$(git rev-parse --git-common-dir)/info/exclude` before writing (escape gitignore special characters); warn if artifacts are already tracked. Do not change `.gitignore`. Require missing `5 - VERIFY.yaml` there. If no flow identifies the work, ask for a slug.
3. When verification cannot run at all (missing credentials, services, environment), do not write `5 - VERIFY.yaml`: `advance <dir> --skip --note=<reason>` records the reason in the runbook. Otherwise write the verification report to `5 - VERIFY.yaml` from `../snail-flow/templates/5 - VERIFY.yaml` (list every receipt path), then `node ../snail-flow/scripts/flow-state.mjs advance <dir> --result=pass --receipts=<a,b>` only when every command passed. On failure `note <dir> <reason>`.

## Steps

1. **Understand intent**
    - Read the exact active plan (`2 - PLANNING.yaml`) in the selected flow or PR directory.
    - Review the diff.
    - If intent is unclear, ask the user for a one-line expected outcome.

2. **Find verification steps**
    - Use the plan's `verification` key (a light plan's per-step check commands serve).
    - If missing, read the project's existing documentation (README, CONTRIBUTING, docs/) for how to verify the project.
    - If still missing, read `.agents/verify/VERIFICATION.md` - a legacy project-level note: read it if it exists, never write or delete it. When it supplies the steps, offer to move them into the project's documentation.

3. **Stop if verification is unclear**
    - If you cannot determine from the reads above or the diff how to exercise the feature the way a user hits it, stop and ask - whether steps were found or not (steps that only prove the code compiles or tests pass do not count): "What should I run or inspect to confirm these changes do what they aim and introduce no regressions?" Offer to document the agreed method in the project's own documentation (for example a Testing or Verification section in the README or CONTRIBUTING, agent docs, or a project skill - whatever fits the project), never in flow-internal files.
    - Do not run the verification until the user answers. If there is no answer (the question is canceled or cannot be asked), stay stopped: report that verification is blocked on the user's answer and end there. Never guess a procedure. In a snail-flow run, record the block with `note <dir> 'verify blocked: awaiting user answer'` and `set <dir> status=blocked`; do not `advance` and do not `--skip` (the gate refuses both on a blocked flow, and a skip would let the flow continue to PR unverified). When the user answers, `set <dir> status=in-progress` and re-run verify.
    - After the user answers, document the method where offered above, unless it is already covered there. If no documentation file fits, ask the user where to record it - never create a competing standalone note.
    - Do not write to the plan.

4. **Exercise the feature**
    - Run the change the way a user or agent will hit it, not just the test harness. Observed feature behavior is the verification; receipts and the report only record it. Examples: run the CLI on real input and inspect what it writes; install the plugin and fire its hook through the real hook command; call the new API; serve the UI and hit the route.
    - Use the plan's steps as the floor. If every step only proves the code compiles or tests pass, add the missing feature-level exercise yourself — that is the point of this skill.
    - Treat each step as a shell command when possible, and run it through the receipt runner bundled with `snail-implement` (`node scripts/run-with-receipt.mjs <dir>/receipts <label> -- <command>` in that skill's directory). A standalone install without `snail-implement` has no runner — run the commands directly and record command plus result in the report. Record each command's receipt path in the report; a step without a valid passing receipt did not pass.
    - Stop on the first failure and report it.
    - Do not auto-fix failures.

5. **Report**
    - Print the result of each step and an overall `PASS` or `FAIL`. Never declare `PASS` without observed feature behavior; receipts and passing tests alone do not pass.
    - If a feature path cannot be exercised in this environment (missing auth, external service, hardware), record the gap in the report instead of passing silently.
    - Write `5 - VERIFY.yaml` and `advance` only on an overall `PASS`; the gate refuses `--result=pass` that lacks valid receipts.

Run this skill in a subagent when the harness supports it (a `size: light` flow may run it inline).

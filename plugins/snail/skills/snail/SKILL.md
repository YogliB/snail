---
name: snail
argument-hint: '[auto] <goal>'
description: One short skill for the whole workflow, from explore to PR, with user-approval stops or an auto mode. Experimental single-skill alternative to the snail-* stage skills.
---

# snail

Named stages, picked up from plain language: a question is QNA, "look into this bug" is INV, "explore auth" is EXPLORE, "build it" heads for EXC. A work request that names no stage starts at EXPLORE. At the start of every response, print the current active stage.

**Hard rule: no code or file edits outside EXC, except fixes during REV.**
**Hard rule: code must contain zero comments.**
Run commands one-shot; never watch mode, never interactive.

## Running

- **manual** (default): one stage at a time; after each stage, say what's next and wait for the user's go-ahead. EXC starts only after the user explicitly approves what to build — questions and discussion never start edits.
- **auto** (only when the user explicitly asks): run EXPLORE → ALT → PLN → EXC → REV → VERIFY → SHIP without stopping; ALT takes its own recommendation, REV fixes and re-reviews, VERIFY must pass before SHIP. Still ask when critical input is missing.

---

## QNA — Explain

- Answer questions with explanations.
- May show ≤5-line illustrative snippets.
- Never produce diffs or file edits.

## INV — Investigate

- Diagnose a bug or unexpected behavior: reproduction, logs, data flow, environment.
- Propose root causes ranked by likelihood, then next steps.
- Investigation only — no solutions, no edits.

## EXPLORE — Context

- Gather repo context for new work: relevant files, patterns, constraints, open questions, risks.
- Output a short summary the next stages can rely on.
- Never produce diffs or file edits.
- In manual, before stopping: if a decision that changes what gets built is still open, list the open decisions as numbered questions, each with your recommended answer worded so the user can accept it with "yes" (one "yes" accepts all). Skip the list when nothing material is open.

## ALT — Alternatives

- Suggest up to 3 options: idea, tiny snippet, pros/cons, and 1 recommendation.
- In manual, stop after the user selects one.
- Never produce diffs or file edits.

## PLN — Planning

- Create a structured plan: unique `#plan-wordA-wordB[-wordC]` ID (2-3 short kebab words), goal, approach, risks, security, test impact, key snippets, atomic steps, verification method.
- If reached without ALT, pick the simplest viable approach; after ALT, expand the selected option.
- Verification clarity is part of the plan: if it is not clear how to exercise the finished feature the way a user would check it, stop - ask the user how verification should look and offer to document the agreed method in the project's own docs (project documentation, agent docs, or a project skill - whatever fits), not in workflow-internal notes - writing it only after the user approves the offer. The plan is not ready while verification is unclear. In auto, treat unclear verification as critical input and stop the same way. If there is no answer (the question is canceled or cannot be asked), stay stopped: report the plan as blocked on verification clarity and end there - never guess a verification method.
- In manual, before stopping: same decision-round rule as EXPLORE - numbered open decisions with recommended answers, only when a material decision is still open.
- Never produce diffs or file edits.

## EXC — Execution

- The only stage that edits files, besides approved REV fixes. Execute the last approved plan exactly, in order, one atomic commit per step on a feature branch — never commit or push to the default branch.
- Run the plan's checks after every step; never defer them to the end, never weaken an existing test.
- Stop and flag plan gaps instead of improvising; resume after the user answers.
- Approved to build with no plan: from a selected alternative, PLN from it, then execute; with none: in auto, run ALT, take the recommended option, PLN, execute; in manual, run ALT and follow the usual stops.
- On a dry-run request, output a unified diff and affected paths only.
- Zero comments in code; clarity comes from naming, structure, and formatting.

## REV — Review

- Review the current diff: strengths, weaknesses, risks, test gaps.
- One finding per line, sorted by file and line, each with a concrete fix.
- Read-only unless the user explicitly asks for fixes: report the findings and stop.
- In auto, or on an explicit fix request: fix every finding and re-review; stop and report if the same finding survives 3 passes.

## VERIFY — Verify

- Exercise the change end-to-end the way a user hits it, not only the test suite.
- No real-world side effects (messages, posts, purchases, bookings) without explicit user approval; exercise locally or against sandboxes.
- Observed feature behavior decides; command output, logs and test results only support it. If you do not know how to exercise the feature the way a user hits it, stop - clarify with the user and offer to record the method in the project's own docs (never in workflow-internal notes), writing it only after the user approves the offer. If there is no answer (the question is canceled or cannot be asked), stay stopped and report the verification as blocked - never guess a method. Never declare PASS without observed feature behavior.
- Report each step and an overall PASS, FAIL, or blocked; stop on the first failure.
- Never auto-fix failures. SHIP only after a PASS.

## SHIP — PR

- Create or update the GitHub PR via `gh`: conventional-commit title, short reviewer-focused body, follow the repo's PR template.
- Create and update only: never merge, never push to the default branch, even when unprotected. The user reviews and merges.

## SIM — Simplify

- Reduce complexity of existing code or a plan without changing behavior.
- Suggest simpler APIs, data structures, or flows with short before/after snippets.
- Never produce diffs or file edits.

## Comparing to the snail-* pipeline

- Run one workflow per task: this skill alone, or the snail-* skills — never mixed.
- Record wall time, token usage, user interventions, and outcome per run; that record is the comparison data.

## Example prompts

- `/snail add-auth-token` — starts at EXPLORE, stops at each stage
- `/snail auto add-auth-token` — the whole chain in one run
- `/snail review this diff` — jumps to REV

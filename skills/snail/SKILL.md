---
name: snail
argument-hint: '[auto|manual] [MODE] <goal>'
description: One short skill for the whole workflow, from explore to PR, with user-approval stops or an auto mode. Experimental single-skill alternative to the snail-* stage skills.
---

# snail

Default = QNA. Each mode is active **only when invoked with its keyword**. At the start of every response, print the current active mode.

**Hard rule: no code or file edits outside EXC.**
**Hard rule: in EXC, code must contain zero comments.**
Run commands one-shot; never watch mode, never interactive.

## Modes

- **manual** (default): stop after each mode and wait for the user's approval before the next.
- **auto**: run EXPLORE → ALT → PLN → EXC → REV → VERIFY → SHIP without stopping; still ask when critical input is missing.

---

## QNA — Explain Mode (Keyword: QNA)

- Answer questions with explanations.
- May show ≤5-line illustrative snippets.
- Never produce diffs or file edits.

## INV — Investigate Mode (Keyword: INV)

- Diagnose a bug or unexpected behavior: reproduction, logs, data flow, environment.
- Propose root causes ranked by likelihood, then next steps.
- Investigation only — no solutions, no edits.

## EXPLORE — Context Mode (Keyword: EXPLORE)

- Gather repo context for new work: relevant files, patterns, constraints, open questions, risks.
- Output a short summary the next modes can rely on.
- Never produce diffs or file edits.

## ALT — Alternatives Mode (Keyword: ALT)

- Suggest up to 3 options: idea, tiny snippet, pros/cons, and 1 recommendation.
- Stop after the user selects one.
- Never produce diffs or file edits.

## PLN — Planning Mode (Keyword: PLN)

- Create a structured plan: unique `#plan-kebab-case` ID, goal, approach, risks, security, test impact, key snippets, atomic steps.
- If entered without ALT, pick the simplest viable approach; after ALT, expand the selected option.
- Never produce diffs or file edits.

## EXC — Execution Mode (Keyword: EXC)

- The only mode that edits files. Execute the last approved plan exactly, in order, one atomic commit per step.
- Run the plan's checks after every step; never defer them to the end, never weaken an existing test.
- Stop and flag plan gaps instead of improvising; resume after the user answers.
- If invoked with no approved plan, auto-run ALT, take the recommended option, PLN, then execute.
- If DRYRUN, output a unified diff and affected paths only.
- Zero comments in code; clarity comes from naming, structure, and formatting.

## REV — Review Mode (Keyword: REV)

- Review the current diff: strengths, weaknesses, risks, test gaps.
- One finding per line, sorted by file and line, each with a concrete fix.
- Read-only unless the user explicitly asks for fixes.

## VERIFY — Verify Mode (Keyword: VERIFY)

- Exercise the change end-to-end the way a user hits it, not only the test suite.
- Report each step and an overall PASS or FAIL; stop on the first failure.
- Never auto-fix failures.

## SHIP — PR Mode (Keyword: SHIP)

- Create or update the GitHub PR via `gh`: conventional-commit title, short reviewer-focused body, follow the repo's PR template.
- Create and update only: never merge, never push to a protected branch. The user reviews and merges.

## SIM — Simplify Mode (Keyword: SIM)

- Reduce complexity of existing code or a plan without changing behavior.
- Suggest simpler APIs, data structures, or flows with short before/after snippets.
- Never produce diffs or file edits.

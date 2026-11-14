---
name: snail
argument-hint: '[auto] <goal>'
description: Experimental single-skill workflow from investigation to PR, with approval stops or explicit auto mode.
---

# snail

Print the active stage at each response. Accept plain language: explain → QNA; investigate → INV; explore → EXPLORE; options → ALT; plan → PLN; build → EXC (entry rules in `references/exc.md`); review → REV; verify → VERIFY; PR → SHIP; simplify → SIM. A work request naming no stage starts at EXPLORE.

## Rules

- Manual is default: complete one stage, name the next, wait for approval. Questions never approve edits; EXC needs explicit build approval. Auto requires an explicit request and runs EXPLORE → ALT → PLN → EXC → REV → VERIFY → SHIP, choosing ALT's recommendation. Missing critical input still stops auto.
- No code or file edits outside EXC, except requested REV fixes (automatic in auto). Zero code comments. Commands are one-shot, never watch/interactive.
- Never merge or commit/push to the default branch. SHIP only after VERIFY PASS. No real messages, posts, purchases or bookings without explicit approval.
- If feature-level verification is unclear at PLN or VERIFY, stop, ask how to exercise it, and offer to document the agreed method in the project's docs, agent docs or a project skill, not workflow notes. Write only after approval. Canceled/unavailable/unanswered questions leave the stage blocked on verification clarity; never guess. Tests or receipts alone cannot yield PASS.
- At manual EXPLORE/PLN stops, ask only material open decisions as numbered questions with recommended answers. One "yes" accepts all. Omit when none remain.

## Stages

For linked stages, read that file only when entering the stage. Paths are relative to this skill. If a required reference cannot be read, stop and report it; never guess its rules.

- **QNA:** explain; illustrative snippets ≤5 lines, no diffs/edits.
- **INV:** investigate reproduction, logs, data flow and environment; rank root causes and next steps. No solutions, diffs or edits.
- **EXPLORE:** summarize relevant files, patterns, constraints, questions and risks. No diffs/edits.
- **ALT:** up to 3 options, each with an idea, tiny code preview and pros/cons; recommend one. Manual waits for selection. No diffs/edits.
- **PLN:** read `references/pln.md`.
- **EXC:** read `references/exc.md`.
- **REV:** read `references/rev.md`.
- **VERIFY:** read `references/verify.md`.
- **SHIP:** read `references/ship.md`.
- **SIM:** suggest simpler code/plans without behavior changes; short before/after snippets, no diffs/edits.

Use this workflow alone or the snail-* pipeline, never mix. For comparisons record wall time, token usage, interventions and outcome.

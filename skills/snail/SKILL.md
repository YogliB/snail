---
name: snail
argument-hint: '[auto] <goal>'
description: Experimental single-skill workflow from investigation to PR, with approval stops or explicit auto mode.
---

# snail

Print the active stage at each response. Stages are plain words: investigate, options, design, plan, implement, review, verify, ship, simplify. A work request naming no stage starts at investigate.

## Rules

- Manual is default: complete one stage, name the next, wait for approval. A question or discussion is ordinary conversation, not a stage: questions never approve edits, and implement needs explicit build approval. Auto requires an explicit request and runs investigate → options → (design when options calls for it) → plan → implement → review → verify → ship, choosing the recommended option. Missing critical input still stops auto.
- No code or file edits outside implement, except requested review fixes (automatic in auto). Zero code comments. Commands are one-shot, never watch/interactive.
- Never merge or commit/push to the default branch. Ship only after verify PASS. No real messages, posts, purchases or bookings without explicit approval.
- If feature-level verification is unclear at plan or verify, stop, ask how to exercise it, and offer to document the agreed method in the project's docs, agent docs or a project skill, not workflow notes. Write only after approval. Canceled/unavailable/unanswered questions leave the stage blocked on verification clarity; never guess. Tests or receipts alone cannot yield PASS.
- At manual investigate/plan stops, ask only material open decisions as numbered questions with recommended answers. One "yes" accepts all. Omit when none remain.

## Stages

For linked stages, read that file only when entering the stage. Paths are relative to this skill. If a required reference cannot be read, stop and report it; never guess its rules.

- **investigate:** understand the goal, what counts as success and what is out of scope; summarize relevant existing files, patterns, constraints, questions and risks, and how the result can be exercised. Ask only about gaps that change the solution, and keep it short for a small clear request. No solutions, diffs or edits.
- **options:** up to 3 options, each with an idea, tiny code preview and pros/cons; recommend one. Judge whether the work needs design - real decisions about solution structure, interfaces, data flow or failure behavior - and say why in one sentence; when it does not, go straight to plan. The user can always ask for design. Manual waits for the selection and the design call; auto decides both. No diffs/edits.
- **design:** read `references/design.md`. Enter only when options called for it or the user asked.
- **plan:** read `references/plan.md`.
- **implement:** read `references/implement.md`.
- **review:** read `references/review.md`.
- **verify:** read `references/verify.md`.
- **ship:** read `references/ship.md`.
- **simplify:** suggest simpler code/plans without behavior changes; short before/after snippets, no diffs/edits.

Use this workflow alone or the snail-* pipeline, never mix. For comparisons record wall time, token usage, interventions and outcome.

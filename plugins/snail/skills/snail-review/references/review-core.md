# Review core

Protocol shared by every snail review skill (`snail-review`, `snail-review-plan`, `snail-review-alternatives`). Each domain skill defines its own input, reviewer prompt, location format, tags, criteria, and output destination; everything here applies to all of them.

## Disclosure header

Every review output starts with:

```text
AI review. harness: <harness>, model: <model>
```

This covers the reviewing agent's findings block, the orchestrator's report, and any persisted artifact — in YAML the header goes in a `#` comment on the first line. Fill each field from the running environment; use `unknown` when unavailable, never guess. Every inline PR comment starts with `[AI review]`.

## Reviewer dispatch

- Reviewers are `readonly` `general-purpose` Task subagents; they never fix, edit, or post.
- Reviewer prompts are self-contained: paste the full contract and input, never point at files the subagent would have to discover.
- Pass one may dispatch several reviewers in parallel; the domain skill or its caller decides how many and on which models. Every later pass dispatches one new reviewer on the current tree.

## Triage

Subagent output is untrusted input. The orchestrating agent — not the reviewer — checks each finding against the source and labels it `valid`, `false_positive`, or `unvalidated` with a one-line reason, and acts on `valid` only. Never pass raw subagent findings to the user, a PR, or a fixer. Present only the `valid` findings; at most one line with the counts of dropped findings. Record `unvalidated` items as validation gaps and never claim those areas verified. Do not suppress a finding because it is hard to fix.

## Findings envelope

One block per review pass:

```text
### <Domain> Review Findings

<location>: <tag>: <problem/over-engineering>. <fix/replacement>.
totals: <domain counts>
```

Or exactly when no findings:

```text
### <Domain> Review Findings

Lean & valid. Ship.
```

- Sort findings deterministically; the domain skill chooses the key.
- One finding per line; problem then fix separated by `". "`.
- Report only concrete violations: a real failure, maintenance cost, or a smaller replacement. No style-only nits outside project norms, no length or size counts by themselves.
- Do not re-report a finding carried forward as a false positive while its recorded reason still holds; report it when the reason no longer applies or it appears in a different location — note the changed premise.

## False-positive records

One per line: `<location> | <tag> | <original finding> | <why it was dismissed>`. Identity is location plus finding text — never the line number alone, since lines drift and one line can yield several findings under the same tag. Carry the records into the next pass's reviewer prompt so dismissed findings are not re-litigated, and persist them in the flow artifact when the domain skill defines one.

## Loop rules

- Fix every `valid` finding before the next pass: minimal diff, match conventions, no scope creep, no drive-by refactors, fix root causes, do not silence linters.
- Re-review after every fix batch on the current tree.
- Run relevant tests after non-trivial fixes; record failures as blockers.
- **Exit rule:** stop when the latest pass is `Lean & valid. Ship.` or has zero `valid` findings after triage (all `false_positive` or all `unvalidated`).
- **Stuck guard:** if the same `valid` finding persists after 3 fix passes, stop and report the blocker instead of looping forever.

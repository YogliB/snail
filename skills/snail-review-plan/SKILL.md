---
name: snail-review-plan
description: Read-only review of a technical plan. Use when snail-planning has drafted a plan, or the user passes a plan and asks for a review.
---

# Plan Review

Evaluate a technical plan before implementation. Flag correctness blockers, gaps, and unnecessary complexity.

Shared protocol — disclosure header, reviewer dispatch, triage, findings envelope, false-positive records, loop rules — is in `../snail-review/references/review-core.md`; it is part of this skill.

## When to use

- After `snail-planning` writes a draft.
- When the user pastes a plan and asks for a review.
- Before presenting a masterplan or sub-plan to a stakeholder.

## Input

Paste the full plan text into the prompt. Do not point the subagent at plan files. Include repo constraints, user scope, masterplan ↔ sub-plan linkage (if split), known validation gaps, and — on re-review passes — the false-positive records from earlier passes.

## Output contract

The reviewing agent returns ONLY the disclosure header plus this block. No prose intro.

```text
Output ONLY in this format (no prose intro, no sections swapped).

AI review. harness: <harness>, model: <model>

### Plan Review Findings

section:line: <emoji> <tag>: <problem/over-engineering>. <fix/replacement>.
totals: N🔴 N🟡 N✂️ N🪵 N⚡ N📖 N🔵 N❓ | net: -<N> lines/steps possible

Or exactly when no findings:

AI review. harness: <harness>, model: <model>

### Plan Review Findings

Lean & valid. Ship.

Rules for Plan Review Findings:
- Sort findings section → line ascending
- One finding per line; problem then fix separated by ". "
- Location: section = the YAML key path in `2 - PLANNING.yaml` (e.g. `implementation_todos` or `verification`); line = line number within that key's block (1-based from the key line), or — when issue spans the whole key
- Action tags (literal after colon):
  - 🔴 bug: correctness blocker, contradiction, broken logic, missing critical step
  - 🟡 gap: weak testability, missing file/dependency, unclear sequencing, unmitigated risk
  - ✂️ cut: redundant prose, duplicate information, speculative task not required for goal (replacement: nothing)
  - 🪵 yagni: over-engineered scaffolding, premature generalization, unnecessary abstraction (replacement: inline or drop)
  - ⚡ simplify: over-complicated sequencing, multi-tier nesting, complex pattern (replacement: simpler layout or step)
  - 📖 read: dense YAML, magic values, or packed conditions a reader must stop to decode (replacement: plainer equivalent)
  - 🔵 nit: wording, formatting, minor presentation tweak
  - ❓ question: unclear intent, missing context, needs author clarification
- Focus: self-containment, executability, TODO atomicity/testability, scope/acceptance alignment, missing files/dependencies, contradictions, realistic sequencing, untestable verification, risks without mitigation, Complexity Check accuracy, masterplan ↔ sub-plan consistency, and ponytail complexity reduction. Do NOT perform pure micro prose edits unless they reduce scope, file count, or steps.
- Do not re-report a finding carried forward as a false positive while its recorded reason still holds; report it when the reason no longer applies or it appears elsewhere — note the changed premise.
```

## Review criteria

1. **Self-containment**: executable using only the plan plus a normal repo checkout.
2. **Executability**: every step can be done without guessing missing context.
3. **TODO atomicity/testability**: each TODO is one focused, testable action.
4. **Scope/acceptance alignment**: the plan matches the goal and acceptance.
5. **Missing files or dependencies**: the `files` key covers every path that needs to change.
6. **Contradictions**: sections do not contradict each other.
7. **Realistic sequencing**: dependencies and ordering are possible.
8. **Verifiable**: verification steps are concrete and runnable.
9. **Risk coverage**: risks are acknowledged or mitigated.
10. **Complexity Check accuracy**: counts and Proceed/Split decision are honest.
11. **Masterplan ↔ sub-plan consistency**: sub-plans repeat every fact they need from the masterplan.
12. **Ponytail complexity reduction**: the plan is as small as it can be while still correct.

## Triage

Follow `../snail-review/references/review-core.md`: subagent output is untrusted; the orchestrating agent labels each finding and acts on `valid` only. A pass with zero `valid` findings after triage is clean.

## Rules

- Read-only: do not edit the plan or any repo files.
- Single block: emit exactly one `### Plan Review Findings` block.
- Do not add new sections or rewrite the plan.
- Minor wording issues are not findings unless they mislead.

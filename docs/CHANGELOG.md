# Changelog

All notable user-facing changes to snail are documented in this file.

## [0.0.7] - 2026-11-05

### Added

- `snail-review-plan` and `snail-review-alternatives` now emit the `AI review. harness/model` disclosure header, and `snail-review-plan` gains the 📖 `read` tag.

### Changed

- All review skills share one protocol — `snail-review/references/review-core.md` covers the disclosure header, reviewer dispatch, triage, findings envelope, false-positive records, and loop rules (exit rule, stuck guard). The `snail-planning` and `snail-alternatives` review loops adopt false-positive carry-forward and the stuck guard, and `snail-alternatives` now explicitly dispatches its review to a `readonly` subagent.

### Fixed

- `snail-review-plan` and `snail-review-alternatives` keep working in a single-skill install: each inlines a minimum protocol fallback when `review-core.md` is absent.
- The Devin plugin manifest (`plugins/snail/.devin-plugin/plugin.json`) now matches the 0.0.7 release.

## [0.0.6] - 2026-11-02

### Added

- `snail-review`: readability is now an explicit clean-code criterion - magic values, packed conditions, and clever idioms a reader must stop to decode are reportable when a plainer equivalent exists. Findings are tagged 📖 `read` and counted in `totals` between ⚡ and 🔵.

## [0.0.5] - 2026-11-02

### Added

- `snail-review`: `argument-hint: [read-only|fix]` in the frontmatter, so invoking agents surface the two modes instead of defaulting silently to read-only.

## [0.0.4] - 2026-11-01

### Changed

- `snail-review`: fix mode now opens with the same three parallel reviewers as read-only mode, then loops single-reviewer re-reviews only while `valid` findings remain - one reviewer can miss what another catches.

## [0.0.3] - 2026-11-01

### Security

- Bump `js-yaml` to 4.3.2 and re-vendor the copies shipped inside `snail-flow`, `snail-implement`, and `snail-planning` (Dependabot alerts for prototype pollution).

## [0.0.2] - 2026-11-01

### Changed

- `snail-review`: PR comments are now explicitly kind and direct - critique the code, not the author; no scolding, no praise padding.
- `snail-review`: `valid` findings in the local report and `4 - REVIEW.yaml` are grouped by file for readability; the subagent contract keeps the flat `section:line` format.

## [0.0.1] - 2026-10-30

First release of snail.

### Added

- Skills for every phase of a change: `snail-explore`, `snail-alternatives`, `snail-planning`, `snail-implement`, `snail-review`, `snail-review-alternatives`, `snail-review-plan`, `snail-verify`, `snail-pr`, `snail-project-docs`, and `snail-ai-toolbelt`.
- An optional end-to-end workflow (`snail-flow`): explore -> alternatives -> plan -> build -> review -> verify -> PR, with stage gates and a receipt for every phase.
- Always-on editor rules: no comments in source code (refactor for clarity instead), and a kind, short, clear, concise conversation style (ASD-STE100).
- Works with Claude Code, Cursor, Devin, and any agent via `npx skills add`.

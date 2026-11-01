# Changelog

All notable user-facing changes to snail are documented in this file.

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

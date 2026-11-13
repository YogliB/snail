# Troubleshooting

## A snail skill does nothing in Claude Code

- Check the install: `ls ~/.claude/skills/snail-<name>/SKILL.md` (single skill) or reinstall the plugin.
- Restart Claude Code after installing.
- Use the exact name: `/snail:snail-planning` from the plugin, `/snail-planning` for a single-skill install.

## Cursor ignores the rules

- Rules ship inside the plugin — check `~/.cursor/plugins/local/snail/rules/` exists, then reload the window.
- Cursor only loads plugin rules for the workspace the plugin is enabled in.

## Review or PR skills miss context

- They expect `<flow-root>/snail-<slug>/` with a `runbook.yaml` and a `2 - PLANNING.yaml`. Missing either? They note it under `Known validation gaps` and keep going.

## Node errors

- `node: command not found` or `Node 24+ (current LTS) is required` — the gates and toolkit scripts need Node 24+. Install the current LTS from https://nodejs.org/ and re-run. Nothing else is needed: the YAML parser is vendored inside each skill.

## Existing repo-local flows

Old versions stored flows under `.agents/flows/` (and used `sk-<slug>` before the rename). New runs default to the XDG state directory printed by `node <installed-skill>/scripts/artifact-path.mjs`. Old files and git ignore rules are left untouched. Ask explicitly to resume an old flow in place or move it before continuing; an existing folder does not opt a new task into repo-local storage.

## Artifact root errors

Unset, empty and relative `XDG_STATE_HOME` values use `~/.local/state`. An absolute value inside the project (including a symlink into it) is rejected: choose an external state directory, or explicitly request repo-local output. If the external directory is unwritable, fix its permissions; do not silently fall back to the checkout.

## Runbook errors

Create state only via `node skills/snail-flow/scripts/flow-state.mjs`:

- `runbook missing ...` — `init <dir> --slug=<slug> --goal=<goal>`, then `check`. A legacy `runbook`, `runbook.json` or `RUNBOOK.md` means the flow predates this version — finish it on the old plugin or start fresh.
- `advance: <file> is missing` — write the phase artifact first.
- `advance: row <r> requires --<flag>` — the phase's required flags weren't given; the error names them.
- `status: error` on `check` — state contradicts the contract (missing or unexpected artifacts, bad flags). Repair with `set`/`note`; `set <dir> at=<row>` reopens a row — delete stale later artifacts too.
- `advance: flow is blocked` — someone marked it. Resume with `set <dir> status=in-progress`.

## Plan review never converges

Shrink the plan, or split it into a masterplan plus sub-plans.

## Review finds the plan itself is wrong

Back to planning: revise `2 - PLANNING.yaml`, re-run the mandatory internal review in `snail-planning`, re-implement. Don't patch code against a bad plan.

## The agent diverged from a skill

Record why with `flow-state.mjs note <dir> <reason>`, then return to the phase that drifted (`set <dir> at=<row>` if it already passed).

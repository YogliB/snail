<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/snail-banner-dark-2560.png">
    <img alt="snail: Slow down. Ship right." src="assets/snail-banner-light-2560.png" width="640">
  </picture>
</div>

# snail 🐌

Reusable agent skills and an optional stage-gated workflow for Claude, Cursor, and Devin. It carries state between phases and leaves a trail — every gate is a small Node script, every phase leaves a receipt. I built this to stop repeating myself to every agent. Take it, break it, and rebuild it into something that fits your own chaos.

## What you get

- **Skills** — single-purpose prompts like `snail-explore`, `snail-planning`, `snail-implement`, `snail-review-plan`, `snail-review`, and `snail-pr`.
- **Slash commands** — in Claude Code, type `/snail-explore`, `/snail-planning`, `/snail-implement`, `/snail-review`, `/snail-pr`, or `/snail-flow` to invoke the matching skill.
- **A workflow** — optional full flow: explore → alternatives → plan → build → review → verify → PR.
- **Rules** — editor-specific conventions for Claude and Cursor.

Flow state, phase artifacts and receipts are YAML. No magic binaries, no cloud services, no tracking. Every gate script needs only Node 24+ (current LTS; git optional) — the YAML parser is vendored inside each skill, so installs never run npm or touch the network.

## Quick start

Pick your agent:

```bash
# Claude Code - plugin with /snail-* slash commands
claude plugin marketplace add YogliB/snail
claude plugin install snail@snail
# + rules into ~/.claude (one-time): node scripts/install-claude-rules.mjs

# Devin - plugin with /snail:* commands
devin plugins install YogliB/snail#plugins/snail

# Any agent - skills only, global
npx skills add YogliB/snail -g

# Cursor - local plugin (skills + rules)
npx degit YogliB/snail /tmp/snail && node /tmp/snail/scripts/install.mjs
```

`scripts/install.mjs` copies the plugin into `~/.cursor/plugins/local/snail`; reload the window to load it.

Want just one skill? `npx skills add YogliB/snail --skill snail-planning` — it works standalone, no plugin needed.

To remove: `npx skills remove snail-planning`, or each agent's own uninstall (`claude plugin uninstall snail@snail`, `devin plugins remove snail`, `node /tmp/snail/scripts/uninstall.mjs` for Cursor).

## Use it

### In Claude Code

Plugin skills are namespaced. Type the command at the start of a prompt:

```text
/snail:snail-explore add-auth-token
/snail:snail-alternatives for caching API responses
/snail:snail-planning add-auth-token
/snail:snail-review
/snail:snail-pr
/snail:snail-flow auto
```

Installed a skill individually with `npx skills add`? Drop the `/snail:` prefix (`/snail-planning`).

| Slash command                  | What it does                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `/snail:snail-explore <slug>`  | Gather context and write `0 - EXPLORE.yaml` to `<flow-root>/snail-<slug>/`.          |
| `/snail:snail-alternatives`    | Generate and review options, then write `1 - ALTERNATIVES.yaml`.                     |
| `/snail:snail-planning <slug>` | Write an executable `2 - PLANNING.yaml`.                                             |
| `/snail:snail-implement`       | Execute an approved plan, writing `3 - IMPLEMENTATION.yaml`.                         |
| `/snail:snail-review`          | Review the current diff (add "fix" to fix).                                          |
| `/snail:snail-pr`              | Create or update a GitHub PR.                                                        |
| `/snail:snail-flow [mode]`     | Run the whole workflow. `auto` skips confirmations; `manual` asks before each phase. |

### In Devin

Install the plugin, then prefix the skill name with `/snail:`:

```bash
devin plugins install YogliB/snail#plugins/snail
```

```text
/snail:snail-planning add-auth-token
/snail:snail-implement
/snail:snail-flow auto
```

### In any editor

Name the skill directly:

```text
Use the snail-planning skill to write a plan for pagination.
Use the snail-review-plan skill to review the plan.
Use the snail-implement skill to implement the plan.
Use the snail-review skill on the current diff (say "fix" for fix mode).
Use the snail-pr skill to open a pull request.
```

## The flow

```text
snail-explore → snail-alternatives → snail-planning → snail-implement → snail-review (fix mode) → snail-verify → snail-pr
```

Each phase writes a numbered YAML artifact into `<flow-root>/snail-<slug>/`, so you can pause, resume, or hand the work to another agent without losing context.

## Artifact storage

`node <installed-skill>/scripts/artifact-path.mjs` prints the project-specific artifact root. It uses `$XDG_STATE_HOME/snail/<project>-<id8>`, falling back to `~/.local/state/snail/<project>-<id8>`. Relative XDG values are ignored. The directory combines the project folder name with the first eight hex characters of its canonical-path hash; a small `.project-path` marker verifies identity and the hash grows only on a collision. Resolving the root creates that state directory, never a repo directory. Identity is based on the canonical checkout path: subdirectories and symlinks share a root, while different checkouts and worktrees stay separate. Outside git, the current directory identifies the project. Run all gates and verification commands from that project, passing the absolute flow directory.

Only an explicit request from the user enables `--in-repo`, which resolves to `.agents/flows`. Existing repo artifacts are never automatically moved, deleted, resumed, or treated as opt-in. For an old flow, explicitly choose whether to resume it in place or move it; the normal default starts outside the repo. An unwritable external directory is an error, not a reason to write into the repo.

The storage rule covers snail workflow byproducts. Requested project deliverables such as README files remain in the project, and review-plan/review-alternatives return findings to their caller rather than choosing a separate output path.

## Caveats

- **Slash commands work in Claude Code and Devin.** In Devin they come from the plugin and are namespaced (`/snail:snail-*`). Cursor can use the skill names.
- **Generated artifacts stay outside your repository.** Plans, reports, runbooks and receipts use the XDG state directory by default. Repo-local output requires an explicit user request.
- **Skills are modular.** Nothing forces the full flow. Pick one skill and ignore the rest.
- **Rules ship inside the Cursor and Devin plugins** from the shared `rules/` directory. Claude Code plugins have no rules channel — `scripts/install-claude-rules.mjs` copies the rules into `~/.claude/snail/` and `@`-imports them from `~/.claude/CLAUDE.md`, which also reaches subagent context.

## More

- [docs/USAGE.md](docs/USAGE.md) — install options, the full workflow, and advanced usage.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how the pieces fit together.
- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) — if you want to hack on this.
- [docs/CHANGELOG.md](docs/CHANGELOG.md) — release notes.

## License

MIT. Steal with attribution.

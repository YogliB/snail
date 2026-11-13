import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { artifactRoot } from '../scripts/artifact-path.mjs';
import { REPO_ROOT, tmpdir_, gitInit, git, run } from './helpers.mjs';
import yaml from '../skills/snail-flow/scripts/vendor/js-yaml.mjs';

// Artifact resolution leaves the checkout untouched and preserves project identity.
test('XDG defaults, overrides, aliases, distinct checkouts, worktrees and explicit repo opt-in', (t) => {
	const tmp = tmpdir_(t);
	const repo = join(tmp, 'repo');
	const home = join(tmp, 'home');
	mkdirSync(repo);
	gitInit(repo);
	git(repo, ['commit', '-qm', 'initial', '--allow-empty']);
	const cwd = repo;
	const defaults = artifactRoot({ cwd, home, env: {} });
	assert.ok(defaults.startsWith(join(home, '.local/state/snail/')));
	for (const value of ['', 'relative/path']) {
		assert.equal(artifactRoot({ cwd, home, env: { XDG_STATE_HOME: value } }), defaults);
	}
	const state = join(tmp, 'state with spaces');
	const custom = artifactRoot({ cwd, home, env: { XDG_STATE_HOME: state } });
	assert.ok(custom.startsWith(join(state, 'snail/')));
	mkdirSync(join(repo, 'sub'));
	assert.equal(artifactRoot({ cwd: join(repo, 'sub'), home, env: {} }), defaults);
	symlinkSync(repo, join(tmp, 'alias'));
	assert.equal(artifactRoot({ cwd: join(tmp, 'alias'), home, env: {} }), defaults);
	const other = join(tmp, 'other', 'repo');
	mkdirSync(other, { recursive: true });
	gitInit(other);
	assert.notEqual(artifactRoot({ cwd: other, home, env: {} }), defaults);
	git(repo, ['worktree', 'add', '-qb', 'test-worktree', join(tmp, 'worktree')]);
	assert.notEqual(artifactRoot({ cwd: join(tmp, 'worktree'), home, env: {} }), defaults);
	assert.equal(artifactRoot({ cwd, inRepo: true }), join(repo, '.agents/flows'));
	assert.throws(
		() => artifactRoot({ cwd, env: { XDG_STATE_HOME: join(repo, 'state') } }),
		/inside the project/,
	);
	symlinkSync(repo, join(tmp, 'state-link'));
	assert.throws(
		() => artifactRoot({ cwd, env: { XDG_STATE_HOME: join(tmp, 'state-link') } }),
		/inside the project/,
	);
	assert.equal(existsSync(join(repo, '.agents')), false);
	assert.equal(readFileSync(join(defaults, '.project-path'), 'utf8'), resolve(repo));
	assert.equal(git(repo, ['status', '--porcelain']), '');
});

// External flow gates and receipts still bind verification to the project checkout.
test('external flow, receipt HEAD check and stale warning use the project, not the artifact directory', (t) => {
	const tmp = tmpdir_(t);
	const repo = join(tmp, 'repo');
	mkdirSync(repo);
	gitInit(repo);
	git(repo, ['commit', '-qm', 'initial', '--allow-empty']);
	const env = { ...process.env, XDG_STATE_HOME: join(tmp, 'state') };
	const root = run(join(REPO_ROOT, 'scripts/artifact-path.mjs'), [], { cwd: repo, env });
	assert.equal(root.status, 0, root.stderr);
	const dir = join(root.stdout.trim(), 'snail-demo');
	const flow = join(REPO_ROOT, 'skills/snail-flow/scripts/flow-state.mjs');
	const runner = join(REPO_ROOT, 'skills/snail-implement/scripts/run-with-receipt.mjs');
	const checker = join(REPO_ROOT, 'skills/snail-implement/scripts/check-receipt.mjs');
	const init = run(flow, ['init', dir, '--slug=demo', '--goal=test', '--size=light'], {
		cwd: repo,
	});
	assert.equal(init.status, 0, init.stderr);
	assert.equal(
		yaml.load(readFileSync(join(dir, 'runbook.yaml'), 'utf8'))['project-root'],
		resolve(repo),
	);
	writeFileSync(join(dir, '2 - PLANNING.yaml'), 'goal: test\n');
	assert.equal(run(flow, ['advance', dir, '--decision=proceed'], { cwd: repo }).status, 0);
	writeFileSync(join(dir, '3 - IMPLEMENTATION.yaml'), 'goal: test\n');
	assert.equal(
		run(
			runner,
			[join(dir, 'receipts'), 'test', '--', process.execPath, '-e', 'process.exit(0)'],
			{ cwd: repo },
		).status,
		0,
	);
	const receipt = join(dir, 'receipts', readdirSync(join(dir, 'receipts'))[0]);
	assert.equal(run(checker, [receipt, '--head'], { cwd: tmp }).status, 0);
	git(repo, ['commit', '-qm', 'new head', '--allow-empty']);
	assert.notEqual(run(checker, [receipt, '--head'], { cwd: tmp }).status, 0);
	const advanced = run(
		flow,
		['advance', dir, `--receipts=receipts/${readdirSync(join(dir, 'receipts'))[0]}`],
		{ cwd: repo },
	);
	assert.equal(advanced.status, 0, advanced.stderr);
	assert.match(advanced.stderr, /1 commit\(s\) behind current HEAD/);
	assert.equal(existsSync(join(repo, '.agents')), false);
	assert.equal(git(repo, ['status', '--porcelain']), '');
});

// Every independently installed skill gets the same dependency-free resolver.
test('artifact helper is bundled in standalone skills and synced plugin copies', () => {
	const source = readFileSync(join(REPO_ROOT, 'scripts/artifact-path.mjs'), 'utf8');
	for (const skill of readdirSync(join(REPO_ROOT, 'skills')).filter((name) =>
		readFileSync(join(REPO_ROOT, 'skills', name, 'SKILL.md'), 'utf8').includes(
			'scripts/artifact-path.mjs',
		),
	)) {
		for (const prefix of ['', 'plugins/snail/']) {
			assert.equal(
				readFileSync(
					join(REPO_ROOT, prefix, `skills/${skill}/scripts/artifact-path.mjs`),
					'utf8',
				),
				source,
			);
		}
	}
});

// Old repo outputs neither opt in nor get migrated by default standalone use.
test('standalone resolver writes externally, preserves old outputs and rejects invalid CLI flags', (t) => {
	const tmp = tmpdir_(t);
	const repo = join(tmp, 'repo');
	mkdirSync(repo);
	gitInit(repo);
	const old = join(repo, '.agents/flows/snail-old');
	mkdirSync(old, { recursive: true });
	writeFileSync(join(old, 'runbook.yaml'), 'preserve exactly\n');
	const env = { ...process.env, XDG_STATE_HOME: join(tmp, 'state') };
	const script = join(REPO_ROOT, 'skills/snail-review/scripts/artifact-path.mjs');
	const result = run(script, [], { cwd: repo, env });
	assert.equal(result.status, 0, result.stderr);
	const dir = join(result.stdout.trim(), 'snail-review');
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, '4 - REVIEW.yaml'), 'findings: []\n');
	assert.ok(existsSync(join(dir, '4 - REVIEW.yaml')));
	assert.equal(existsSync(join(repo, '.agents/flows/snail-review')), false);
	assert.equal(readFileSync(join(old, 'runbook.yaml'), 'utf8'), 'preserve exactly\n');
	assert.equal(
		run(script, ['--in-repo'], { cwd: repo, env }).stdout.trim(),
		join(repo, '.agents/flows'),
	);
	assert.equal(run(script, ['--unknown'], { cwd: repo, env }).status, 2);
});

// Old external bundles cannot silently lose the stale-check diagnostic.
test('external legacy runbook warns when no source checkout can be resolved', (t) => {
	const tmp = tmpdir_(t);
	const repo = join(tmp, 'repo');
	mkdirSync(repo);
	gitInit(repo);
	git(repo, ['commit', '-qm', 'initial', '--allow-empty']);
	const flow = join(REPO_ROOT, 'skills/snail-flow/scripts/flow-state.mjs');
	const runner = join(REPO_ROOT, 'skills/snail-implement/scripts/run-with-receipt.mjs');
	const dir = join(tmp, 'external', 'snail-test');
	assert.equal(
		run(flow, ['init', dir, '--slug=test', '--goal=test', '--size=light'], { cwd: repo })
			.status,
		0,
	);
	const rbpath = join(dir, 'runbook.yaml');
	const rb = yaml.load(readFileSync(rbpath, 'utf8'));
	delete rb['project-root'];
	writeFileSync(rbpath, yaml.dump(rb));
	writeFileSync(join(dir, '2 - PLANNING.yaml'), 'goal: test\n');
	assert.equal(run(flow, ['advance', dir, '--decision=proceed'], { cwd: repo }).status, 0);
	writeFileSync(join(dir, '3 - IMPLEMENTATION.yaml'), 'goal: test\n');
	assert.equal(
		run(
			runner,
			[join(dir, 'receipts'), 'legacy', '--', process.execPath, '-e', 'process.exit(0)'],
			{ cwd: repo },
		).status,
		0,
	);
	const file = readdirSync(join(dir, 'receipts'))[0];
	const advanced = run(flow, ['advance', dir, `--receipts=receipts/${file}`], { cwd: repo });
	assert.equal(advanced.status, 0, advanced.stderr);
	assert.match(advanced.stderr, /cannot resolve git HEAD.*stale receipt check skipped/);
});

// A colliding short ID never reuses another project's directory.
test('readable flat root extends its ID on collision and keeps both projects intact', (t) => {
	const tmp = tmpdir_(t);
	const repo = join(tmp, 'my-app');
	mkdirSync(repo);
	gitInit(repo);
	const state = join(tmp, 'state');
	const id = createHash('sha256').update(resolve(repo)).digest('hex');
	const occupied = join(state, 'snail', `my-app-${id.slice(0, 8)}`);
	mkdirSync(occupied, { recursive: true });
	writeFileSync(join(occupied, '.project-path'), '/another/project');
	writeFileSync(join(occupied, 'keep'), 'unchanged');
	const root = artifactRoot({ cwd: repo, env: { XDG_STATE_HOME: state } });
	assert.equal(root, join(state, 'snail', `my-app-${id.slice(0, 12)}`));
	assert.equal(readFileSync(join(root, '.project-path'), 'utf8'), resolve(repo));
	assert.equal(readFileSync(join(occupied, 'keep'), 'utf8'), 'unchanged');
	assert.equal(artifactRoot({ cwd: repo, env: { XDG_STATE_HOME: state } }), root);
	assert.deepEqual(readdirSync(root), ['.project-path']);
});

// Concurrent resolution must publish one complete project marker, not partial state.
test('concurrent standalone resolvers select one root and leave no temporary markers', async (t) => {
	const tmp = tmpdir_(t);
	const repo = join(tmp, 'app');
	mkdirSync(repo);
	gitInit(repo);
	const env = { ...process.env, XDG_STATE_HOME: join(tmp, 'state') };
	const exec = promisify(execFile);
	const results = await Promise.all(
		Array.from({ length: 8 }, () =>
			exec(process.execPath, [join(REPO_ROOT, 'scripts/artifact-path.mjs')], {
				cwd: repo,
				env,
			}),
		),
	);
	const roots = new Set(results.map(({ stdout }) => stdout.trim()));
	assert.equal(roots.size, 1);
	const root = [...roots][0];
	assert.deepEqual(readdirSync(root), ['.project-path']);
	assert.equal(readFileSync(join(root, '.project-path'), 'utf8'), resolve(repo));
});

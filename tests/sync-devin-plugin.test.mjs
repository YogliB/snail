/** sync-devin-plugin tests: plugins/snail mirrors skills/ and rules/. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT, tmpdir_, run, git, gitInit } from './helpers.mjs';

const SYNC = join(REPO_ROOT, 'scripts/sync-devin-plugin.mjs');

function setup(t) {
	const tmp = tmpdir_(t);
	gitInit(tmp);
	mkdirSync(join(tmp, 'skills/snail-demo'), { recursive: true });
	mkdirSync(join(tmp, 'rules'));
	mkdirSync(join(tmp, 'scripts'));
	copyFileSync(
		join(REPO_ROOT, 'scripts/artifact-path.mjs'),
		join(tmp, 'scripts/artifact-path.mjs'),
	);
	writeFileSync(join(tmp, 'skills/snail-demo/SKILL.md'), '# demo skill\n');
	writeFileSync(join(tmp, 'rules/demo.md'), 'demo rule\n');
	return tmp;
}

test('sync then --check agrees; edits, deletions and strays are caught', (t) => {
	const tmp = setup(t);
	assert.equal(run(SYNC, [], { cwd: tmp }).status, 0);
	assert.equal(
		run(SYNC, ['--check'], { cwd: tmp }).status,
		0,
		'--check fails on freshly synced copies',
	);
	git(tmp, ['add', '-A']);
	git(tmp, ['commit', '-qm', 'init']);

	for (const path of ['skills/snail-demo/SKILL.md', 'rules/demo.md']) {
		git(tmp, ['checkout', '-q', '--', '.']);
		writeFileSync(join(tmp, path), 'edited\n');
		assert.notEqual(
			run(SYNC, ['--check'], { cwd: tmp }).status,
			0,
			`--check misses drift in ${path}`,
		);
	}

	git(tmp, ['checkout', '-q', '--', '.']);
	rmSync(join(tmp, 'skills/snail-demo/SKILL.md'));
	assert.notEqual(
		run(SYNC, ['--check'], { cwd: tmp }).status,
		0,
		'--check misses a deleted canonical file',
	);

	git(tmp, ['checkout', '-q', '--', '.']);
	writeFileSync(join(tmp, 'plugins/snail/rules/stray.md'), 'stray\n');
	assert.notEqual(
		run(SYNC, ['--check'], { cwd: tmp }).status,
		0,
		'--check misses a stray plugin file',
	);
});

test('re-sync picks up edits and new skills', (t) => {
	const tmp = setup(t);
	run(SYNC, [], { cwd: tmp });
	writeFileSync(join(tmp, 'rules/demo.md'), 'edited rule\n');
	mkdirSync(join(tmp, 'skills/snail-new'));
	writeFileSync(join(tmp, 'skills/snail-new/SKILL.md'), '# new skill\n');
	assert.equal(run(SYNC, [], { cwd: tmp }).status, 0);
	assert.equal(readFileSync(join(tmp, 'plugins/snail/rules/demo.md'), 'utf8'), 'edited rule\n');
	assert.equal(
		readFileSync(join(tmp, 'plugins/snail/skills/snail-new/SKILL.md'), 'utf8'),
		'# new skill\n',
	);
	assert.equal(run(SYNC, ['--check'], { cwd: tmp }).status, 0);
});

test('the real repo plugin is in sync', () => {
	assert.equal(
		run(SYNC, ['--check'], { cwd: REPO_ROOT }).status,
		0,
		'plugins/snail is out of sync; run node scripts/sync-devin-plugin.mjs',
	);
});

// New artifact-producing skills are discovered from their resolver contract.
test('sync discovers a new artifact consumer and detects resolver drift', (t) => {
	const tmp = setup(t);
	mkdirSync(join(tmp, 'skills/snail-future'));
	writeFileSync(join(tmp, 'skills/snail-future/SKILL.md'), 'Use scripts/artifact-path.mjs\n');
	assert.equal(run(SYNC, [], { cwd: tmp }).status, 0);
	const helper = join(tmp, 'skills/snail-future/scripts/artifact-path.mjs');
	assert.equal(
		readFileSync(helper, 'utf8'),
		readFileSync(join(REPO_ROOT, 'scripts/artifact-path.mjs'), 'utf8'),
	);
	writeFileSync(helper, 'drift\n');
	assert.notEqual(run(SYNC, ['--check'], { cwd: tmp }).status, 0);
});

/** vendor-js-yaml tests: every shipped skill carries the same js-yaml build. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT, run, tmpdir_, gitInit } from './helpers.mjs';

test('all vendor copies match node_modules/js-yaml', () => {
	const r = run(REPO_ROOT + '/scripts/vendor-js-yaml.mjs', ['--check'], { cwd: REPO_ROOT });
	assert.equal(r.status, 0, `${r.stderr}; run node scripts/vendor-js-yaml.mjs`);
});

// A new YAML consumer must be checked even before its vendor directory exists.
test('new YAML consumer is detected and populated without a pre-existing vendor directory', (t) => {
	const tmp = tmpdir_(t);
	gitInit(tmp);
	mkdirSync(join(tmp, 'skills/snail-new/scripts'), { recursive: true });
	writeFileSync(
		join(tmp, 'skills/snail-new/scripts/use.mjs'),
		"import yaml from './vendor/js-yaml.mjs';\n",
	);
	mkdirSync(join(tmp, 'node_modules/js-yaml/dist'), { recursive: true });
	writeFileSync(join(tmp, 'node_modules/js-yaml/dist/js-yaml.mjs'), 'export default {};\n');
	const script = join(REPO_ROOT, 'scripts/vendor-js-yaml.mjs');
	assert.notEqual(run(script, ['--check'], { cwd: tmp }).status, 0);
	assert.equal(run(script, [], { cwd: tmp }).status, 0);
	assert.equal(
		readFileSync(join(tmp, 'skills/snail-new/scripts/vendor/js-yaml.mjs'), 'utf8'),
		'export default {};\n',
	);
	assert.equal(run(script, ['--check'], { cwd: tmp }).status, 0);
});

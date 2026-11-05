/** review-core fallback drift tests. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './helpers.mjs';

const CORE = join(REPO_ROOT, 'skills/snail-review/references/review-core.md');
const SKILLS = ['snail-review-plan', 'snail-review-alternatives'];

function readSkill(name) {
	return readFileSync(join(REPO_ROOT, 'skills', name, 'SKILL.md'), 'utf8');
}

function fallbackOf(text) {
	const m = text.match(/apply its minimum: ([^\n]+)/);
	assert.ok(m, 'skill has no single-skill fallback paragraph');
	return m[1];
}

test('fallback text is identical across dependent skills', () => {
	const fallbacks = SKILLS.map((s) => fallbackOf(readSkill(s)));
	for (const fb of fallbacks) assert.equal(fb, fallbacks[0]);
});

test('fallback triage labels match the core', () => {
	const core = readFileSync(CORE, 'utf8');
	for (const label of ['`valid`', '`false_positive`', '`unvalidated`']) {
		assert.ok(core.includes(label), `core missing triage label ${label}`);
	}
	const fb = fallbackOf(readSkill(SKILLS[0]));
	for (const label of ['`valid`', '`false_positive`', '`unvalidated`']) {
		assert.ok(fb.includes(label), `fallback missing triage label ${label}`);
	}
});

test('fallback record shape matches the core', () => {
	const core = readFileSync(CORE, 'utf8');
	const fb = fallbackOf(readSkill(SKILLS[0]));
	const coreShape = core.match(/`(<location> \| <tag> \| [^`]+)`/);
	assert.ok(coreShape, 'core has no false-positive record shape');
	assert.ok(
		fb.includes(coreShape[1]),
		`fallback record shape differs from core: ${coreShape[1]}`,
	);
});

test('fallback exit and stuck rules match the core', () => {
	const core = readFileSync(CORE, 'utf8');
	const fb = fallbackOf(readSkill(SKILLS[0]));
	assert.ok(fb.includes('zero `valid` findings'), 'fallback missing exit rule');
	assert.ok(fb.includes('3 fix passes'), 'fallback missing stuck guard');
	assert.ok(core.includes('zero `valid` findings'), 'core missing exit rule');
	assert.ok(core.includes('3 fix passes'), 'core missing stuck guard');
});

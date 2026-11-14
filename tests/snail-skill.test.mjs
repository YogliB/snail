/** snail single-skill: static contract checks (frontmatter, modes, guards, sync). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './helpers.mjs';

const skill = readFileSync(join(REPO_ROOT, 'skills/snail/SKILL.md'), 'utf8');

test('snail skill frontmatter and modes', () => {
	assert.match(skill, /^---\nname: snail\n/);
	assert.match(skill, /description: .{20,}/);
	for (const mode of [
		'QNA',
		'INV',
		'EXPLORE',
		'ALT',
		'PLN',
		'EXC',
		'REV',
		'VERIFY',
		'SHIP',
		'SIM',
	]) {
		assert.match(skill, new RegExp(`## ${mode} —`), `missing mode ${mode}`);
	}
});

test('snail skill guards', () => {
	assert.match(skill, /no code or file edits outside EXC/i);
	assert.match(skill, /zero comments/);
	assert.match(skill, /never merge/);
	assert.match(skill, /never commit or push to the default branch/);
	assert.match(skill, /SHIP only after a PASS/);
	assert.match(skill, /EXC starts only after the user explicitly approves/);
	assert.match(skill, /except fixes during REV/);
	assert.match(skill, /in manual, run ALT and follow the usual stops/);
	assert.match(skill, /never guess a verification method/);
	assert.match(skill, /Never declare PASS without observed feature behavior/);
	assert.match(skill, /blocked on verification clarity/);
});

test('snail skill devin copy is in sync', () => {
	const copy = readFileSync(join(REPO_ROOT, 'plugins/snail/skills/snail/SKILL.md'), 'utf8');
	assert.equal(copy, skill);
});

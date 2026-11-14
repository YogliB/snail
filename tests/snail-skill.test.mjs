import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './helpers.mjs';

const directory = join(REPO_ROOT, 'skills/snail');
const skill = readFileSync(join(directory, 'SKILL.md'), 'utf8');
const references = readdirSync(join(directory, 'references')).sort();
const stage = (name) => readFileSync(join(directory, 'references', `${name}.md`), 'utf8');

test('snail keeps routing and universal authority rules in the core', () => {
	assert.match(skill, /^---\nname: snail\n/);
	assert.match(skill, /description: .{20,}/);
	for (const name of [
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
		assert.match(skill, new RegExp(`\\*\\*${name}:\\*\\*`));
	}
	for (const rule of [
		/Manual is default/,
		/Auto requires an explicit request/,
		/Questions never approve edits/,
		/EXC needs explicit build approval/,
		/No code or file edits outside EXC/,
		/except requested REV fixes/,
		/Zero code comments/,
		/Missing critical input still stops auto/,
		/Never merge or commit\/push to the default branch/,
		/SHIP only after VERIFY PASS/,
		/No real messages, posts, purchases or bookings without explicit approval/,
		/Canceled\/unavailable\/unanswered questions leave the stage blocked/,
		/never guess/,
		/Tests or receipts alone cannot yield PASS/,
		/project's docs, agent docs or a project skill, not workflow notes/,
		/Write only after approval/,
		/numbered questions with recommended answers/,
		/One "yes" accepts all/,
	])
		assert.match(skill, rule);
});

test('snail loads only the active heavier stage from an installed relative path', () => {
	assert.match(skill, /read that file only when entering the stage/);
	assert.match(skill, /Paths are relative to this skill/);
	assert.match(skill, /If a required reference cannot be read, stop and report it/);
	for (const route of ['review → REV', 'verify → VERIFY', 'PR → SHIP', 'simplify → SIM'])
		assert.ok(skill.includes(route));
	const links = [
		...new Set([...skill.matchAll(/`(references\/[^`]+)`/g)].map((match) => match[1])),
	];
	assert.deepEqual(
		links.sort(),
		references.map((name) => `references/${name}`),
	);
	assert.deepEqual(references, ['exc.md', 'pln.md', 'rev.md', 'ship.md', 'verify.md']);
	for (const link of links) assert.ok(readFileSync(join(directory, link), 'utf8').trim());
});

test('snail stage references preserve execution review verification and PR guards', () => {
	assert.match(stage('pln'), /feature-level verification method/);
	assert.match(stage('pln'), /Unclear verification means the plan is not ready/);
	assert.match(stage('exc'), /Never commit\/push to default/);
	assert.match(stage('exc'), /Run planned checks after each step/);
	assert.match(stage('exc'), /following manual stops/);
	assert.match(stage('rev'), /Read-only: report findings and stop/);
	assert.match(
		stage('rev'),
		/Only if fixes were requested or in auto: fix every finding and re-review/,
	);
	assert.match(stage('rev'), /same finding survives 3 passes/);
	assert.match(stage('verify'), /PASS needs observed feature behavior/);
	assert.match(stage('verify'), /never auto-fix/);
	assert.match(
		stage('verify'),
		/No real messages, posts, purchases or bookings without explicit approval/,
	);
	assert.match(stage('ship'), /only after VERIFY PASS/);
	assert.match(stage('ship'), /Never merge\/push to default/);
});

test('snail core and all conditional references ship in the Devin copy', () => {
	for (const path of ['SKILL.md', ...references.map((name) => `references/${name}`)]) {
		assert.equal(
			readFileSync(join(REPO_ROOT, 'plugins/snail/skills/snail', path), 'utf8'),
			readFileSync(join(directory, path), 'utf8'),
		);
	}
});

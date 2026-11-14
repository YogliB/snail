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
		'investigate',
		'options',
		'design',
		'plan',
		'implement',
		'review',
		'verify',
		'ship',
		'simplify',
	]) {
		assert.match(skill, new RegExp(`\\*\\*${name}:\\*\\*`));
	}
	assert.doesNotMatch(skill, /\b(QNA|INV|EXPLORE|ALT|PLN|EXC|REV|VERIFY|SHIP|SIM)\b/);
	for (const rule of [
		/Manual is default/,
		/Auto requires an explicit request/,
		/questions never approve edits/,
		/implement needs explicit build approval/,
		/No code or file edits outside implement/,
		/except requested review fixes/,
		/and the design documents the project asks for/,
		/Zero code comments/,
		/Missing critical input still stops auto/,
		/Never merge or commit\/push to the default branch/,
		/Ship only after verify PASS/,
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

test('snail options stage judges whether design is needed', () => {
	assert.match(skill, /Judge whether the work needs design/);
	assert.match(skill, /solution structure, interfaces, data flow or failure behavior/);
	assert.match(skill, /when it does not, go straight to plan/);
	assert.match(skill, /user can always ask for design/);
	assert.match(skill, /Enter only when options called for it or the user asked/);
});

test('snail loads only the active heavier stage from an installed relative path', () => {
	assert.match(skill, /read that file only when entering the stage/);
	assert.match(skill, /Paths are relative to this skill/);
	assert.match(skill, /If a required reference cannot be read, stop and report it/);
	const links = [
		...new Set([...skill.matchAll(/`(references\/[^`]+)`/g)].map((match) => match[1])),
	];
	assert.deepEqual(
		links.sort(),
		references.map((name) => `references/${name}`),
	);
	assert.deepEqual(references, [
		'design.md',
		'implement.md',
		'plan.md',
		'review.md',
		'ship.md',
		'verify.md',
	]);
	for (const link of links) assert.ok(readFileSync(join(directory, link), 'utf8').trim());
});

test('snail stage references preserve execution review verification and PR guards', () => {
	assert.match(stage('plan'), /feature-level verification method/);
	assert.match(stage('plan'), /Unclear verification means the plan is not ready/);
	assert.match(stage('plan'), /following the approved design when one exists/);
	assert.match(stage('implement'), /Never commit\/push to default/);
	assert.match(stage('implement'), /Run planned checks after each step/);
	assert.match(stage('implement'), /following manual stops/);
	assert.match(stage('review'), /Read-only: report findings and stop/);
	assert.match(
		stage('review'),
		/Only if fixes were requested or in auto: fix every finding and re-review/,
	);
	assert.match(stage('review'), /same finding survives 3 passes/);
	assert.match(stage('verify'), /PASS needs observed feature behavior/);
	assert.match(stage('verify'), /never auto-fix/);
	assert.match(
		stage('verify'),
		/Fixes after a FAIL happen in implement with explicit build approval/,
	);
	assert.match(stage('verify'), /the delta goes back through review, then verify runs again/);
	assert.match(
		stage('verify'),
		/No real messages, posts, purchases or bookings without explicit approval/,
	);
	assert.match(stage('ship'), /only after verify PASS/);
	assert.match(stage('ship'), /Never merge\/push to default/);
	assert.match(stage('design'), /solution structure, interfaces, data flow and failure behavior/);
	assert.match(stage('design'), /These requested documents are the only files this stage writes/);
	assert.match(stage('design'), /template files alone are not a request/);
	assert.match(stage('design'), /\$XDG_STATE_HOME\/snail\/templates/);
	assert.match(stage('design'), /built-in templates under `templates\/`/);
	for (const name of ['design.md', 'test-plan.md', 'security-privacy.md']) {
		assert.ok(readFileSync(join(directory, 'templates', name), 'utf8').trim());
	}
	assert.match(stage('design'), /documented project convention/);
	assert.match(stage('design'), /trust boundaries, permissions, sensitive data and abuse cases/);
	assert.match(stage('design'), /which automated tests to write/);
	assert.match(stage('design'), /not a substitute for tests/);
	assert.match(
		stage('design'),
		/details live in the resolved template, never a fixed universal list/,
	);
	assert.match(stage('design'), /shape the design before it is approved/);
	assert.match(stage('review'), /check the work against them too/);
	assert.match(stage('verify'), /report every step's result/);
	assert.match(stage('verify'), /report the remaining steps as not run/);
	assert.match(stage('review'), /the project picks the tool, snail requires none/);
	assert.match(skill, /For a defect, reproduce it and rank likely root causes and next steps/);
});

test('snail core and all conditional references ship in the Devin copy', () => {
	for (const path of [
		'SKILL.md',
		...references.map((name) => `references/${name}`),
		...['design.md', 'test-plan.md', 'security-privacy.md'].map((name) => `templates/${name}`),
	]) {
		assert.equal(
			readFileSync(join(REPO_ROOT, 'plugins/snail/skills/snail', path), 'utf8'),
			readFileSync(join(directory, path), 'utf8'),
		);
	}
});

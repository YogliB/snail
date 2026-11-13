/** Parent review contracts and shared diff dispatch regression checks. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './helpers.mjs';

const roots = ['', 'plugins/snail/'];
const parents = [
	['snail-alternatives', 'Alternatives', 'option:<n>', '1r'],
	['snail-planning', 'Plan', 'section:line', '2r'],
];
const read = (path) => readFileSync(join(REPO_ROOT, path), 'utf8');

for (const root of roots) {
	for (const [parent, domain, location, row] of parents) {
		test(`${root}${parent} bundles an independent mandatory review`, () => {
			const skill = read(`${root}skills/${parent}/SKILL.md`);
			const contract = read(`${root}skills/${parent}/references/review.md`);
			assert.match(skill, /references\/review\.md/);
			assert.equal(skill.split('## Review supplied text').length - 1, 1);
			assert.match(skill, /readonly/);
			assert.match(skill, /Do not self-review/);
			assert.match(skill, /mandatory/);
			assert.match(skill, /zero `valid` findings/);
			assert.match(skill, /--valid=0/);
			assert.ok(skill.includes(`row \`${row}\``));
			assert.ok(contract.includes(`### ${domain} Review Findings`));
			assert.ok(contract.includes(location));
			assert.match(contract, /apply its minimum:/);
			assert.match(contract, /3 fix passes/);
			assert.match(contract, /Read-only|read-only/);
			assert.match(
				skill,
				/Do not self-review, draft, rewrite, create a flow or advance gates/,
			);
			const relativeCore = contract.match(/`([^`]+review-core\.md)`/)[1];
			assert.ok(
				existsSync(join(REPO_ROOT, root, 'skills', parent, 'references', relativeCore)),
			);
		});
	}

	test(`${root}former review commands are removed without removing flow gates`, () => {
		for (const old of ['snail-review-plan', 'snail-review-alternatives']) {
			assert.equal(existsSync(join(REPO_ROOT, root, 'skills', old)), false);
			assert.ok(!read(`${root}rules/snail.md`).includes(`\`${old}\``));
			assert.ok(!read(`${root}skills/snail-flow/SKILL.md`).includes(`\`${old}\``));
		}
		const flow = read(`${root}skills/snail-flow/SKILL.md`);
		assert.match(flow, /mandatory internal alternatives review/);
		assert.match(flow, /mandatory internal plan review loop/);
		for (const row of ['1r', '2r']) {
			assert.ok(
				flow
					.split('\n')
					.some((line) => line.includes(`\`${row}\``) && line.includes('--valid=0')),
			);
		}
	});

	test(`${root}code reviewers receive a shared pinned diff, refreshed after fixes`, () => {
		const skill = read(`${root}skills/snail-review/SKILL.md`);
		assert.match(skill, /Before spawning any reviewer/);
		assert.match(skill, /identical prepared patch/);
		assert.match(skill, /pinned base SHA/);
		assert.match(skill, /staged and unstaged/);
		assert.match(skill, /in-scope untracked/);
		assert.match(skill, /binary changes, omitted content or truncated output/);
		assert.match(skill, /After fixes, recompute the snapshot once/);
		assert.match(skill, /do not rerun git diff/);
		assert.ok(!skill.includes('Run the diff yourself'));
	});
}

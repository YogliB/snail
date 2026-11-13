#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function projectRoot(cwd = process.cwd()) {
	const git = spawnSync('git', ['-C', cwd, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' });
	return realpathSync(git.status === 0 ? git.stdout.trim() : cwd);
}

function physicalPath(path) {
	if (existsSync(path)) return realpathSync(path);
	return join(physicalPath(dirname(path)), relative(dirname(path), path));
}

export function artifactRoot({
	cwd = process.cwd(),
	env = process.env,
	home = homedir(),
	inRepo = false,
} = {}) {
	const project = projectRoot(cwd);
	if (inRepo) return join(project, '.agents', 'flows');
	const base =
		env.XDG_STATE_HOME && isAbsolute(env.XDG_STATE_HOME)
			? env.XDG_STATE_HOME
			: join(home, '.local', 'state');
	const id = createHash('sha256').update(project).digest('hex');
	const root = physicalPath(resolve(base, 'snail', 'projects', id, 'flows'));
	const rel = relative(project, root);
	if (rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`))) {
		throw new Error(
			'XDG state directory is inside the project; choose an external XDG_STATE_HOME or explicitly request --in-repo',
		);
	}
	return root;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
	const args = process.argv.slice(2);
	if (args.length > 1 || (args.length === 1 && args[0] !== '--in-repo')) {
		console.error('usage: artifact-path.mjs [--in-repo]');
		process.exit(2);
	}
	try {
		console.log(artifactRoot({ inRepo: args[0] === '--in-repo' }));
	} catch (error) {
		console.error(`artifact-path: ${error.message}`);
		process.exit(1);
	}
}

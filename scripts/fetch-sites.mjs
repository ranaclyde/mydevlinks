import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { analyze, LOGOS } from './lib/fetch.mjs';

const RAW = 'scripts/.cache/raw-links.json';
const OUT = 'scripts/.cache/site-data.json';
const CONCURRENCY = 6;

const links = JSON.parse(readFileSync(RAW, 'utf8'));
const results = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : [];
const done = new Set(results.map((r) => r.id));
const queue = links.filter((l) => !done.has(l.id));
mkdirSync(LOGOS, { recursive: true });
console.log(`${queue.length} por analizar (${done.size} ya hechos)`);

const save = () => writeFileSync(OUT, `${JSON.stringify(results, null, '\t')}\n`);

async function worker() {
	while (queue.length) {
		const link = queue.shift();
		const entry = await analyze(link);
		results.push(entry);
		save();
		console.log(`[${results.length}/${links.length}] ${entry.status} ${link.id}${entry.error ? ` (${entry.error})` : ''}`);
	}
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
save();

import { appendFileSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { buildReport, classifyCheck, linksToCheck, staleLinks } from './lib/check-links.mjs';
import { checkLink } from './lib/fetch.mjs';

const LINKS = 'src/data/links.json';
const DETAILS = 'src/data/details';
const CONCURRENCY = 6;
const RETRY_DELAY_MS = 5_000;

const { values } = parseArgs({ options: { out: { type: 'string' } } });

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Pide el enlace y, si parece caído, reintenta una vez: un corte momentáneo no es un sitio caído. */
async function check(link) {
	let response = await checkLink(link.url);
	let state = classifyCheck({ ...response, originalUrl: link.url });
	if (state === 'dead') {
		await sleep(RETRY_DELAY_MS);
		response = await checkLink(link.url);
		state = classifyCheck({ ...response, originalUrl: link.url });
	}
	const detail = response.error ?? (response.status ? `HTTP ${response.status}` : undefined);
	return { id: link.id, name: link.name, url: link.url, state, finalUrl: response.finalUrl, detail };
}

const links = readJson(LINKS);
const details = new Map(
	readdirSync(DETAILS)
		.filter((file) => file.endsWith('.json'))
		.map((file) => [file.slice(0, -'.json'.length), readJson(`${DETAILS}/${file}`)]),
);
const queue = linksToCheck(links);
const total = queue.length;
const results = [];

async function worker() {
	while (queue.length) {
		const result = await check(queue.shift());
		results.push(result);
		if (result.state !== 'ok') console.log(`[${results.length}/${total}] ${result.state} ${result.id} ${result.detail ?? result.finalUrl ?? ''}`);
	}
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
results.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

const today = new Date().toISOString().slice(0, 10);
const stale = staleLinks(links.filter((link) => !link.private), details, today);
const { markdown, problems } = buildReport({ results, stale, today, checked: total });

if (values.out) writeFileSync(values.out, markdown);
else console.log(`\n${markdown}`);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `problems=${problems}\n`);
console.log(`${total} enlaces revisados; ${problems} para atender.`);

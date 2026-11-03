import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseHead, pickIcon, classifyResponse } from './lib/site.mjs';

const RAW = 'scripts/.cache/raw-links.json';
const OUT = 'scripts/.cache/site-data.json';
const LOGOS = 'public/logos';
const CONCURRENCY = 6;
const TIMEOUT_MS = 15_000;
const MAX_PAGE = 3 * 1024 * 1024;
const MAX_LOGO = 512 * 1024;
const HEADERS = {
	'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
	accept: 'text/html,application/xhtml+xml,image/*;q=0.8,*/*;q=0.5',
};
const EXT = {
	'image/svg+xml': 'svg',
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/webp': 'webp',
	'image/gif': 'gif',
	'image/avif': 'avif',
	'image/x-icon': 'ico',
	'image/vnd.microsoft.icon': 'ico',
};

/** Lee el cuerpo como bytes, cortando al llegar a `limit`. Devuelve null si lo supera. */
async function readCapped(res, limit) {
	const chunks = [];
	let size = 0;
	for await (const chunk of res.body) {
		size += chunk.length;
		if (size > limit) return null; // salir del for await cancela el flujo
		chunks.push(chunk);
	}
	return Buffer.concat(chunks);
}

async function get(url) {
	return fetch(url, { headers: HEADERS, redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) });
}

async function saveLogo(id, iconUrl) {
	try {
		const res = await get(iconUrl);
		if (!res.ok) return null;
		const type = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
		if (!type.startsWith('image/') || !EXT[type]) return null;
		const bytes = await readCapped(res, MAX_LOGO);
		if (!bytes || !bytes.length) return null;
		const file = `${id}.${EXT[type]}`;
		writeFileSync(`${LOGOS}/${file}`, bytes);
		return `/logos/${file}`;
	} catch {
		return null;
	}
}

async function analyze({ id, url }) {
	const entry = { id, status: 'dead', finalUrl: null, title: '', description: '', logo: null, generator: null, error: null };
	try {
		const res = await get(url);
		entry.finalUrl = res.url || null;
		entry.status = classifyResponse({ ok: res.ok, status: res.status, originalUrl: url, finalUrl: res.url });
		if (!res.ok) {
			entry.error = `HTTP ${res.status}`;
			await res.body?.cancel();
			return entry;
		}
		const bytes = await readCapped(res, MAX_PAGE);
		if (!bytes) {
			entry.error = 'page too large';
			return entry;
		}
		const html = bytes.toString('utf8');
		const head = parseHead(html, res.url);
		entry.title = head.title;
		entry.description = head.description;
		entry.generator = /<meta[^>]+name=["']generator["'][^>]*content=["']([^"']*)["']/i.exec(html)?.[1] ?? null;
		const icon = pickIcon(head.icons) ?? new URL('/favicon.ico', res.url).href;
		entry.logo = await saveLogo(id, icon);
	} catch (err) {
		entry.status = 'dead';
		entry.error = err?.cause?.code ?? err?.cause?.message ?? err?.message ?? String(err);
	}
	return entry;
}

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

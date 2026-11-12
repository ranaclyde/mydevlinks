import { mkdirSync, readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { pickTargets } from './lib/capture.mjs';

const LINKS = 'src/data/links.json';
const OUT = 'public/capturas';
const NAV_TIMEOUT_MS = 30_000;
const SETTLE_MS = 1500;

const ids = process.argv.slice(2);
if (!ids.length) {
	console.error('Uso: pnpm capture <id> [<id>…]');
	process.exit(1);
}

const links = JSON.parse(readFileSync(LINKS, 'utf8'));
const { targets, errors } = pickTargets(ids, links);
const urls = new Map(links.map((link) => [link.id, link.url]));
const results = errors.map((error) => ({ id: error.split(':')[0], result: error.slice(error.indexOf(':') + 2) }));

if (targets.length) {
	mkdirSync(OUT, { recursive: true });
	const browser = await chromium.launch();
	try {
		const context = await browser.newContext({
			viewport: { width: 1280, height: 800 },
			deviceScaleFactor: 1,
			colorScheme: 'light',
		});
		for (const id of targets) {
			const page = await context.newPage();
			try {
				try {
					await page.goto(urls.get(id), { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
				} catch (error) {
					// Si se agota la espera, la página suele estar cargada: se captura igual.
					if (error?.name !== 'TimeoutError') throw error;
				}
				await page.waitForTimeout(SETTLE_MS);
				await page.screenshot({ path: `${OUT}/${id}.jpg`, type: 'jpeg', quality: 80 });
				results.push({ id, result: 'ok' });
			} catch (error) {
				results.push({ id, result: String(error?.message ?? error).split('\n')[0] });
			} finally {
				await page.close();
			}
		}
	} finally {
		await browser.close();
	}
}

for (const { id, result } of results) console.log(`${id}: ${result}`);
const done = results.filter((r) => r.result === 'ok').map((r) => r.id);
if (done.length) {
	const today = new Date().toISOString().slice(0, 10);
	console.log(`\nPon "screenshotAt": "${today}" en src/data/detalles/<id>.json de: ${done.join(', ')}`);
}
process.exitCode = results.every((r) => r.result === 'ok') ? 0 : 1;

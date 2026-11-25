import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { pickTargets, saveScreenshot, SCREENSHOT_SIZE } from './lib/capture.mjs';

const LINKS = 'src/data/links.json';
const OUT = 'src/assets/screenshots';
const NAV_TIMEOUT_MS = 30_000;
/** Espera tras cargar, para animaciones y contenido armado en el navegador. Se sube con SETTLE_MS=10000. */
const SETTLE_MS = Number(process.env.SETTLE_MS) || 1500;
const USAGE = 'Uso: pnpm capture <id> [<id>…]\n     pnpm capture <id> --from <imagen>   (convierte una captura tomada a mano)';

const args = process.argv.slice(2);
const fromIndex = args.indexOf('--from');
const from = fromIndex === -1 ? undefined : args[fromIndex + 1];
const ids = fromIndex === -1 ? args : args.filter((_, i) => i !== fromIndex && i !== fromIndex + 1);
if (!ids.length || (fromIndex !== -1 && (!from || ids.length !== 1))) {
	console.error(USAGE);
	process.exit(1);
}

const links = JSON.parse(readFileSync(LINKS, 'utf8'));
const { targets, errors } = pickTargets(ids, links);
const urls = new Map(links.map((link) => [link.id, link.url]));
const results = errors.map((error) => ({ id: error.split(':')[0], result: error.slice(error.indexOf(':') + 2) }));

if (targets.length && from) {
	try {
		await saveScreenshot(from, targets[0], OUT);
		results.push({ id: targets[0], result: 'ok' });
	} catch (error) {
		results.push({ id: targets[0], result: String(error?.message ?? error).split('\n')[0] });
	}
} else if (targets.length) {
	const browser = await chromium.launch();
	try {
		const context = await browser.newContext({
			viewport: SCREENSHOT_SIZE,
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
				// PNG sin pérdida en memoria; la única compresión es la del WebP final.
				await saveScreenshot(await page.screenshot({ type: 'png' }), id, OUT);
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
	console.log(`\nGuardadas en ${OUT}/<id>.webp.`);
	console.log(`Pon "screenshotAt": "${today}" en src/data/details/<id>.json de: ${done.join(', ')}`);
}
process.exitCode = results.every((r) => r.result === 'ok') ? 0 : 1;

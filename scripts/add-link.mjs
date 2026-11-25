import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { detailSkeleton, detailTextSkeleton, findDuplicates, linkId, linkSkeleton } from './lib/add-link.mjs';
import { analyze, LOGOS } from './lib/fetch.mjs';

const LINKS = 'src/data/links.json';
const LINKS_EN = 'src/data/en/links.json';
const DETAILS = 'src/data/details';
const DETAILS_EN = 'src/data/en/details';
const USAGE = 'Uso: pnpm add-link <url> [--name "Nombre"] [--id id] [--force]';

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		name: { type: 'string' },
		id: { type: 'string' },
		force: { type: 'boolean', default: false },
	},
});

function fail(message) {
	console.error(message);
	process.exit(1);
}

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, '\t')}\n`);

if (positionals.length !== 1) fail(USAGE);
let url;
try {
	url = new URL(positionals[0]);
} catch {
	fail(`No es una URL válida: ${positionals[0]}\n${USAGE}`);
}
if (!['http:', 'https:'].includes(url.protocol)) fail('La URL tiene que empezar con http:// o https://');
url = url.href;

const id = values.id ?? linkId(url);
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail(`Id no válido: ${id}. Usa minúsculas, números y guiones.`);

const links = readJson(LINKS);
const { exact, sameDomain } = findDuplicates(url, id, links);
if (exact.length) {
	fail(`Ya está en el directorio: ${exact.map((link) => `${link.id} (${link.url})`).join(', ')}`);
}
for (const path of [`${DETAILS}/${id}.json`, `${DETAILS_EN}/${id}.json`]) {
	if (existsSync(path)) fail(`Ya existe ${path}: bórralo o elige otro --id.`);
}

console.log(`Revisando ${url}…`);
mkdirSync(LOGOS, { recursive: true });
const site = await analyze({ id, url });

if (site.status === 'dead' && !values.force) {
	fail(
		`El sitio no respondió bien (${site.error ?? 'sin respuesta'}).\n` +
			'Si en el navegador carga, seguramente bloquea bots: repite con --force y saca el logo a mano.',
	);
}
if (site.status === 'redirect' && !values.force) {
	fail(
		`Redirige a otro dominio: ${site.finalUrl}\n` +
			'Si es el mismo producto, agrega esa URL. Si de verdad quieres la original, repite con --force.',
	);
}

const name = values.name ?? (site.title.split(/\s+[|·–—:-]\s+/)[0].trim() || id);
const link = linkSkeleton({ id, name, url, logo: site.logo ?? undefined });
const today = new Date().toISOString().slice(0, 10);

writeJson(LINKS, [...links, link]);
writeJson(LINKS_EN, [...readJson(LINKS_EN), { id, description: '' }]);
writeJson(`${DETAILS}/${id}.json`, detailSkeleton(today));
writeJson(`${DETAILS_EN}/${id}.json`, detailTextSkeleton());

const lines = [
	'',
	`Agregado: ${id}`,
	`  Nombre: ${name}${values.name ? '' : '  (sale del <title>: corrígelo si hace falta)'}`,
	`  Logo: ${site.logo ?? 'no se encontró; la ficha mostrará la inicial (ver la guía para sacarlo a mano)'}`,
	`  Título del sitio: ${site.title || '(vacío)'}`,
	`  Descripción del sitio: ${site.description || '(vacía)'}`,
	'  (El título y la descripción son solo referencia: no se copian.)',
];
if (sameDomain.length) {
	lines.push('', `Ojo: ya hay enlaces del mismo dominio: ${sameDomain.map((l) => `${l.id} (${l.url})`).join(', ')}.`);
	lines.push('Revisa que el nuevo no repita a alguno de ellos.');
}
lines.push(
	'',
	'Quedan por completar (el build y pnpm test fallan hasta entonces):',
	`  - ${LINKS}: description, category, tech y, si es una galería, tags`,
	`  - ${DETAILS}/${id}.json`,
	`  - ${LINKS_EN} y ${DETAILS_EN}/${id}.json: la traducción`,
	`  - la captura: pnpm capture ${id}`,
	'Paso a paso: docs/adding-links.md',
);
console.log(lines.join('\n'));

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, parse } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CATEGORIES, linkSchema } from '../src/lib/links';
import data from '../src/data/links.json';

const links = data as Array<Record<string, any>>;
const root = join(import.meta.dirname, '..');
const rawPath = join(root, 'scripts/.cache/raw-links.json');

/** Enlaces de raw-links.json que se quitaron a propósito, con su motivo. */
const REMOVED: Record<string, string> = {
	'tailwindcomponents-com':
		'Redirige a creative-tim.com/twcomponents: es el mismo sitio y se conserva esa entrada.',
	// Revisión del autor del 6 de noviembre de 2026; detalle en docs/revision-enlaces.md.
	'codepen-io-smitche-pen-mownba': 'Pen de CodePen sin verificar; el autor lo quitó.',
	'codepen-io-jh3y-pen-qwypaax': 'Pen de CodePen sin verificar; el autor lo quitó.',
	'tailwindcss-com-plus-ui-blocks': 'Tailwind Plus sin verificar; el autor lo quitó.',
	'youtube-com-watch-3': 'El vídeo ya no está en YouTube.',
	'youtube-com-watch-2': 'NativeScript queda fuera de la colección.',
	'market-nativescript-org': 'NativeScript queda fuera de la colección.',
	'github-com-gonzalo2310-awesome-nativescript-vue': 'NativeScript queda fuera de la colección.',
	'nativescript-vue-org-en-docs-introduction': 'Caído y de NativeScript.',
	'intools-co': 'Caído: dominio estacionado.',
	'op6gls4d1-bkt-clouddn-com-vuejs-vuex-docs-es': 'Caído: error 404.',
	'codecourse-com-lessons-unit-testing-vuex-1775': 'Caído: error 404.',
	'vuetelescope-com-explore': 'Caído: error 404.',
	'factor-dev': 'Caído: el dominio no resuelve.',
	'magic-reactjs-net-htmltojsx-htm': 'Reemplazado por transform-tools, que incluye HTML a JSX.',
	'freepik-es-search': 'Freepik pasó a llamarse Magnific: reemplazado por magnific-com.',
	'freepik-es-search-2': 'Freepik pasó a llamarse Magnific: reemplazado por magnific-com.',
	'create-react-app-dev': 'Antiguo: el sitio declara que está obsoleto.',
	'marketplace-visualstudio-com-items': 'Antiguo: Vetur fue reemplazado por Volar.',
	'bootstrap-vue-org-docs': 'Antiguo: apunta a Vue 2 y Bootstrap 4.',
	'es-nuxtjs-org-docs-2-x-get-started-installation': 'Antiguo: Nuxt 2 llegó al fin de su vida útil.',
	'reactrouter-com-docs-en-v6': 'Antiguo: reemplazado por tanstack-com, que incluye un router.',
	'toolbox-signalsupply-co-apps-gradientblobcss': 'Ahora apunta a la raíz de Toolbox, con id toolbox-signalsupply-co.',
};

describe('links.json', () => {
	it('cada enlace pasa linkSchema', () => {
		const errors = links.flatMap((link) => {
			const result = linkSchema.safeParse(link);
			return result.success ? [] : [`${link.id}: ${result.error.message}`];
		});
		expect(errors).toEqual([]);
	});

	it('id y url son únicos', () => {
		expect(new Set(links.map((l) => l.id)).size).toBe(links.length);
		expect(new Set(links.map((l) => l.url)).size).toBe(links.length);
	});

	it('description tiene como máximo 120 caracteres', () => {
		const long = links.filter((l) => (l.description ?? '').length > 120).map((l) => l.id);
		expect(long).toEqual([]);
	});

	it('cada logo existe en public/', () => {
		const missing = links
			.filter((l) => l.logo && !existsSync(join(root, 'public', l.logo)))
			.map((l) => l.id);
		expect(missing).toEqual([]);
	});

	it('hay al menos un enlace por categoría', () => {
		const used = new Set(links.map((l) => l.category));
		expect(CATEGORIES.filter((c) => !used.has(c))).toEqual([]);
	});

	it('cada galería verificada lleva al menos una etiqueta, sin repetir', () => {
		const galleries = links.filter((l) => l.category === 'Galerías de inspiración' && l.verified);
		expect(galleries.filter((l) => !l.tags?.length).map((l) => l.id)).toEqual([]);
		expect(galleries.filter((l) => new Set(l.tags).size !== l.tags.length).map((l) => l.id)).toEqual([]);
	});

	it('tech no repite valores', () => {
		const bad = links.flatMap((l) =>
			l.tech
				.filter((t: string, i: number) => l.tech.indexOf(t) !== i)
				.map((t: string) => `${l.id}: ${t}`),
		);
		expect(bad).toEqual([]);
	});

	it('un enlace sin verificar no lleva description', () => {
		expect(links.filter((l) => !l.verified && l.description !== undefined).map((l) => l.id)).toEqual([]);
	});

	it('un enlace sin verificar no declara tecnologías', () => {
		expect(links.filter((l) => !l.verified && l.tech.length).map((l) => l.id)).toEqual([]);
	});

	it('ningún enlace privado tiene logo en public/, con cualquier extensión', () => {
		const stems = readdirSync(join(root, 'public/logos')).map((file) => parse(file).name);
		for (const link of links.filter((l) => l.private)) {
			expect(link.logo).toBeUndefined();
			expect(stems).not.toContain(link.id);
		}
	});

	// raw-links.json es caché local fuera de git: sin él no hay contra qué comparar.
	it.skipIf(!existsSync(rawPath))('la suma coincide con raw-links.json menos los quitados', () => {
		const raw = JSON.parse(readFileSync(rawPath, 'utf8')) as Array<{ id: string }>;
		const expected = raw.map((l) => l.id).filter((id) => !(id in REMOVED));
		expect(links.map((l) => l.id).sort()).toEqual(expected.sort());
	});
});

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, parse } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CATEGORIES, linkSchema } from '../src/lib/links';
import data from '../src/data/links.json';

const links = data as Array<Record<string, any>>;
const root = join(import.meta.dirname, '..');

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
		const galleries = links.filter((l) => l.category === 'inspiration' && l.verified);
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
});

describe('traducciones al inglés', () => {
	const ids = new Set(links.map((link) => link.id));
	const detailsDir = join(root, 'src/data/details');
	const enDir = join(root, 'src/data/en/details');
	const enLinks = JSON.parse(readFileSync(join(root, 'src/data/en/links.json'), 'utf8')) as Array<{
		id: string;
		description: string;
	}>;

	it('cada descripción traducida es de un enlace con descripción, sin repetir', () => {
		const withDescription = new Set(links.filter((link) => link.description).map((link) => link.id));
		expect(enLinks.filter((entry) => !withDescription.has(entry.id)).map((entry) => entry.id)).toEqual([]);
		expect(new Set(enLinks.map((entry) => entry.id)).size).toBe(enLinks.length);
	});

	it('description traducida tiene como máximo 120 caracteres', () => {
		expect(enLinks.filter((entry) => entry.description.length > 120).map((entry) => entry.id)).toEqual([]);
	});

	it('cada detalle traducido tiene su detalle en español', () => {
		const translated = readdirSync(enDir).filter((file) => file.endsWith('.json'));
		const missing = translated.filter((file) => !existsSync(join(detailsDir, file)) || !ids.has(parse(file).name));
		expect(missing).toEqual([]);
	});

	it('cada detalle traducido tiene los mismos párrafos, usos y advertencias que el original', () => {
		const read = (dir: string, file: string) => JSON.parse(readFileSync(join(dir, file), 'utf8'));
		const shape = (detail: Record<string, string[]>) => ['whatIs', 'uses', 'caveats'].map((key) => detail[key]?.length);
		const translated = readdirSync(enDir).filter((file) => file.endsWith('.json') && existsSync(join(detailsDir, file)));
		const differ = translated.filter(
			(file) => shape(read(enDir, file)).join() !== shape(read(detailsDir, file)).join(),
		);
		expect(differ).toEqual([]);
	});
});

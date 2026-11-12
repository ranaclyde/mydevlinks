import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, parse } from 'node:path';
import { describe, expect, it } from 'vitest';
import { detailSchema, formatDate, screenshotPath } from '../src/lib/details';
import data from '../src/data/links.json';

const root = join(import.meta.dirname, '..');
const detailsDir = join(root, 'src/data/detalles');
const capturasDir = join(root, 'public/capturas');
const links = data as Array<{ id: string; private: boolean }>;

const base = {
	whatIs: ['Una biblioteca de componentes.'],
	uses: ['Uno', 'Dos', 'Tres'],
	caveats: ['Aviso uno', 'Aviso dos'],
	pricing: 'freemium',
	pricingNote: 'Plan gratis con límites.',
	pricingUrl: 'https://example.com/precios',
	idealFor: 'Equipos pequeños.',
	reviewedAt: '2026-11-11',
	reviewedByAuthor: false,
};

describe('detailSchema', () => {
	it('acepta un detalle completo de freemium con pricingUrl', () => {
		expect(detailSchema.safeParse(base).success).toBe(true);
	});

	it('rechaza freemium sin pricingUrl', () => {
		const { pricingUrl, ...rest } = base;
		expect(detailSchema.safeParse(rest).success).toBe(false);
	});

	it('acepta gratis sin pricingUrl', () => {
		const { pricingUrl, ...rest } = base;
		expect(detailSchema.safeParse({ ...rest, pricing: 'gratis' }).success).toBe(true);
	});

	it('rechaza uses con 2 elementos', () => {
		expect(detailSchema.safeParse({ ...base, uses: ['Uno', 'Dos'] }).success).toBe(false);
	});

	it('rechaza reviewedAt con formato distinto de ISO', () => {
		expect(detailSchema.safeParse({ ...base, reviewedAt: '11/11/2026' }).success).toBe(false);
	});
});

describe('fechas ISO', () => {
	it('rechaza fechas imposibles y acepta una real', () => {
		expect(detailSchema.safeParse({ ...base, reviewedAt: '2026-02-30' }).success).toBe(false);
		expect(detailSchema.safeParse({ ...base, reviewedAt: '2026-13-45' }).success).toBe(false);
		expect(detailSchema.safeParse({ ...base, reviewedAt: '2026-02-28' }).success).toBe(true);
	});

	it('rechaza idealFor y pricingNote vacíos', () => {
		expect(detailSchema.safeParse({ ...base, idealFor: '  ' }).success).toBe(false);
		expect(detailSchema.safeParse({ ...base, pricingNote: '' }).success).toBe(false);
	});
});

describe('formatDate', () => {
	it('da el formato corto en español', () => {
		expect(formatDate('2026-11-11')).toBe('11 nov 2026');
	});

	it('quita el punto de los meses abreviados que lo llevan', () => {
		expect(formatDate('2026-09-01')).toBe('1 sept 2026');
	});
});

describe('screenshotPath', () => {
	it('apunta a la captura JPEG del enlace', () => {
		expect(screenshotPath('daisyui-com')).toBe('/capturas/daisyui-com.jpg');
	});
});

describe('detalles reales', () => {
	const files = readdirSync(detailsDir).filter((f) => f.endsWith('.json'));
	const ids = new Map(links.map((l) => [l.id, l]));

	for (const file of files) {
		const id = parse(file).name;
		const detail = JSON.parse(readFileSync(join(detailsDir, file), 'utf8'));

		it(`${id} cumple el esquema y sus referencias`, () => {
			expect(detailSchema.safeParse(detail).success).toBe(true);
			expect(ids.get(id)?.private).toBe(false);
			for (const alt of detail.alternatives ?? []) {
				expect(alt).not.toBe(id);
				expect(ids.get(alt)?.private).toBe(false);
			}
			if (detail.screenshotAt) {
				expect(existsSync(join(capturasDir, `${id}.jpg`))).toBe(true);
			}
		});
	}

	it('cada captura corresponde a un detalle', () => {
		if (!existsSync(capturasDir)) return;
		const detailIds = new Set(files.map((f) => parse(f).name));
		for (const f of readdirSync(capturasDir).filter((f) => f.endsWith('.jpg'))) {
			expect(detailIds.has(parse(f).name), f).toBe(true);
		}
	});
});

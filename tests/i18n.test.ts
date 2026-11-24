import { describe, expect, it } from 'vitest';
import { labelOf, LOCALES, localizePath, toLocale, UI, useTranslations } from '../src/i18n/ui';
import { PRICING, type Detail } from '../src/lib/details';
import { CATEGORIES, GALLERY_TAGS, type Link } from '../src/lib/links';
import { localize } from '../src/lib/translations';

describe('localizePath', () => {
	it('deja las rutas en español como están', () => {
		expect(localizePath('/', 'es')).toBe('/');
		expect(localizePath('/tool/x', 'es')).toBe('/tool/x');
	});

	it('pone el prefijo del idioma, sin barra final', () => {
		expect(localizePath('/', 'en')).toBe('/en');
		expect(localizePath('/tool/x', 'en')).toBe('/en/tool/x');
	});
});

describe('toLocale', () => {
	it('acepta los idiomas del sitio y cae al español con cualquier otro', () => {
		expect(toLocale('en')).toBe('en');
		expect(toLocale('es')).toBe('es');
		expect(toLocale('fr')).toBe('es');
		expect(toLocale(undefined)).toBe('es');
	});
});

describe('diccionario', () => {
	it('cada idioma traduce cada categoría, tipo de galería y precio', () => {
		for (const locale of LOCALES) {
			const t = UI[locale];
			for (const value of [...CATEGORIES, ...GALLERY_TAGS, ...PRICING]) {
				expect(labelOf(t, value), `${locale}: ${value}`).toMatch(/\S/);
			}
		}
	});

	it('en inglés las etiquetas no son las de español, salvo nombres propios', () => {
		const t = useTranslations('en');
		expect(labelOf(t, 'Herramientas de desarrollo')).toBe('Developer tools');
		expect(labelOf(t, 'de-pago')).toBe('Paid');
		expect(labelOf(t, 'Serverless')).toBe('Serverless');
	});

	it('un valor desconocido se muestra tal cual', () => {
		expect(labelOf(useTranslations('en'), 'React')).toBe('React');
	});

	it('pluraliza el contador', () => {
		expect(UI.es.links(1)).toBe('enlace');
		expect(UI.en.links(2)).toBe('links');
	});
});

describe('localize', () => {
	const link: Link = {
		id: 'x',
		name: 'X',
		url: 'https://x.dev/',
		description: 'Descripción',
		category: 'Serverless',
		tech: [],
		status: 'activo',
		verified: true,
		private: false,
	};
	const detail: Detail = {
		whatIs: ['Qué es'],
		uses: ['a', 'b', 'c'],
		caveats: ['d', 'e'],
		pricing: 'gratis',
		pricingNote: 'Nota',
		idealFor: 'Todos',
		reviewedAt: '2026-11-24',
		reviewedByAuthor: false,
		alternatives: ['y'],
	};
	const detailText = { whatIs: ['What'], uses: ['1', '2', '3'], caveats: ['4', '5'], pricingNote: 'Note', idealFor: 'All' };

	it('con todo traducido reemplaza los textos y conserva el resto', () => {
		const result = localize(link, detail, { id: 'x', description: 'Description' }, detailText);
		expect(result.translated).toBe(true);
		expect(result.link.description).toBe('Description');
		expect(result.detail?.whatIs).toEqual(['What']);
		expect(result.detail?.pricing).toBe('gratis');
		expect(result.detail?.alternatives).toEqual(['y']);
	});

	it('sin la traducción del detalle no está traducido', () => {
		expect(localize(link, detail, { id: 'x', description: 'Description' }).translated).toBe(false);
	});

	it('sin la de la descripción tampoco, y queda el texto en español', () => {
		const result = localize(link, detail, undefined, detailText);
		expect(result.translated).toBe(false);
		expect(result.link.description).toBe('Descripción');
	});

	it('un enlace sin verificar ni detalle no necesita traducción', () => {
		const { description: _, ...rest } = link;
		expect(localize({ ...rest, verified: false }).translated).toBe(true);
	});
});

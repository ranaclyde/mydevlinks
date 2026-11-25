import { describe, expect, it } from 'vitest';
import { detailSkeleton, findDuplicates, linkId, linkSkeleton, normalizeUrl } from '../scripts/lib/add-link.mjs';

describe('linkId', () => {
	it('usa el dominio sin www, con guiones', () => {
		expect(linkId('https://www.daisyui.com/')).toBe('daisyui-com');
	});

	it('suma la ruta y descarta la consulta y el ancla', () => {
		expect(linkId('https://fonts.google.com/icons?icon.set=Material#top')).toBe('fonts-google-com-icons');
	});

	it('pasa a minúsculas y junta los separadores', () => {
		expect(linkId('https://refactoring.guru/es/Design-Patterns/')).toBe('refactoring-guru-es-design-patterns');
	});
});

describe('normalizeUrl', () => {
	it('ignora protocolo, www, barra final, consulta y mayúsculas del dominio', () => {
		expect(normalizeUrl('http://WWW.Ejemplo.dev/docs/?a=1')).toBe(normalizeUrl('https://ejemplo.dev/docs'));
	});
});

describe('findDuplicates', () => {
	const links = [
		{ id: 'ejemplo-dev', name: 'Ejemplo', url: 'https://ejemplo.dev/' },
		{ id: 'otro-dev-docs', name: 'Otro', url: 'https://otro.dev/docs' },
	];

	it('marca la misma URL aunque cambie la forma de escribirla', () => {
		expect(findDuplicates('https://www.ejemplo.dev', 'nuevo', links).exact.map((l) => l.id)).toEqual(['ejemplo-dev']);
	});

	it('marca el mismo id', () => {
		expect(findDuplicates('https://x.dev/', 'otro-dev-docs', links).exact.map((l) => l.id)).toEqual(['otro-dev-docs']);
	});

	it('avisa de otros enlaces del mismo dominio sin tomarlos como duplicado', () => {
		const result = findDuplicates('https://otro.dev/blog', 'otro-dev-blog', links);
		expect(result.exact).toEqual([]);
		expect(result.sameDomain.map((l) => l.id)).toEqual(['otro-dev-docs']);
	});

	it('no marca nada si el dominio es nuevo', () => {
		expect(findDuplicates('https://nuevo.dev/', 'nuevo-dev', links)).toEqual({ exact: [], sameDomain: [] });
	});
});

describe('esqueletos', () => {
	it('el enlace queda verificado, público y con los campos por completar vacíos', () => {
		const link = linkSkeleton({ id: 'nuevo-dev', name: 'Nuevo', url: 'https://nuevo.dev/', logo: '/logos/nuevo-dev.svg' });
		expect(link).toEqual({
			id: 'nuevo-dev',
			name: 'Nuevo',
			url: 'https://nuevo.dev/',
			description: '',
			category: '',
			tech: [],
			status: 'active',
			verified: true,
			private: false,
			logo: '/logos/nuevo-dev.svg',
		});
	});

	it('sin logo no lleva el campo', () => {
		expect(linkSkeleton({ id: 'a', name: 'A', url: 'https://a.dev/' })).not.toHaveProperty('logo');
	});

	it('el detalle trae la forma que pide el esquema y la fecha de hoy', () => {
		const detail = detailSkeleton('2026-11-25');
		expect(detail.uses).toHaveLength(3);
		expect(detail.caveats).toHaveLength(2);
		expect(detail.reviewedAt).toBe('2026-11-25');
		expect(detail.screenshotAt).toBe('2026-11-25');
		expect(detail.reviewedByAuthor).toBe(false);
	});
});

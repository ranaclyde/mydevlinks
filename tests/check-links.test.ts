import { describe, expect, it } from 'vitest';
import { buildReport, classifyCheck, linksToCheck, staleLinks } from '../scripts/lib/check-links.mjs';

describe('classifyCheck', () => {
	const originalUrl = 'https://ejemplo.dev/';

	it('ok si responde en el mismo dominio, aunque cambie www o la ruta', () => {
		expect(classifyCheck({ ok: true, status: 200, originalUrl, finalUrl: 'https://www.ejemplo.dev/es' })).toBe('ok');
	});

	it('redirect si termina en otro dominio', () => {
		expect(classifyCheck({ ok: true, status: 200, originalUrl, finalUrl: 'https://otro.dev/' })).toBe('redirect');
	});

	it('blocked con 401, 403 y 429', () => {
		for (const status of [401, 403, 429]) {
			expect(classifyCheck({ ok: false, status, originalUrl, finalUrl: originalUrl })).toBe('blocked');
		}
	});

	it('dead con error de servidor, 404 o error de red', () => {
		expect(classifyCheck({ ok: false, status: 500, originalUrl, finalUrl: originalUrl })).toBe('dead');
		expect(classifyCheck({ ok: false, status: 404, originalUrl, finalUrl: originalUrl })).toBe('dead');
		expect(classifyCheck({ originalUrl, error: 'ENOTFOUND' })).toBe('dead');
	});
});

describe('linksToCheck', () => {
	it('deja fuera los privados y los ya marcados como caídos', () => {
		const links = [
			{ id: 'a', private: false, status: 'active' },
			{ id: 'b', private: false, status: 'outdated' },
			{ id: 'c', private: true, status: 'active' },
			{ id: 'd', private: false, status: 'down' },
		];
		expect(linksToCheck(links).map((l) => l.id)).toEqual(['a', 'b']);
	});
});

describe('staleLinks', () => {
	const links = [
		{ id: 'nuevo', name: 'Nuevo' },
		{ id: 'viejo', name: 'Viejo' },
		{ id: 'muy-viejo', name: 'Muy viejo' },
		{ id: 'sin-detalle', name: 'Sin detalle' },
	];
	const details = new Map([
		['nuevo', { reviewedAt: '2026-11-01' }],
		['viejo', { reviewedAt: '2026-05-01' }],
		['muy-viejo', { reviewedAt: '2025-01-01' }],
	]);

	it('marca los revisados hace más de 6 meses, del más viejo al más nuevo', () => {
		expect(staleLinks(links, details, '2026-11-25').map((l) => l.id)).toEqual(['muy-viejo', 'viejo']);
	});

	it('respeta el límite de días', () => {
		expect(staleLinks(links, details, '2026-11-25', 1000).map((l) => l.id)).toEqual([]);
	});
});

describe('buildReport', () => {
	const base = { id: 'x', name: 'X', url: 'https://x.dev/' };

	it('sin problemas lo dice y cuenta cero', () => {
		const { markdown, problems } = buildReport({ results: [{ ...base, state: 'ok' }], stale: [], today: '2026-11-25', checked: 1 });
		expect(problems).toBe(0);
		expect(markdown).toContain('No hay enlaces caídos');
	});

	it('cuenta caídos, redirecciones y detalles viejos, pero no los bloqueos', () => {
		const results = [
			{ ...base, id: 'caido', state: 'dead', detail: 'HTTP 500' },
			{ ...base, id: 'movido', state: 'redirect', finalUrl: 'https://otro.dev/' },
			{ ...base, id: 'antibot', state: 'blocked', detail: 'HTTP 403' },
		];
		const stale = [{ id: 'viejo', name: 'Viejo', reviewedAt: '2025-01-01' }];
		const { markdown, problems } = buildReport({ results, stale, today: '2026-11-25', checked: 3 });
		expect(problems).toBe(3);
		expect(markdown).toContain('## Caídos (1)');
		expect(markdown).toContain('→ https://otro.dev/');
		expect(markdown).toContain('## Sin revisar hace más de 6 meses (1)');
		expect(markdown).toContain('Rechazan al bot (1)');
	});
});

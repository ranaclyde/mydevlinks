import { describe, expect, it } from 'vitest';
import { parseHead, pickIcon, classifyResponse } from '../scripts/lib/site.mjs';

describe('parseHead', () => {
	it('resuelve iconos relativos contra baseUrl', () => {
		const html = `<html><head><title> Site </title><meta name="description" content="Desc">
			<link rel="icon" href="/favicon.svg" type="image/svg+xml">
			<link rel="apple-touch-icon" href="img/a.png" sizes="180x180"></head></html>`;
		const out = parseHead(html, 'https://example.com/docs/page');
		expect(out.title).toBe('Site');
		expect(out.description).toBe('Desc');
		expect(out.icons).toEqual([
			{ href: 'https://example.com/favicon.svg', sizes: '', type: 'image/svg+xml' },
			{ href: 'https://example.com/docs/img/a.png', sizes: '180x180', type: '' },
		]);
	});

	it('lee og:description si falta description', () => {
		const html = `<head><meta property="og:description" content="Desde OG"></head>`;
		expect(parseHead(html, 'https://example.com/').description).toBe('Desde OG');
	});
});

describe('pickIcon', () => {
	it('prefiere SVG', () => {
		const icons = [
			{ href: 'https://e.com/big.png', sizes: '512x512', type: 'image/png' },
			{ href: 'https://e.com/i.svg', sizes: '', type: 'image/svg+xml' },
		];
		expect(pickIcon(icons)).toBe('https://e.com/i.svg');
	});

	it('si no hay SVG elige el mayor sizes', () => {
		const icons = [
			{ href: 'https://e.com/s.png', sizes: '32x32', type: '' },
			{ href: 'https://e.com/b.png', sizes: '192x192', type: '' },
		];
		expect(pickIcon(icons)).toBe('https://e.com/b.png');
	});

	it('sin iconos devuelve null', () => {
		expect(pickIcon([])).toBeNull();
	});
});

describe('classifyResponse', () => {
	it('200 mismo dominio es ok', () => {
		expect(classifyResponse({ ok: true, status: 200, originalUrl: 'https://a.com/x', finalUrl: 'https://a.com/y' })).toBe('ok');
	});
	it('200 con otro dominio es redirect', () => {
		expect(classifyResponse({ ok: true, status: 200, originalUrl: 'https://a.com/', finalUrl: 'https://b.com/' })).toBe('redirect');
	});
	it('404 es dead', () => {
		expect(classifyResponse({ ok: false, status: 404, originalUrl: 'https://a.com/', finalUrl: 'https://a.com/' })).toBe('dead');
	});
	it('fallo de red es dead', () => {
		expect(classifyResponse({ ok: false, status: 0, originalUrl: 'https://a.com/', finalUrl: null })).toBe('dead');
	});
});

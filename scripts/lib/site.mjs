import { parse } from 'node-html-parser';

function resolve(href, baseUrl) {
	try {
		return new URL(href, baseUrl).href;
	} catch {
		return null;
	}
}

/** Título, descripción e iconos declarados en el `<head>`. Trata el HTML solo como texto. */
export function parseHead(html, baseUrl) {
	const root = parse(html);
	const meta = (selector) => root.querySelector(selector)?.getAttribute('content')?.trim() ?? '';
	const title = root.querySelector('title')?.text.trim() || meta('meta[property="og:title"]');
	const description = meta('meta[name="description"]') || meta('meta[property="og:description"]');
	const icons = [];
	for (const link of root.querySelectorAll('link[rel]')) {
		const rel = (link.getAttribute('rel') ?? '').toLowerCase().split(/\s+/);
		if (!rel.includes('icon') && !rel.includes('apple-touch-icon')) continue;
		const href = resolve(link.getAttribute('href') ?? '', baseUrl);
		if (!href || !link.getAttribute('href')) continue;
		icons.push({ href, sizes: link.getAttribute('sizes') ?? '', type: link.getAttribute('type') ?? '' });
	}
	return { title, description, icons };
}

function area(sizes) {
	const match = /(\d+)x(\d+)/i.exec(sizes ?? '');
	return match ? Number(match[1]) * Number(match[2]) : 0;
}

/** Prefiere SVG; si no, el de mayor `sizes`. */
export function pickIcon(icons) {
	if (!icons.length) return null;
	const svg = icons.find((i) => i.type === 'image/svg+xml' || /\.svg(\?|$)/i.test(i.href));
	if (svg) return svg.href;
	return [...icons].sort((a, b) => area(b.sizes) - area(a.sizes))[0].href;
}

const bareHost = (url) => new URL(url).hostname.replace(/^www\./, '');

/** ok = responde en el mismo dominio; redirect = acaba en otro dominio; dead = sin respuesta o error. */
export function classifyResponse({ ok, status, originalUrl, finalUrl }) {
	if (!ok || !status || !finalUrl) return 'dead';
	try {
		return bareHost(originalUrl) === bareHost(finalUrl) ? 'ok' : 'redirect';
	} catch {
		return 'dead';
	}
}

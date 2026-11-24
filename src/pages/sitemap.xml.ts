import type { APIRoute } from 'astro';
import { DEFAULT_LOCALE, LOCALES, localizePath } from '../i18n/ui';
import { loadCatalog } from '../lib/catalog';
import { absoluteUrl, linkPath } from '../lib/seo';

function escapeXml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Cada página en español y, si tiene todos sus textos en inglés, también su versión en
 * inglés, con las dos enlazadas como alternativas (hreflang).
 */
export const GET: APIRoute = async ({ site }) => {
	const items = await loadCatalog('es', false);
	const english = new Map((await loadCatalog('en', false)).map((item) => [item.link.id, item.translated]));
	const dates = items.flatMap((item) => (item.detail ? [item.detail.reviewedAt] : [])).sort();

	const pages = [
		{ path: '/', lastmod: dates.at(-1), translated: [...english.values()].every(Boolean) },
		...items
			.map(({ link, detail }) => ({
				path: linkPath(link.id),
				lastmod: detail?.reviewedAt,
				translated: english.get(link.id) ?? false,
			}))
			.sort((a, b) => a.path.localeCompare(b.path)),
	];

	const url = (path: string) => escapeXml(absoluteUrl(path, site));
	const urls = pages
		.flatMap(({ path, lastmod, translated }) => {
			const locales = translated ? LOCALES : [DEFAULT_LOCALE];
			const alternates = translated
				? [
						...LOCALES.map((lang) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${url(localizePath(path, lang))}"/>`),
						`<xhtml:link rel="alternate" hreflang="x-default" href="${url(path)}"/>`,
					].join('')
				: '';
			return locales.map(
				(lang) =>
					`\t<url><loc>${url(localizePath(path, lang))}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}${alternates}</url>`,
			);
		})
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

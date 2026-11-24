import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { visibleLinks } from '../lib/links';
import { absoluteUrl, linkPath } from '../lib/seo';

function escapeXml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const GET: APIRoute = async ({ site }) => {
	const links = visibleLinks(
		(await getCollection('links')).map((entry) => entry.data),
		false,
	);
	const reviewed = new Map(
		(await getCollection('details')).map((entry) => [entry.id, entry.data.reviewedAt]),
	);
	const dates = [...reviewed.values()].sort();

	const pages = [
		{ path: '/', lastmod: dates.at(-1) },
		...links
			.map((link) => ({ path: linkPath(link.id), lastmod: reviewed.get(link.id) }))
			.sort((a, b) => a.path.localeCompare(b.path)),
	];

	const urls = pages
		.map(({ path, lastmod }) => {
			const loc = `<loc>${escapeXml(absoluteUrl(path, site))}</loc>`;
			return `\t<url>${loc}${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
		})
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

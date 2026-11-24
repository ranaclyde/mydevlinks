import type { APIRoute } from 'astro';
import { absoluteUrl, NO_INDEX } from '../lib/seo';

export const GET: APIRoute = ({ site }) => {
	const rules = NO_INDEX ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n';
	const body = `${rules}\nSitemap: ${absoluteUrl('/sitemap.xml', site)}\n`;
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

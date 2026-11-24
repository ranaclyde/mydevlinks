import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

interface RawLink {
	id: string;
	name: string;
	private: boolean;
}

const links: RawLink[] = JSON.parse(readFileSync('src/data/links.json', 'utf8'));
const publicLinks = links.filter((link) => !link.private);
const link = publicLinks[0];

test.describe('SEO', () => {
	test.skip(({ isMobile }) => isMobile, 'El head no cambia con el viewport.');

	test('el inicio tiene canonical, Open Graph y datos estructurados', async ({ page }) => {
		await page.goto('/');
		const head = page.locator('head');
		await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/);
		await expect(head.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https?:\/\/.+\/og\.png$/);
		await expect(head.locator('meta[name="robots"]')).toHaveAttribute('content', /^index/);
		const types = await head
			.locator('script[type="application/ld+json"]')
			.evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')['@type']));
		expect(types).toEqual(['WebSite', 'CollectionPage']);
	});

	test('la ficha usa su URL sin barra final y su captura como imagen', async ({ page }) => {
		const response = await page.goto(`/tool/${link.id}`);
		expect(response?.status()).toBe(200);
		const head = page.locator('head');
		await expect(page).toHaveTitle(new RegExp(`^${link.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} · `));
		await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/tool/${link.id}$`));
		await expect(head.locator('meta[property="og:image"]')).toHaveAttribute('content', new RegExp(`/capturas/${link.id}\\.jpg$`));
	});

	test('el sitemap lista el inicio y cada enlace público', async ({ request }) => {
		const body = await (await request.get('/sitemap.xml')).text();
		const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
		expect(locs).toHaveLength(publicLinks.length + 1);
		expect(locs).toContain('/');
		for (const { id } of publicLinks) expect(locs).toContain(`/tool/${id}`);
	});

	test('robots.txt apunta al sitemap', async ({ request }) => {
		const body = await (await request.get('/robots.txt')).text();
		expect(body).toMatch(/^Sitemap: https?:\/\/.+\/sitemap\.xml$/m);
	});

	test('una ruta que no existe muestra la página 404 sin indexar', async ({ page }) => {
		const response = await page.goto('/no-existe');
		expect(response?.status()).toBe(404);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Esta página no existe');
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
	});
});

import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

interface RawLink {
	id: string;
	name: string;
	category: string;
	private: boolean;
}

const links: RawLink[] = JSON.parse(readFileSync('src/data/links.json', 'utf8'));
const publicLinks = links.filter((link) => !link.private);
const link = publicLinks[0];
const categories = [...new Set(publicLinks.map((l) => l.category))];

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
		await expect(head.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/_astro\/[^/]+\.jpg$/);
	});

	test('la página de categoría se indexa, con canonical, migas y la lista de sus enlaces', async ({ page }) => {
		const response = await page.goto(`/category/${link.category}`);
		expect(response?.status()).toBe(200);
		const head = page.locator('head');
		await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/category/${link.category}$`));
		await expect(head.locator('meta[name="robots"]')).toHaveAttribute('content', /^index/);
		await expect(head.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
			'href',
			new RegExp(`/en/category/${link.category}$`),
		);
		const data = await head
			.locator('script[type="application/ld+json"]')
			.evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')));
		expect(data.map((item) => item['@type'])).toEqual(['BreadcrumbList', 'CollectionPage']);
		const inCategory = publicLinks.filter((l) => l.category === link.category);
		expect(data[1].mainEntity.numberOfItems).toBe(inCategory.length);
	});

	test('el sitemap lista el inicio y cada enlace público, y en inglés solo lo traducido', async ({ request }) => {
		const body = await (await request.get('/sitemap.xml')).text();
		const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
		const spanish = locs.filter((path) => path !== '/en' && !path.startsWith('/en/'));
		expect(spanish).toHaveLength(publicLinks.length + categories.length + 1);
		expect(spanish).toContain('/');
		for (const { id } of publicLinks) expect(spanish).toContain(`/tool/${id}`);
		for (const category of categories) expect(spanish).toContain(`/category/${category}`);
		// Las versiones en inglés solo aparecen traducidas, y siempre junto a su par en español.
		for (const path of locs.filter((path) => !spanish.includes(path))) {
			expect(spanish).toContain(path.replace(/^\/en/, '') || '/');
		}
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

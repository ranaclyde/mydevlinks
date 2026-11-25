import { existsSync, readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

interface RawLink {
	id: string;
	name: string;
	private: boolean;
}

const links: RawLink[] = JSON.parse(readFileSync('src/data/links.json', 'utf8'));
const link = links.filter((item) => !item.private)[0];
const english: Array<{ id: string }> = JSON.parse(readFileSync('src/data/en/links.json', 'utf8'));
const publicLinks = links.filter((item) => !item.private);
const descriptionsTranslated = publicLinks.every((item) => english.some((entry) => entry.id === item.id));
/** Un enlace con detalle en español y todavía sin el de inglés. */
const pending = publicLinks.find(
	(item) => existsSync(`src/data/details/${item.id}.json`) && !existsSync(`src/data/en/details/${item.id}.json`),
);

/** Abre el selector de idioma (su botón dice el idioma actual) y elige otro. */
async function chooseLanguage(page: Page, current: string, target: string) {
	await page.getByLabel(current).click();
	await page.getByRole('link', { name: target }).click();
}

test('el directorio en inglés tiene la interfaz en inglés y sus fichas bajo /en/tool', async ({ page }) => {
	await page.goto('/en');
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await expect(page).toHaveTitle(/Curated links for developers/);
	await expect(page.locator('[data-count-label]')).toHaveText('links');
	await expect(page.locator('[data-detail]').first()).toHaveAttribute('href', /^\/en\/tool\//);
	await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', /\/en$/);
});

test('el selector de idioma lleva a la misma ficha en el otro idioma', async ({ page }) => {
	await page.goto(`/tool/${link.id}`);
	await chooseLanguage(page, 'Idioma: Español', 'English');
	await expect(page).toHaveURL(`/en/tool/${link.id}`);
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await page.getByLabel('Language: English').click();
	await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('aria-current', 'true');
	await page.getByRole('link', { name: 'Español' }).click();
	await expect(page).toHaveURL(`/tool/${link.id}`);
});

test('el selector de idioma lleva a la misma categoría en el otro idioma', async ({ page }) => {
	await page.goto('/category/serverless');
	await chooseLanguage(page, 'Idioma: Español', 'English');
	await expect(page).toHaveURL('/en/category/serverless');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Serverless');
	await expect(page.getByRole('link', { name: 'Filter in the directory' })).toHaveAttribute('href', '/en?category=serverless');
});

test('el selector de idioma conserva los filtros del directorio', async ({ page, isMobile }) => {
	test.skip(isMobile, 'El selector es el mismo en móvil.');
	await page.goto('/?category=serverless');
	await chooseLanguage(page, 'Idioma: Español', 'English');
	await expect(page).toHaveURL('/en?category=serverless');
	await expect(page.locator('[data-actives]')).toContainText('Serverless');
	await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();
});

test('en la ficha en inglés, volver lleva al directorio en inglés', async ({ page }) => {
	await page.goto(`/en/tool/${link.id}`);
	await page.getByRole('link', { name: 'Back to the directory' }).click();
	await expect(page).toHaveURL('/en');
});

test.describe('indexación según lo traducido', () => {
	test.skip(({ isMobile }) => isMobile, 'El head no cambia con el viewport.');

	test('el directorio en inglés se indexa solo con todas las descripciones', async ({ page }) => {
		await page.goto('/en');
		const robots = page.locator('meta[name="robots"]');
		const hreflang = page.locator('link[rel="alternate"][hreflang]');
		if (descriptionsTranslated) {
			await expect(robots).toHaveAttribute('content', /^index/);
			await expect(hreflang).toHaveCount(3);
			await expect(page.locator('link[hreflang="es"]')).toHaveAttribute('href', /\/$/);
		} else {
			await expect(robots).toHaveAttribute('content', /noindex/);
			await expect(hreflang).toHaveCount(0);
		}
	});

	test('una ficha sin su detalle en inglés no se indexa ni se anuncia con hreflang', async ({ page }) => {
		test.skip(!pending, 'Todos los detalles están traducidos.');
		await page.goto(`/en/tool/${pending!.id}`);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
		await page.goto(`/tool/${pending!.id}`);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index/);
		await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
	});
});

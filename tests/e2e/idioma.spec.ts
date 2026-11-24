import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

interface RawLink {
	id: string;
	name: string;
	private: boolean;
}

const links: RawLink[] = JSON.parse(readFileSync('src/data/links.json', 'utf8'));
const link = links.filter((item) => !item.private)[0];
const english: Array<{ id: string }> = JSON.parse(readFileSync('src/data/en/links.json', 'utf8'));
const allTranslated = links.filter((item) => !item.private).every((item) => english.some((entry) => entry.id === item.id));

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
	await page.getByRole('link', { name: 'English' }).click();
	await expect(page).toHaveURL(`/en/tool/${link.id}`);
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('aria-current', 'true');
	await page.getByRole('link', { name: 'Español' }).click();
	await expect(page).toHaveURL(`/tool/${link.id}`);
});

test('el selector de idioma conserva los filtros del directorio', async ({ page, isMobile }) => {
	test.skip(isMobile, 'El selector es el mismo en móvil.');
	await page.goto('/?cat=Serverless');
	await page.getByRole('link', { name: 'English' }).click();
	await expect(page).toHaveURL('/en?cat=Serverless');
	await expect(page.locator('[data-actives]')).toContainText('Serverless');
	await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();
});

test('en la ficha en inglés, volver lleva al directorio en inglés', async ({ page }) => {
	await page.goto(`/en/tool/${link.id}`);
	await page.getByRole('link', { name: 'Back to the directory' }).click();
	await expect(page).toHaveURL('/en');
});

test.describe('indexación mientras falte traducir', () => {
	test.skip(allTranslated, 'Ya está todo traducido.');
	test.skip(({ isMobile }) => isMobile, 'El head no cambia con el viewport.');

	test('el inglés sin traducir no se indexa ni se anuncia con hreflang', async ({ page }) => {
		await page.goto('/en');
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
		await page.goto('/');
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index/);
		await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
	});
});

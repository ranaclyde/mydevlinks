import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

interface RawLink {
	id: string;
	name: string;
	url: string;
	category: string;
	private: boolean;
}

const links: RawLink[] = JSON.parse(readFileSync('src/data/links.json', 'utf8'));
const publicLinks = links.filter((link) => !link.private);
const withoutDetail = publicLinks.find((link) => !existsSync(`src/data/detalles/${link.id}.json`));
if (!withoutDetail) throw new Error('Todos los enlaces tienen detalle; falta un caso sin detalle.');
const link = withoutDetail;
const path = `/enlace/${link.id}`;
const domain = new URL(link.url).hostname.replace(/^www\./, '');

test('un enlace sin detalle muestra cabecera y alternativas, sin secciones vacías', async ({ page }) => {
	await page.goto(path);

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(link.name);
	await expect(page.getByRole('link', { name: `Visitar ${domain}` })).toHaveAttribute('target', '_blank');

	const alternatives = page.getByRole('region', { name: 'Alternativas' });
	await expect(alternatives).toBeVisible();
	const cards = alternatives.getByRole('listitem');
	const total = await cards.count();
	expect(total).toBeGreaterThanOrEqual(1);
	expect(total).toBeLessThanOrEqual(4);
	await expect(alternatives.locator(`a[href="${path}"]`)).toHaveCount(0);

	await expect(page.getByRole('heading', { name: '¿Qué es?' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Casos de uso' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Qué revisar antes de elegirlo' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Ficha técnica' })).toHaveCount(0);
});

test('entrar directo y volver lleva al directorio', async ({ page }) => {
	await page.goto(path);
	await page.getByRole('link', { name: 'Volver al directorio' }).click();
	await expect(page).toHaveURL('/');
});

test('volver desde el directorio conserva los filtros', async ({ page }) => {
	await page.goto(`/?cat=${encodeURIComponent(link.category)}`);
	await page.locator(`[data-card][data-name=${JSON.stringify(link.name)}] [data-detail]`).click();
	await expect(page).toHaveURL(path);
	await page.getByRole('link', { name: 'Volver al directorio' }).click();
	await expect(page).toHaveURL(/[?&]cat=/);
});

test('sin JavaScript el detalle se lee completo', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto(path);

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(link.name);
	await expect(page.getByRole('region', { name: 'Alternativas' }).getByRole('listitem').first()).toBeVisible();
	await expect(page.getByRole('link', { name: 'Volver al directorio' })).toHaveAttribute('href', '/');
	await context.close();
});

test('a 390 px no hay desborde horizontal', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto(path);
	const width = await page.evaluate(() => document.documentElement.scrollWidth);
	expect(width).toBeLessThanOrEqual(390);
});

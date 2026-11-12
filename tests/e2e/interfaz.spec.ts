import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, parse } from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { matches } from '../../src/lib/filter';

interface RawLink {
	id: string;
	name: string;
	url: string;
	description?: string;
	category: string;
	tech: string[];
	tags?: string[];
	logo?: string;
	status: string;
	verified: boolean;
	private: boolean;
	featured?: boolean;
}

const links: RawLink[] = JSON.parse(readFileSync('src/data/links.json', 'utf8'));
const publicLinks = links.filter((link) => !link.private);
const allTechs = [...new Set(publicLinks.flatMap((link) => link.tech))];
const TOTAL = String(publicLinks.length);

const count = (page: Page) => page.locator('[data-count-value]');
const visibleCards = (page: Page) => page.locator('[data-card]:visible');

async function openFilters(page: Page, isMobile: boolean) {
	if (isMobile) await page.getByRole('button', { name: /^Filtros/ }).click();
}

/**
 * Las casillas están ocultas a la vista; en móvil pueden quedar bajo la barra fija
 * "Ver resultados" sin salir de la pantalla. Se centran antes de marcarlas.
 */
async function pick(option: Locator) {
	await option.evaluate((el) => el.scrollIntoView({ block: 'center' }));
	await option.check({ force: true });
}

const cardOf = (page: Page, link: RawLink) =>
	page.locator(`[data-card][data-name=${JSON.stringify(link.name)}]`);

function filesIn(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		return statSync(path).isDirectory() ? filesIn(path) : [path];
	});
}

test.beforeEach(async ({ page }, testInfo) => {
	if (testInfo.title.includes('sin JavaScript')) return;
	await page.goto('/');
	await expect(count(page)).toHaveText(TOTAL);
});

test('Componentes + React + Tailwind muestra sus enlaces', async ({ page, isMobile }) => {
	const expected = publicLinks.filter((link) =>
		matches(link, { query: '', category: 'Componentes y UI kits', tech: ['React', 'Tailwind'] }),
	).length;
	expect(expected).toBeGreaterThan(0);

	await openFilters(page, isMobile);
	await pick(page.getByRole('radio', { name: /Componentes y UI kits/ }));
	await pick(page.getByRole('checkbox', { name: /^React\s/ }));
	await pick(page.getByRole('checkbox', { name: /^Tailwind/ }));

	await expect(count(page)).toHaveText(String(expected));
	await expect(visibleCards(page)).toHaveCount(expected);
	await expect(visibleCards(page).first().locator('.chip.hit')).toHaveCount(2);
	await expect(visibleCards(page).first().locator('.chip').nth(0)).toHaveClass(/hit/);
});

test('animacion encuentra los enlaces de Animación', async ({ page }) => {
	await page.getByRole('searchbox', { name: 'Buscar' }).fill('animacion');

	const inCategory = publicLinks.filter((link) => link.category === 'Animación y efectos');
	const shown = Number(await count(page).textContent());
	expect(shown).toBeGreaterThanOrEqual(inCategory.length);
	await expect(page.locator(`[data-card][data-category="Animación y efectos"]:visible`)).toHaveCount(
		inCategory.length,
	);
});

test('react en la búsqueda activa el filtro y resalta la tecnología', async ({ page, isMobile }) => {
	await page.getByRole('searchbox', { name: 'Buscar' }).fill('react');

	const state = { query: 'react', category: null, tech: [] };
	const found = publicLinks.filter((link) => matches(link, state, allTechs));
	await expect(count(page)).toHaveText(String(found.length));
	await expect(page.getByRole('button', { name: 'Quitar React' })).toBeVisible();
	await expect(visibleCards(page).first().locator('.chip.hit')).toHaveText('React');
	await expect(visibleCards(page).first().locator('.chip').first()).toHaveText('React');

	// La casilla es más estricta que la búsqueda, así que marcarla sigue siendo una decisión aparte.
	await openFilters(page, isMobile);
	const box = page.getByRole('checkbox', { name: /^React\s/ });
	await expect(box).not.toBeChecked();
	await pick(box);
	const tagged = publicLinks.filter((link) => link.tech.includes('React'));
	await expect(count(page)).toHaveText(String(tagged.length));
});

test('un enlace se encuentra por su nombre aunque nombre una tecnología que no tiene', async ({
	page,
}) => {
	const link = publicLinks.find((item) => item.name === 'Blobs! (CSS-Tricks)') as RawLink;
	expect(link.tech).not.toContain('CSS');

	await page.getByRole('searchbox', { name: 'Buscar' }).fill('css blobs');
	await expect(cardOf(page, link)).toBeVisible();
	await expect(page.getByRole('button', { name: 'Quitar CSS' })).toBeVisible();
});

test('quitar la píldora de una tecnología escrita la borra de la búsqueda', async ({ page }) => {
	const search = page.getByRole('searchbox', { name: 'Buscar' });
	await search.fill('react tabla');
	await page.getByRole('button', { name: 'Quitar React' }).click();
	await expect(search).toHaveValue('tabla');
});

test('los conteos del panel reflejan los demás filtros y las opciones en 0 se deshabilitan', async ({
	page,
	isMobile,
}) => {
	await openFilters(page, isMobile);
	await pick(page.getByRole('radio', { name: /Fuentes y color/ }));

	const zero = page.getByRole('checkbox', { name: /^Angular/ });
	await expect(zero).toBeDisabled();
	await expect(page.locator('label:has(input[value="Angular"]) [data-count]')).toHaveText('0');
});

test('una búsqueda sin resultados ofrece Limpiar filtros y este restaura todos', async ({ page }) => {
	await page.getByRole('searchbox', { name: 'Buscar' }).fill('zzzzkanban');

	await expect(count(page)).toHaveText('0');
	await expect(page.getByText('Ningún enlace coincide con «zzzzkanban».')).toBeVisible();
	await page.getByRole('button', { name: 'Limpiar filtros' }).click();

	await expect(count(page)).toHaveText(TOTAL);
	await expect(visibleCards(page)).toHaveCount(publicLinks.length);
	await expect(page.getByRole('searchbox', { name: 'Buscar' })).toHaveValue('');
});

test('Ver las N muestra todas las tecnologías y permite filtrarlas', async ({ page, isMobile }) => {
	await openFilters(page, isMobile);
	await expect(page.locator('[data-tech-option]:visible')).toHaveCount(12);

	await page.getByRole('button', { name: /^Ver las \d+/ }).click();
	await expect(page.getByRole('searchbox', { name: 'Filtrar la lista' })).toBeFocused();
	const total = new Set(publicLinks.flatMap((link) => link.tech)).size;
	await expect(page.locator('[data-tech-option]:visible')).toHaveCount(total);

	await page.getByRole('searchbox', { name: 'Filtrar la lista' }).fill('post');
	await expect(page.locator('[data-tech-option]:visible')).toHaveText([/PostgreSQL/]);
});

test('ningún logo está roto', async ({ page }) => {
	const failed: string[] = [];
	page.on('response', (response) => {
		if (response.url().includes('/logos/') && !response.ok()) failed.push(response.url());
	});

	// `onerror` quita las imágenes rotas, así que faltar una en la cuenta también es un fallo.
	await page.evaluate(async () => {
		const images = [...document.images];
		for (const image of images) image.loading = 'eager';
		await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
	});

	const expected = publicLinks.filter((link) => link.logo).length;
	await expect(page.locator('[data-card] img')).toHaveCount(expected);
	const broken = await page.evaluate(() =>
		[...document.images].filter((image) => image.naturalWidth === 0).map((image) => image.src),
	);
	expect([...failed, ...broken]).toEqual([]);
});

test('a 390 px no hay desborde y el panel empieza contraído', async ({ page, isMobile }) => {
	test.skip(!isMobile, 'solo móvil');

	const noOverflow = () =>
		page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
	expect(await noOverflow()).toBe(true);

	const toggle = page.getByRole('button', { name: /^Filtros/ });
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	await expect(page.getByRole('radio', { name: 'Todas' })).toBeHidden();
	await expect(page.getByRole('button', { name: /^Ver \d+ enlaces?/ })).toBeHidden();

	await toggle.click();
	expect(await noOverflow()).toBe(true);
	const show = page.getByRole('button', { name: `Ver ${TOTAL} enlaces` });
	await expect(show).toBeVisible();
	await show.click();

	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	await expect(show).toBeHidden();
	await expect(page.locator('#resultados')).toBeFocused();
});

test('una consulta larga sin espacios no desborda a 390 px', async ({ page, isMobile }) => {
	test.skip(!isMobile, 'solo móvil');

	await page.getByRole('searchbox', { name: 'Buscar' }).fill('x'.repeat(300));
	await expect(count(page)).toHaveText('0');
	await expect(page.locator('[data-empty-text]')).toBeVisible();
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - window.innerWidth,
	);
	expect(overflow).toBeLessThanOrEqual(0);
});

test('los avisos se ven con palabra y estilo en enlaces reales', async ({ page }) => {
	// Los datos pueden no tener antiguos, sin verificar ni caídos: cada sello se comprueba si hay uno.
	const old = publicLinks.find((link) => link.status === 'antiguo' && link.verified);
	const unverified = publicLinks.find((link) => link.status === 'activo' && !link.verified);
	const lost = publicLinks.filter((link) => link.status === 'caido' && !link.verified);
	test.skip(!old && !unverified && !lost.length, 'no hay enlaces con aviso en los datos');

	if (old) await expect(cardOf(page, old).getByText('Antiguo', { exact: true })).toBeVisible();

	if (unverified) {
		const pending = cardOf(page, unverified);
		await expect(pending.getByText('Sin verificar', { exact: true })).toBeVisible();
		await expect(pending.getByText('Todavía sin descripción ni tecnologías.')).toBeVisible();
		await expect(pending.locator('a')).toHaveCSS('border-top-style', 'dashed');
		await expect(pending.locator('.chip')).toHaveCount(0);
	}

	for (const link of lost) {
		const card = cardOf(page, link);
		await expect(card.getByText('Caído', { exact: true })).toBeVisible();
		await expect(card.getByText('Sin verificar', { exact: true })).toHaveCount(0);
		await expect(card.getByText('Sin descripción: el sitio no responde.')).toBeVisible();
		await expect(card.locator('a')).toHaveCSS('border-top-style', 'dashed');
		await expect(card.locator('.chip')).toHaveCount(0);
	}
});

test('los destacados van primero, con tinte y estrella', async ({ page }) => {
	const featured = publicLinks.filter((link) => link.featured);
	test.skip(!featured.length, 'no hay destacados en los datos');

	const first = page.locator('[data-card]').first();
	expect(featured.map((link) => link.name)).toContain(await first.getAttribute('data-name'));
	for (const link of featured) {
		const card = cardOf(page, link);
		await expect(card.locator('a.f-feat .ficha-star')).toBeVisible();
		await expect(card.locator('a')).toContainText('Destacado.');
	}
});

test('el teclado llega a Saltar a resultados', async ({ page, isMobile }) => {
	test.skip(isMobile, 'requiere teclado');

	await page.keyboard.press('Tab');
	const skip = page.getByRole('link', { name: 'Saltar a resultados' });
	await expect(skip).toBeFocused();
	await expect(skip).toBeInViewport();
	await page.keyboard.press('Enter');
	await expect(page.locator('#resultados')).toBeFocused();
});

test('al quitar un filtro el foco no cae en body', async ({ page, isMobile }) => {
	await openFilters(page, isMobile);
	await pick(page.getByRole('checkbox', { name: /^React\s/ }));
	await pick(page.getByRole('checkbox', { name: /^Tailwind/ }));

	await page.getByRole('button', { name: 'Quitar React' }).focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('button', { name: 'Quitar Tailwind' })).toBeFocused();

	await page.keyboard.press('Enter');
	await expect(page.locator('#resultados')).toBeFocused();
	await expect(count(page)).toHaveText(TOTAL);
});

test('una opción en 0 marcada se puede desmarcar', async ({ page, isMobile }) => {
	await openFilters(page, isMobile);
	await pick(page.getByRole('checkbox', { name: /^React\s/ }));
	await page.getByRole('searchbox', { name: 'Buscar' }).fill('zzzz');

	await expect(count(page)).toHaveText('0');
	await expect(page.getByRole('checkbox', { name: /^React\s/ })).toBeEnabled();
	await expect(page.getByRole('checkbox', { name: /^Vue/ })).toBeDisabled();
});

test('el tema elegido se guarda', async ({ page }) => {
	await page.getByRole('button', { name: 'Modo oscuro' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await expect(page.getByRole('button', { name: 'Modo oscuro' })).toHaveAttribute(
		'aria-pressed',
		'true',
	);

	await page.getByRole('button', { name: 'Tema del sistema' }).click();
	await expect(page.locator('html')).not.toHaveAttribute('data-theme');
});

test('un tema guardado no válido vuelve al del sistema', async ({ page }) => {
	await page.evaluate(() => localStorage.setItem('mdl-theme', 'rosa'));
	await page.reload();

	await expect(page.locator('html')).not.toHaveAttribute('data-theme');
	await expect(page.getByRole('button', { name: 'Tema del sistema' })).toHaveAttribute(
		'aria-pressed',
		'true',
	);
});

test.describe('sin JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('sin JavaScript se ven todas las fichas', async ({ page }) => {
		await page.goto('/');
		await expect(visibleCards(page)).toHaveCount(publicLinks.length);
		await expect(page.locator('[data-side]')).toBeHidden();
	});
});

test('ningún enlace privado aparece en el build', () => {
	const files = filesIn('dist');
	expect(files.length).toBeGreaterThan(0);

	for (const link of links.filter((item) => item.private)) {
		const url = new URL(link.url);
		const needles = [link.name, link.url.replace(/\/$/, ''), url.hostname].map((text) =>
			text.toLowerCase(),
		);
		const logoStems = [link.id, ...(link.logo ? [parse(link.logo).name] : [])];

		for (const file of files) {
			expect(logoStems).not.toContain(parse(file).name);
			const path = file.toLowerCase();
			const content = readFileSync(file, 'latin1').toLowerCase();
			for (const needle of needles) {
				expect(path).not.toContain(needle);
				expect(content.includes(needle), `${needle} en ${file}`).toBe(false);
			}
		}
	}
});

test('en táctil la lista de +N se ve sin filtros', async ({ page, isMobile }) => {
	test.skip(!isMobile, 'solo táctil');

	const link = publicLinks.find((item) => item.tech.length > 5) as RawLink;
	const card = cardOf(page, link);
	await expect(card.locator('[data-more]')).toBeHidden();
	await expect(card.locator('.chip:visible')).toHaveCount(link.tech.length);
});

test('el final del panel se alcanza con la rueda y la página arriba', async ({ page, isMobile }) => {
	test.skip(isMobile, 'solo escritorio');

	const more = page.getByRole('button', { name: /^Ver las \d+/ });
	await expect(more).not.toBeInViewport({ ratio: 1 });

	await page.mouse.move(130, 400);
	await page.mouse.wheel(0, 5000);

	await expect(more).toBeInViewport({ ratio: 1 });
	expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('el tipo de galería filtra dentro de Galerías y se pierde al cambiar de categoría', async ({
	page,
	isMobile,
}) => {
	const GALLERY = 'Galerías de inspiración';
	const galleries = publicLinks.filter((link) => link.category === GALLERY);
	const sections = galleries.filter((link) => link.tags?.includes('Secciones'));
	expect(sections.length).toBeGreaterThan(0);

	await openFilters(page, isMobile);
	await expect(page.getByRole('group', { name: 'Tipo de galería' })).toBeHidden();

	await pick(page.getByRole('radio', { name: /Galerías de inspiración/ }));
	await expect(page.getByRole('group', { name: 'Tipo de galería' })).toBeVisible();
	await pick(page.getByRole('radio', { name: /^Secciones/ }));

	await expect(count(page)).toHaveText(String(sections.length));
	await expect(page.getByRole('button', { name: 'Quitar tipo Secciones' })).toBeVisible();
	await expect(visibleCards(page).first().locator('[data-tag="Secciones"]')).toBeVisible();

	await pick(page.getByRole('radio', { name: /Componentes y UI kits/ }));
	await expect(page.getByRole('group', { name: 'Tipo de galería' })).toBeHidden();
	await expect(page.getByRole('button', { name: /^Quitar tipo/ })).toHaveCount(0);
});

test('los filtros se guardan en la URL y sobreviven a recargar', async ({ page, isMobile }) => {
	await openFilters(page, isMobile);
	await pick(page.getByRole('radio', { name: /Componentes y UI kits/ }));
	await pick(page.getByRole('checkbox', { name: /^React\s/ }));

	const expected = publicLinks.filter((link) =>
		matches(link, { query: '', category: 'Componentes y UI kits', tech: ['React'] }),
	).length;
	await expect(count(page)).toHaveText(String(expected));
	await expect.poll(() => page.url()).toContain('cat=');
	expect(page.url()).toContain('tech=React');

	await page.reload();
	await expect(count(page)).toHaveText(String(expected));
	await expect(page.getByRole('button', { name: 'Quitar React' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Quitar categoría Componentes y UI kits' })).toBeVisible();
	await openFilters(page, isMobile);
	await expect(page.getByRole('checkbox', { name: /^React\s/ })).toBeChecked();
	await expect(page.getByRole('radio', { name: /Componentes y UI kits/ })).toBeChecked();
});

test('parámetros inválidos en la URL no rompen el directorio', async ({ page }) => {
	await page.goto('/?cat=Nada&tech=Foo');
	await expect(count(page)).toHaveText(TOTAL);
	await expect.poll(() => new URL(page.url()).search).toBe('');
});

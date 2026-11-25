import { getCollection } from 'astro:content';
import type { Locale } from '../i18n/ui';
import { alternativesFor } from './alternatives';
import { CATEGORIES, sortLinks, visibleLinks, type Link } from './links';
import type { Detail } from './details';
import { localize, type Localized } from './translations';

/**
 * Enlaces visibles, ordenados, con su detalle y los textos en `locale`. En español todo
 * está traducido; en inglés, lo que falte queda en español y marcado como no traducido.
 */
export async function loadCatalog(locale: Locale, isDev = import.meta.env.DEV): Promise<Localized[]> {
	const links = sortLinks(visibleLinks((await getCollection('links')).map((entry) => entry.data), isDev));
	const details = new Map((await getCollection('details')).map((entry) => [entry.id, entry.data]));
	if (locale === 'es') {
		return links.map((link) => ({
			link,
			detail: details.get(link.id),
			translated: true,
			descriptionTranslated: true,
		}));
	}
	const linkTexts = new Map((await getCollection('linksEn')).map((entry) => [entry.id, entry.data]));
	const detailTexts = new Map((await getCollection('detailsEn')).map((entry) => [entry.id, entry.data]));
	return links.map((link) =>
		localize(link, details.get(link.id), linkTexts.get(link.id), detailTexts.get(link.id)),
	);
}

/**
 * El directorio en inglés está traducido. Solo muestra nombre, descripción y etiquetas, así
 * que basta con las descripciones; los detalles se traducen aparte, ficha por ficha.
 */
export async function directoryTranslated(isDev = import.meta.env.DEV): Promise<boolean> {
	return (await loadCatalog('en', isDev)).every((item) => item.descriptionTranslated);
}

/** Rutas de las fichas en `locale`, para `getStaticPaths`. */
export async function toolPaths(locale: Locale) {
	const items = await loadCatalog(locale);
	const english = new Map((await loadCatalog('en')).map((item) => [item.link.id, item.translated]));
	const links = items.map((item) => item.link);
	return items.map(({ link, detail }) => ({
		params: { id: link.id },
		props: {
			link,
			detail,
			translated: english.get(link.id) ?? false,
			alternatives: alternativesFor(link, links, detail?.alternatives),
			total: items.length,
		},
	}));
}

export interface CategoryEntry {
	link: Link;
	pricing?: Detail['pricing'];
}

/**
 * Rutas de las páginas de categoría en `locale`, para `getStaticPaths`. Solo las categorías con
 * enlaces visibles. Una categoría está traducida cuando lo están las descripciones de sus enlaces,
 * que es todo lo que muestra de ellos.
 */
export async function categoryPaths(locale: Locale) {
	const items = await loadCatalog(locale);
	const english = await loadCatalog('en');
	const counts = CATEGORIES.map((id) => ({ id, count: items.filter((item) => item.link.category === id).length })).filter(
		(category) => category.count > 0,
	);
	return counts.map(({ id }) => ({
		params: { id },
		props: {
			category: id,
			entries: items
				.filter((item) => item.link.category === id)
				.map(({ link, detail }): CategoryEntry => ({ link, pricing: detail?.pricing })),
			categories: counts,
			translated: english.filter((item) => item.link.category === id).every((item) => item.descriptionTranslated),
			total: items.length,
		},
	}));
}

/** Fecha de la revisión más reciente de cada categoría, para el sitemap. */
export function categoryLastmod(items: Localized[]): Map<string, string> {
	const dates = new Map<string, string>();
	for (const { link, detail } of items) {
		const current = dates.get(link.category);
		if (detail && (!current || detail.reviewedAt > current)) dates.set(link.category, detail.reviewedAt);
	}
	return dates;
}

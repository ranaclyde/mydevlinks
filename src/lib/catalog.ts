import { getCollection } from 'astro:content';
import type { Locale } from '../i18n/ui';
import { alternativesFor } from './alternatives';
import { sortLinks, visibleLinks } from './links';
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

import type { PRICING } from '../lib/details';
import type { CATEGORIES, GALLERY_TAGS, STATUSES } from '../lib/links';

/** Idiomas del sitio, en el mismo orden que `i18n.locales` de astro.config.mjs. */
export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'es';

export const LOCALE_NAME: Record<Locale, string> = { es: 'Español', en: 'English' };
export const OG_LOCALE: Record<Locale, string> = { es: 'es_ES', en: 'en_US' };

/** `Astro.currentLocale` o `<html lang>` como uno de los idiomas del sitio; si no, el de por defecto. */
export function toLocale(value: string | undefined | null): Locale {
	return LOCALES.find((locale) => locale === value) ?? DEFAULT_LOCALE;
}

/**
 * Ruta de una página en un idioma, a partir de su ruta en español: `/` -> `/en`,
 * `/tool/x` -> `/en/tool/x`. Sin barra final, como sirve Netlify los `.html` de `build.format: 'file'`.
 */
export function localizePath(path: string, locale: Locale): string {
	if (locale === DEFAULT_LOCALE) return path;
	return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

type Category = (typeof CATEGORIES)[number];
type Tag = (typeof GALLERY_TAGS)[number];
type Pricing = (typeof PRICING)[number];
type Status = (typeof STATUSES)[number];

const es = {
	siteDescription:
		'Enlaces curados para desarrollar: componentes, inspiración, iconos, fuentes y herramientas, filtrables por categoría, tecnología y texto.',
	homeTitle: 'Enlaces curados para desarrolladores',
	homeDescription: (count: number) =>
		`${count} enlaces curados para desarrollar: componentes y UI kits, galerías de inspiración, iconos, fuentes y herramientas, filtrables por categoría y tecnología.`,
	collectionName: 'enlaces para desarrolladores',
	ogAlt: 'toolshelf: enlaces curados para desarrollar',
	links: (count: number): string => (count === 1 ? 'enlace' : 'enlaces'),
	skipToResults: 'Saltar a resultados',
	noScript: 'Sin JavaScript no hay filtros, pero están todos los enlaces.',
	noResults: 'Sin resultados',
	noResultsHint: 'Prueba con otra palabra o quita alguna tecnología.',
	clearFilters: 'Limpiar filtros',

	theme: 'Tema',
	themeSystem: 'Sistema',
	themeLight: 'Claro',
	themeDark: 'Oscuro',
	language: 'Idioma',

	filters: 'Filtros',
	search: 'Buscar',
	searchPlaceholder: 'Nombre, tema, tecnología o URL',
	category: 'Categoría',
	allCategories: 'Todas',
	galleryType: 'Tipo de galería',
	allTypes: 'Todos los tipos',
	price: 'Precio',
	priceHint: 'basta con uno',
	technologies: 'Tecnologías',
	techHint: 'deben usar todas',
	techFilterLabel: 'Filtrar la lista de tecnologías',
	techFilterPlaceholder: 'Filtrar la lista',
	techNone: 'Ninguna tecnología coincide.',
	techMore: (count: number) => `Ver las ${count}`,
	seeLess: 'Ver menos',
	seeLessTech: 'Ver menos tecnologías',
	seeMoreTech: (count: number) => `Ver ${count} tecnologías más`,
	showResults: (count: number) => `Ver ${count} ${count === 1 ? 'enlace' : 'enlaces'}`,
	removeSearch: (text: string) => `Quitar búsqueda «${text}»`,
	removeCategory: (name: string) => `Quitar categoría ${name}`,
	removeType: (name: string) => `Quitar tipo ${name}`,
	removePrice: (name: string) => `Quitar precio ${name}`,
	removeTech: (name: string) => `Quitar ${name}`,
	emptyIntro: 'Ningún enlace coincide',
	emptyWith: (text: string) => `con «${text}»`,
	emptyIn: (name: string) => `en ${name}`,
	emptyOfType: (name: string) => `de tipo ${name}`,
	emptyTechs: (list: string) => `con ${list}`,
	or: 'o',
	and: 'y',

	featured: 'Destacado. ',
	openExternal: (name: string) => `Abrir ${name} en otra pestaña`,
	priceLabel: 'Precio: ',
	techList: (list: string) => `Tecnologías: ${list}.`,
	typeList: (list: string) => `Tipo: ${list}.`,
	noDescriptionDown: 'Sin descripción: el sitio no responde.',
	noDescription: 'Todavía sin descripción ni tecnologías.',

	directory: 'Directorio',
	backToDirectory: 'Volver al directorio',
	breadcrumb: 'Ruta',
	visit: (domain: string) => `Visitar ${domain}`,
	opensInNewTab: '(abre en otra pestaña)',
	inCategory: (name: string, category: string) => `${name}, en ${category}.`,
	detailMetaExtra: (price: string) => `${price}. Casos de uso, qué revisar y alternativas.`,
	screenshotOf: (name: string) => `Captura de ${name}`,
	screenshotFrom: (date: string) => `Captura del ${date}`,
	noScreenshot: 'El sitio no responde; no hay captura',
	whatIs: '¿Qué es?',
	useCases: 'Casos de uso',
	caveats: 'Qué revisar antes de elegirlo',
	alternatives: 'Alternativas',
	seeCategory: 'Ver toda la categoría',
	techSheet: 'Ficha técnica',
	plans: 'Planes',
	seePricing: (domain: string) => `Ver precios en ${domain}`,
	idealFor: 'Ideal para',
	lastReview: 'Última revisión',
	generated: 'Descripción generada a partir del sitio',
	untranslated: '',

	notFoundTitle: 'Página no encontrada',
	notFoundDescription: 'Esta página no existe.',
	notFoundHeading: 'Esta página no existe',
	notFoundText: 'Puede que el enlace haya cambiado de nombre o que ya no esté en el directorio.',

	categories: {
		components: 'Componentes y UI kits',
		animation: 'Animación y efectos',
		inspiration: 'Galerías de inspiración',
		icons: 'Iconos e ilustraciones',
		'fonts-color': 'Fuentes y color',
		generators: 'Generadores CSS/SVG',
		'developer-tools': 'Herramientas de desarrollo',
		serverless: 'Serverless',
		'ai-builders': 'Constructores con IA',
		learning: 'Aprendizaje y documentación',
		directories: 'Directorios de recursos',
	} satisfies Record<Category, string>,
	tags: {
		websites: 'Sitios web',
		'landing-pages': 'Landing pages',
		sections: 'Secciones',
		'app-ui': 'Interfaces de apps',
		motion: 'Movimiento',
		'visual-styles': 'Estilos visuales',
		'design-systems': 'Sistemas de diseño',
		branding: 'Marca y portafolios',
	} satisfies Record<Tag, string>,
	pricing: {
		free: 'Gratis',
		freemium: 'Freemium',
		paid: 'De pago',
	} satisfies Record<Pricing, string>,
	status: {
		active: 'Activo',
		outdated: 'Antiguo',
		down: 'Caído',
	} satisfies Record<Status, string>,
	unverified: 'Sin verificar',
	dateLocale: 'es',
};

export type Dictionary = typeof es;

const en: Dictionary = {
	siteDescription:
		'Curated links for developers: components, inspiration, icons, fonts and tools, filterable by category, technology and text.',
	homeTitle: 'Curated links for developers',
	homeDescription: (count) =>
		`${count} curated links for developers: components and UI kits, inspiration galleries, icons, fonts and tools, filterable by category and technology.`,
	collectionName: 'links for developers',
	ogAlt: 'toolshelf: curated links for developers',
	links: (count) => (count === 1 ? 'link' : 'links'),
	skipToResults: 'Skip to results',
	noScript: 'Filters need JavaScript, but every link is listed.',
	noResults: 'No results',
	noResultsHint: 'Try another word or remove a technology.',
	clearFilters: 'Clear filters',

	theme: 'Theme',
	themeSystem: 'System',
	themeLight: 'Light',
	themeDark: 'Dark',
	language: 'Language',

	filters: 'Filters',
	search: 'Search',
	searchPlaceholder: 'Name, topic, technology or URL',
	category: 'Category',
	allCategories: 'All',
	galleryType: 'Gallery type',
	allTypes: 'All types',
	price: 'Price',
	priceHint: 'any of them',
	technologies: 'Technologies',
	techHint: 'must use all',
	techFilterLabel: 'Filter the technology list',
	techFilterPlaceholder: 'Filter the list',
	techNone: 'No technology matches.',
	techMore: (count) => `Show all ${count}`,
	seeLess: 'Show less',
	seeLessTech: 'Show fewer technologies',
	seeMoreTech: (count) => `Show ${count} more technologies`,
	showResults: (count) => `Show ${count} ${count === 1 ? 'link' : 'links'}`,
	removeSearch: (text) => `Remove search “${text}”`,
	removeCategory: (name) => `Remove category ${name}`,
	removeType: (name) => `Remove type ${name}`,
	removePrice: (name) => `Remove price ${name}`,
	removeTech: (name) => `Remove ${name}`,
	emptyIntro: 'No link matches',
	emptyWith: (text) => `“${text}”`,
	emptyIn: (name) => `in ${name}`,
	emptyOfType: (name) => `of type ${name}`,
	emptyTechs: (list) => `with ${list}`,
	or: 'or',
	and: 'and',

	featured: 'Featured. ',
	openExternal: (name) => `Open ${name} in a new tab`,
	priceLabel: 'Price: ',
	techList: (list) => `Technologies: ${list}.`,
	typeList: (list) => `Type: ${list}.`,
	noDescriptionDown: 'No description: the site is not responding.',
	noDescription: 'No description or technologies yet.',

	directory: 'Directory',
	backToDirectory: 'Back to the directory',
	breadcrumb: 'Breadcrumb',
	visit: (domain) => `Visit ${domain}`,
	opensInNewTab: '(opens in a new tab)',
	inCategory: (name, category) => `${name}, in ${category}.`,
	detailMetaExtra: (price) => `${price}. Use cases, what to check and alternatives.`,
	screenshotOf: (name) => `Screenshot of ${name}`,
	screenshotFrom: (date) => `Screenshot from ${date}`,
	noScreenshot: 'The site is not responding; no screenshot',
	whatIs: 'What is it?',
	useCases: 'Use cases',
	caveats: 'What to check before choosing it',
	alternatives: 'Alternatives',
	seeCategory: 'See the whole category',
	techSheet: 'Fact sheet',
	plans: 'Plans',
	seePricing: (domain) => `See pricing on ${domain}`,
	idealFor: 'Ideal for',
	lastReview: 'Last reviewed',
	generated: 'Description generated from the site',
	untranslated: 'This page is not translated into English yet.',

	notFoundTitle: 'Page not found',
	notFoundDescription: 'This page does not exist.',
	notFoundHeading: 'This page does not exist',
	notFoundText: 'The link may have been renamed or may no longer be in the directory.',

	categories: {
		components: 'Components and UI kits',
		animation: 'Animation and effects',
		inspiration: 'Inspiration galleries',
		icons: 'Icons and illustrations',
		'fonts-color': 'Fonts and color',
		generators: 'CSS/SVG generators',
		'developer-tools': 'Developer tools',
		serverless: 'Serverless',
		'ai-builders': 'AI builders',
		learning: 'Learning and docs',
		directories: 'Resource directories',
	},
	tags: {
		websites: 'Websites',
		'landing-pages': 'Landing pages',
		sections: 'Sections',
		'app-ui': 'App interfaces',
		motion: 'Motion',
		'visual-styles': 'Visual styles',
		'design-systems': 'Design systems',
		branding: 'Branding and portfolios',
	},
	pricing: {
		free: 'Free',
		freemium: 'Freemium',
		paid: 'Paid',
	},
	status: {
		active: 'Active',
		outdated: 'Outdated',
		down: 'Down',
	},
	unverified: 'Unverified',
	dateLocale: 'en',
};

export const UI: Record<Locale, Dictionary> = { es, en };

/** Diccionario del idioma; acepta `Astro.currentLocale` o `document.documentElement.lang`. */
export function useTranslations(locale: string | undefined | null): Dictionary {
	return UI[toLocale(locale)];
}

/** Nombre visible de una categoría, un tipo de galería o un precio; el valor interno no cambia. */
export function labelOf(t: Dictionary, value: string): string {
	return (
		(t.categories as Record<string, string>)[value] ??
		(t.tags as Record<string, string>)[value] ??
		(t.pricing as Record<string, string>)[value] ??
		value
	);
}

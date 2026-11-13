/** Tecnologías visibles en una ficha antes de resumirlas en "+N". */
export const VISIBLE_TECH = 5;
/** Tecnologías del panel antes de "Ver las N". */
export const TOP_TECHS = 12;

/** Otras formas de escribir una tecnología, normalizadas, con su nombre canónico. */
export const TECH_ALIASES: Record<string, string> = {
	'vue.js': 'Vue',
	vuejs: 'Vue',
	'vue js': 'Vue',
	reactjs: 'React',
	'react.js': 'React',
	'react js': 'React',
	reactnative: 'React Native',
	'react-native': 'React Native',
	nextjs: 'Next.js',
	'next js': 'Next.js',
	nuxtjs: 'Nuxt',
	'nuxt.js': 'Nuxt',
	'nuxt js': 'Nuxt',
	tailwindcss: 'Tailwind',
	'tailwind css': 'Tailwind',
	nodejs: 'Node.js',
	'node js': 'Node.js',
	alpinejs: 'Alpine.js',
	'alpine js': 'Alpine.js',
	sveltejs: 'Svelte',
	'svelte.js': 'Svelte',
	solidjs: 'Solid',
	'solid.js': 'Solid',
	postgres: 'PostgreSQL',
	mongo: 'MongoDB',
	golang: 'Go',
};

/** Hasta este largo una palabra busca al inicio de otra: "ia" no debe caer en "galerías". */
const SHORT_WORD = 3;

export interface FilterItem {
	name: string;
	description?: string;
	category: string;
	tech: string[];
	tags?: string[];
	url?: string;
	/** Precio de su ficha; sin ficha no lo tiene. */
	pricing?: string;
}

export interface FilterState {
	query: string;
	category: string | null;
	tech: string[];
	/** Etiqueta de galería; solo tiene sentido con la categoría de galerías. */
	tag?: string | null;
	/** Precios marcados: basta con tener uno de ellos. */
	pricing?: string[];
}

interface Segment {
	text: string;
	tech: string | null;
}

export function normalize(text: string): string {
	return text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
}

/** Corta la consulta en palabras y tecnologías; una tecnología puede ocupar varias palabras. */
function segments(query: string, techs: string[]): Segment[] {
	const byName = new Map(techs.map((tech) => [normalize(tech), tech]));
	for (const [alias, tech] of Object.entries(TECH_ALIASES)) {
		if (techs.includes(tech) && !byName.has(alias)) byName.set(alias, tech);
	}
	const longest = Math.max(1, ...[...byName.keys()].map((name) => name.split(' ').length));
	const tokens = query.trim().split(/\s+/).filter(Boolean);
	const result: Segment[] = [];

	for (let i = 0; i < tokens.length; ) {
		let size = Math.min(longest, tokens.length - i);
		while (size > 0 && !byName.has(normalize(tokens.slice(i, i + size).join(' ')))) size--;
		if (size === 0) {
			result.push({ text: tokens[i], tech: null });
			i++;
		} else {
			const text = tokens.slice(i, i + size).join(' ');
			result.push({ text, tech: byName.get(normalize(text)) ?? null });
			i += size;
		}
	}
	return result;
}

export function splitQuery(query: string, techs: string[]): { techs: string[]; words: string[] } {
	const parts = segments(query, techs);
	return {
		techs: [...new Set(parts.flatMap((part) => (part.tech ? [part.tech] : [])))],
		words: parts.filter((part) => !part.tech).map((part) => part.text),
	};
}

/** Tecnologías en juego: las casillas marcadas más las escritas en la consulta. */
export function activeTechs(state: FilterState, techs: string[]): string[] {
	return [...new Set([...state.tech, ...splitQuery(state.query, techs).techs])];
}

export function queryWithoutTech(query: string, tech: string, techs: string[]): string {
	return segments(query, techs)
		.filter((part) => part.tech !== tech)
		.map((part) => part.text)
		.join(' ');
}

export function queryWithoutWords(query: string, techs: string[]): string {
	return segments(query, techs)
		.filter((part) => part.tech)
		.map((part) => part.text)
		.join(' ');
}

/**
 * La URL tal como se busca: sin protocolo, sin `www.`, sin consulta ni fragmento y sin barra final.
 * Así "https", "http" o "www" no coinciden con todas las fichas, y "vercel.app" o "github.com/x" sí.
 */
export function searchableUrl(url: string): string {
	return normalize(url)
		.replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
		.replace(/^www\./, '')
		.replace(/[?#].*$/, '')
		.replace(/\/+$/, '');
}

/** Quita de lo escrito el protocolo, `www.` y la barra final, para pegar una URL tal cual. */
function typedUrlPart(word: string): string {
	const stripped = word
		.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
		.replace(/^www\./i, '')
		.replace(/\/+$/, '');
	return stripped || word;
}

function haystack(item: FilterItem): string {
	return normalize(
		[
			item.name,
			item.description ?? '',
			item.tech.join(' '),
			item.category,
			...(item.tags ?? []),
			item.url ? searchableUrl(item.url) : '',
		].join(' '),
	);
}

function wholeWord(text: string): RegExp {
	return new RegExp(`${wordStartSource(text)}(?![\\p{L}\\p{N}])`, 'u');
}

function wordStartSource(text: string): string {
	const escaped = normalize(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return `(?<![\\p{L}\\p{N}])${escaped}`;
}

/** Todas las formas de una tecnología, para que `vue.js` y `vue` den lo mismo. */
function mentionsOf(tech: string): RegExp[] {
	const aliases = Object.keys(TECH_ALIASES).filter((alias) => TECH_ALIASES[alias] === tech);
	return [tech, ...aliases].map(wholeWord);
}

function wordTest(word: string): (text: string) => boolean {
	const needle = normalize(typedUrlPart(word));
	if (needle.length > SHORT_WORD) return (text) => text.includes(needle);
	const pattern = new RegExp(wordStartSource(needle), 'u');
	return (text) => pattern.test(text);
}

function prose(item: FilterItem): string {
	return normalize(`${item.name} ${item.description ?? ''}`).replace(/\s+/g, ' ');
}

/**
 * Una casilla exige la etiqueta. Una tecnología escrita también acepta el enlace que la nombra,
 * para que ninguno quede fuera al buscarlo por su nombre.
 */
function matcher(
	state: FilterState,
	techs: string[],
	ignore: { category?: boolean; tag?: boolean; pricing?: boolean } = {},
) {
	const prices = state.pricing ?? [];
	const { techs: typed, words } = splitQuery(state.query, techs);
	const wordTests = words.map(wordTest);
	const mentions = typed.map((tech) => ({ tech, forms: mentionsOf(tech) }));

	return (item: FilterItem) => {
		if (!ignore.category && state.category && item.category !== state.category) return false;
		if (!ignore.tag && state.tag && !(item.tags ?? []).includes(state.tag)) return false;
		if (!ignore.pricing && prices.length > 0 && !prices.includes(item.pricing ?? '')) return false;
		if (!state.tech.every((tech) => item.tech.includes(tech))) return false;
		const mentioned = mentions.every(
			({ tech, forms }) =>
				item.tech.includes(tech) || forms.some((form) => form.test(prose(item))),
		);
		if (!mentioned) return false;
		if (wordTests.length === 0) return true;
		const text = haystack(item);
		return wordTests.every((test) => test(text));
	};
}

export function matches(item: FilterItem, state: FilterState, techs: string[] = []): boolean {
	return matcher(state, techs)(item);
}

/** Enlaces que quedarían al marcar la casilla de cada tecnología. */
export function facetCounts(
	items: FilterItem[],
	state: FilterState,
	techs: string[],
): Record<string, number> {
	const base = items.filter(matcher(state, techs));
	return Object.fromEntries(
		techs.map((tech) => [tech, base.filter((item) => item.tech.includes(tech)).length]),
	);
}

/** Enlaces por etiqueta con los demás filtros, porque elegir una reemplaza a la anterior. */
export function tagCounts(
	items: FilterItem[],
	state: FilterState,
	techs: string[],
): Record<string, number> {
	const counts: Record<string, number> = {};
	for (const item of items.filter(matcher(state, techs, { tag: true }))) {
		for (const tag of item.tags ?? []) counts[tag] = (counts[tag] ?? 0) + 1;
	}
	return counts;
}

/**
 * Enlaces por categoría con los demás filtros, porque elegir una reemplaza a la anterior.
 * Ignora la etiqueta, que se pierde al cambiar de categoría.
 */
export function categoryCounts(
	items: FilterItem[],
	state: FilterState,
	techs: string[],
): Record<string, number> {
	const counts: Record<string, number> = {};
	for (const item of items.filter(matcher(state, techs, { category: true, tag: true }))) {
		counts[item.category] = (counts[item.category] ?? 0) + 1;
	}
	return counts;
}

/** Enlaces por precio con los demás filtros: los precios se suman, así que se ignora el propio. */
export function pricingCounts(
	items: FilterItem[],
	state: FilterState,
	techs: string[],
): Record<string, number> {
	const counts: Record<string, number> = {};
	for (const item of items.filter(matcher(state, techs, { pricing: true }))) {
		if (item.pricing) counts[item.pricing] = (counts[item.pricing] ?? 0) + 1;
	}
	return counts;
}

const bareHost = (url) => new URL(url).hostname.toLowerCase().replace(/^www\./, '');

/** Id de un enlace: dominio sin www más la ruta, en minúsculas y con guiones (`https://www.daisyui.com/` -> `daisyui-com`). */
export function linkId(url) {
	const { pathname } = new URL(url);
	return `${bareHost(url)}${pathname}`
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/** Forma comparable de una URL: sin protocolo, www, consulta, ancla ni barra final. */
export function normalizeUrl(url) {
	return `${bareHost(url)}${new URL(url).pathname.replace(/\/+$/, '')}`;
}

/**
 * Enlaces con la misma URL o el mismo id (`exact`) y otros del mismo dominio (`sameDomain`).
 * @template {{ id: string; url: string }} T
 * @param {string} url
 * @param {string} id
 * @param {T[]} links
 * @returns {{ exact: T[]; sameDomain: T[] }}
 */
export function findDuplicates(url, id, links) {
	const target = normalizeUrl(url);
	const host = bareHost(url);
	const exact = links.filter((link) => link.id === id || normalizeUrl(link.url) === target);
	const sameDomain = links.filter((link) => !exact.includes(link) && bareHost(link.url) === host);
	return { exact, sameDomain };
}

/**
 * Entrada nueva de `src/data/links.json`. `description` y `category` quedan vacías a propósito:
 * el build y `pnpm test` fallan hasta completarlas.
 * @param {{ id: string; name: string; url: string; logo?: string }} link
 */
export function linkSkeleton({ id, name, url, logo }) {
	return {
		id,
		name,
		url,
		description: '',
		category: '',
		tech: [],
		status: 'active',
		verified: true,
		private: false,
		...(logo ? { logo } : {}),
	};
}

/** Detalle en español con la forma que pide `detailSchema` y los textos vacíos. */
export function detailSkeleton(today) {
	return {
		whatIs: [''],
		uses: ['', '', ''],
		caveats: ['', ''],
		pricing: '',
		pricingNote: '',
		pricingUrl: '',
		idealFor: '',
		reviewedAt: today,
		reviewedByAuthor: false,
		screenshotAt: today,
	};
}

/** Textos en inglés del detalle, con la misma forma que el original. */
export function detailTextSkeleton() {
	return { whatIs: [''], uses: ['', '', ''], caveats: ['', ''], pricingNote: '', idealFor: '' };
}

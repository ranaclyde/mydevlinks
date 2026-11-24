export const SITE_NAME = 'mydevlinks';

/** Imagen para redes de las páginas sin captura propia (1200×630). */
export const DEFAULT_OG_IMAGE = { path: '/og.png', width: 1200, height: 630, alt: 'mydevlinks: enlaces curados para desarrollar' };

/** Previews y branch deploys de Netlify: se publican, pero no se indexan. */
export const NO_INDEX = Boolean(process.env.SITE_NOINDEX);

/** Ruta pública de la ficha de un enlace. */
export function linkPath(id: string): string {
	return `/enlace/${id}`;
}

/** URL absoluta de una ruta del sitio. */
export function absoluteUrl(path: string, site: URL | undefined): string {
	if (!site) return path;
	return new URL(path, site).href;
}

/**
 * Completa una descripción corta hasta un largo útil para buscadores (120–160 caracteres),
 * sin pasarse de 160.
 */
export function metaDescription(base: string, extra: string): string {
	const text = base.trim();
	const joined = `${text} ${extra}`;
	return text.length >= 120 || joined.length > 160 ? text : joined;
}

/** Serializa JSON-LD para un <script>, sin que el contenido pueda cerrar la etiqueta. */
export function jsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}

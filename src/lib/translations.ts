import { z } from 'astro/zod';
import { detailFields, type Detail } from './details';
import type { Link } from './links';

/** Traducción de un enlace: solo su descripción (nombre, URL y tecnologías no se traducen). */
export const linkTextSchema = z.object({
	id: z.string(),
	description: z.string().trim().min(1),
});
export type LinkText = z.infer<typeof linkTextSchema>;

/** Traducción de un detalle: solo los textos; precio, fechas y alternativas salen del original. */
export const detailTextSchema = detailFields.pick({
	whatIs: true,
	uses: true,
	caveats: true,
	pricingNote: true,
	idealFor: true,
});
export type DetailText = z.infer<typeof detailTextSchema>;

export interface Localized {
	link: Link;
	detail?: Detail;
	/** Todo su texto está en el idioma pedido; si no, se muestra el original y la página no se indexa. */
	translated: boolean;
}

/**
 * Enlace y detalle con los textos traducidos que haya. Un enlace sin verificar no tiene
 * descripción, así que solo necesita traducción su detalle, si lo tiene.
 */
export function localize(link: Link, detail?: Detail, linkText?: LinkText, detailText?: DetailText): Localized {
	const translated = (!link.description || Boolean(linkText)) && (!detail || Boolean(detailText));
	return {
		link: linkText && link.description ? { ...link, description: linkText.description } : link,
		detail: detail && detailText ? { ...detail, ...detailText } : detail,
		translated,
	};
}

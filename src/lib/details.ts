import { z } from 'astro/zod';

export const PRICING = ['gratis', 'freemium', 'de-pago'] as const;

export const PRICE_LABEL: Record<(typeof PRICING)[number], string> = {
	gratis: 'Gratis',
	freemium: 'Freemium',
	'de-pago': 'De pago',
};

const isoDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha ISO YYYY-MM-DD')
	.refine((s) => !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s, {
		message: 'Fecha inexistente en el calendario',
	});
const text = z.string().trim().min(1);

export const detailSchema = z
	.object({
		whatIs: z.array(text).min(1).max(2),
		uses: z.array(text).length(3),
		caveats: z.array(text).min(2).max(3),
		pricing: z.enum(PRICING),
		pricingNote: text,
		pricingUrl: z.url().optional(),
		idealFor: text,
		reviewedAt: isoDate,
		reviewedByAuthor: z.boolean(),
		screenshotAt: isoDate.optional(),
		alternatives: z.array(z.string()).optional(),
	})
	.refine((detail) => detail.pricing === 'gratis' || Boolean(detail.pricingUrl), {
		message: 'pricingUrl es obligatoria salvo si el precio es gratis',
		path: ['pricingUrl'],
	});

export type Detail = z.infer<typeof detailSchema>;

export function screenshotPath(id: string): string {
	return `/capturas/${id}.jpg`;
}

const dateFormat = new Intl.DateTimeFormat('es', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	timeZone: 'UTC',
});

/** `2026-11-11` -> `11 nov 2026`. */
export function formatDate(iso: string): string {
	return dateFormat.format(new Date(iso)).replace(/\./g, '');
}

import { z } from 'astro/zod';

export const CATEGORIES = [
	'Componentes y UI kits',
	'Animación y efectos',
	'Galerías de inspiración',
	'Iconos e ilustraciones',
	'Fuentes y color',
	'Generadores CSS/SVG',
	'Herramientas de desarrollo',
	'Backend y datos',
	'Constructores con IA',
	'Aprendizaje y documentación',
	'Directorios de recursos',
	'Otros',
] as const;

/** Vocabulario único de `tech`; evita casi duplicados como "Tailwind CSS". */
export const TECHS = [
	'Alpine.js',
	'Angular',
	'Astro',
	'Bootstrap',
	'Bulma',
	'CSS',
	'Figma',
	'Flutter',
	'Go',
	'HTML',
	'JavaScript',
	'Laravel',
	'MongoDB',
	'NativeScript',
	'Next.js',
	'Node.js',
	'Nuxt',
	'PHP',
	'PostgreSQL',
	'Python',
	'Qwik',
	'React',
	'React Native',
	'Redis',
	'Redux',
	'SQLite',
	'Solid',
	'Svelte',
	'Tailwind',
	'TypeScript',
	'Vue',
	'WordPress',
	'shadcn/ui',
] as const;

export const STATUSES = ['activo', 'antiguo', 'caido'] as const;

export const linkSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		url: z.url(),
		description: z.string().optional(),
		category: z.enum(CATEGORIES),
		tech: z.array(z.enum(TECHS)),
		logo: z.string().optional(),
		status: z.enum(STATUSES),
		verified: z.boolean(),
		private: z.boolean(),
	})
	.refine((link) => !link.verified || Boolean(link.description?.trim()), {
		message: 'Un enlace verificado necesita description',
		path: ['description'],
	});

export type Link = z.infer<typeof linkSchema>;

export function visibleLinks(links: Link[], isDev: boolean): Link[] {
	return isDev ? links : links.filter((link) => !link.private);
}

export function domainOf(url: string): string {
	return new URL(url).hostname.replace(/^www\./, '');
}

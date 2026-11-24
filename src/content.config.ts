import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { detailSchema } from './lib/details';
import { linkSchema } from './lib/links';
import { detailTextSchema, linkTextSchema } from './lib/translations';

const links = defineCollection({
	loader: file('src/data/links.json'),
	schema: linkSchema,
});

const details = defineCollection({
	loader: glob({ pattern: '*.json', base: 'src/data/details' }),
	schema: detailSchema,
});

/** Traducciones al inglés: la descripción de cada enlace y los textos de cada detalle, por id. */
const linksEn = defineCollection({
	loader: file('src/data/en/links.json'),
	schema: linkTextSchema,
});

const detailsEn = defineCollection({
	loader: glob({ pattern: '*.json', base: 'src/data/en/details' }),
	schema: detailTextSchema,
});

export const collections = { links, details, linksEn, detailsEn };

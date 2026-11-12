import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { detailSchema } from './lib/details';
import { linkSchema } from './lib/links';

const links = defineCollection({
	loader: file('src/data/links.json'),
	schema: linkSchema,
});

const details = defineCollection({
	loader: glob({ pattern: '*.json', base: 'src/data/detalles' }),
	schema: detailSchema,
});

export const collections = { links, details };

import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { linkSchema } from './lib/links';

const links = defineCollection({
	loader: file('src/data/links.json'),
	schema: linkSchema,
});

export const collections = { links };

import { describe, expect, it } from 'vitest';
import { domainOf, linkSchema, sortLinks, visibleLinks, type Link } from '../src/lib/links';

const base = {
	id: 'astro',
	name: 'Astro',
	url: 'https://astro.build',
	description: 'Framework web para sitios de contenido.',
	category: 'Componentes y UI kits',
	tech: ['Astro'],
	logo: 'https://astro.build/logo.svg',
	status: 'activo',
	verified: true,
	private: false,
};

describe('linkSchema', () => {
	it('acepta un enlace verificado completo', () => {
		expect(linkSchema.safeParse(base).success).toBe(true);
	});

	it('rechaza category "Varios", status "roto" y url "no-es-url"', () => {
		expect(linkSchema.safeParse({ ...base, category: 'Varios' }).success).toBe(false);
		expect(linkSchema.safeParse({ ...base, status: 'roto' }).success).toBe(false);
		expect(linkSchema.safeParse({ ...base, url: 'no-es-url' }).success).toBe(false);
	});

	it('rechaza un enlace verified:true sin description', () => {
		const { description, ...sinDescripcion } = base;
		expect(linkSchema.safeParse(sinDescripcion).success).toBe(false);
	});

	it('rechaza un verified:true con description en blanco', () => {
		expect(linkSchema.safeParse({ ...base, description: '   ' }).success).toBe(false);
	});

	it('rechaza una tecnología fuera del vocabulario', () => {
		expect(linkSchema.safeParse({ ...base, tech: ['Tailwind CSS'] }).success).toBe(false);
	});

	it('acepta un enlace verified:false sin description ni logo', () => {
		const { description, logo, ...minimo } = base;
		expect(linkSchema.safeParse({ ...minimo, verified: false }).success).toBe(true);
	});
});

describe('visibleLinks', () => {
	const links = [base, { ...base, id: 'secreto', private: true }] as Link[];

	it('con isDev false quita private:true', () => {
		expect(visibleLinks(links, false).map((l) => l.id)).toEqual(['astro']);
	});

	it('con isDev true los conserva', () => {
		expect(visibleLinks(links, true)).toHaveLength(2);
	});
});

describe('domainOf', () => {
	it('devuelve el host sin www', () => {
		expect(domainOf('https://www.freepik.es/search?author=1')).toBe('freepik.es');
		expect(domainOf('https://ui.shadcn.com/docs')).toBe('ui.shadcn.com');
	});
});

describe('featured', () => {
	it('acepta featured opcional y rechaza un valor que no es booleano', () => {
		expect(linkSchema.safeParse({ ...base, featured: true }).success).toBe(true);
		expect(linkSchema.safeParse({ ...base, featured: 'sí' }).success).toBe(false);
	});

	it('rechaza destacar un enlace sin verificar', () => {
		const { description, ...sinVerificar } = base;
		expect(linkSchema.safeParse({ ...sinVerificar, verified: false, featured: true }).success).toBe(false);
	});
});

describe('sortLinks', () => {
	const make = (name: string, featured?: boolean) => ({ ...base, id: name, name, featured }) as Link;

	it('pone los destacados primero y ordena cada grupo por nombre', () => {
		const sorted = sortLinks([make('beta'), make('Zeta', true), make('alfa'), make('Ómega', true)]);
		expect(sorted.map((l) => l.name)).toEqual(['Ómega', 'Zeta', 'alfa', 'beta']);
	});

	it('no modifica la lista original', () => {
		const list = [make('b'), make('a')];
		sortLinks(list);
		expect(list.map((l) => l.name)).toEqual(['b', 'a']);
	});
});

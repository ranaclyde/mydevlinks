import { describe, expect, it } from 'vitest';
import { alternativesFor } from '../src/lib/alternatives';
import type { Link } from '../src/lib/links';

const base = {
	id: 'a',
	name: 'A',
	url: 'https://example.com',
	description: 'Descripción.',
	category: 'Componentes y UI kits',
	tech: [],
	logo: 'https://example.com/logo.svg',
	status: 'activo',
	verified: true,
	private: false,
};

const make = (id: string, extra: Record<string, unknown> = {}) =>
	({ ...base, id, name: id.toUpperCase(), ...extra }) as unknown as Link;

describe('alternativesFor', () => {
	it('ordena por tecnologías compartidas y, a igualdad, por nombre', () => {
		const self = make('a', { tech: ['Astro', 'React'] });
		const links = [
			self,
			make('d', { tech: ['Astro'] }),
			make('c', { tech: ['Astro', 'React'] }),
			make('b', { tech: ['Astro'] }),
		];
		expect(alternativesFor(self, links).map((l) => l.id)).toEqual(['c', 'b', 'd']);
	});

	it('excluye el propio, los caídos, los privados y otras categorías', () => {
		const self = make('a');
		const links = [
			self,
			make('b', { status: 'caido' }),
			make('c', { private: true }),
			make('d', { category: 'Otra' }),
			make('e'),
		];
		expect(alternativesFor(self, links).map((l) => l.id)).toEqual(['e']);
	});

	it('con 2 candidatos devuelve 2', () => {
		const self = make('a');
		const links = [self, make('b'), make('c'), make('d', { category: 'Otra' })];
		expect(alternativesFor(self, links)).toHaveLength(2);
	});

	it('respeta pinned en orden, ignora inexistentes y rellena sin repetir', () => {
		const self = make('a');
		const links = [self, ...['b', 'c', 'd', 'e', 'f'].map((id) => make(id))];
		const ids = alternativesFor(self, links, ['e', 'x-inexistente']).map((l) => l.id);
		expect(ids).toEqual(['e', 'b', 'c', 'd']);
	});
});

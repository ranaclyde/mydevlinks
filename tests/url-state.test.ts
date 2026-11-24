import { describe, expect, it } from 'vitest';
import type { FilterState } from '../src/lib/filter';
import { GALLERY } from '../src/lib/links';
import { stateFromSearch, stateToSearch } from '../src/lib/url-state';

const known = {
	categories: ['components', GALLERY],
	techs: ['React', 'Tailwind', 'shadcn/ui'],
	tags: ['websites'],
	pricing: ['free', 'freemium', 'paid'],
};
const empty: FilterState = { query: '', category: null, tech: [], tag: null, pricing: [] };

describe('estado en la URL', () => {
	it('sobrevive a la ida y vuelta', () => {
		const state: FilterState = {
			query: 'react hooks',
			category: 'components',
			tech: ['Tailwind', 'shadcn/ui'],
			tag: null,
			pricing: ['free', 'freemium'],
		};
		expect(stateFromSearch(stateToSearch(state), known)).toEqual(state);
	});

	it('conserva el tipo de galería', () => {
		const state: FilterState = { query: '', category: GALLERY, tech: [], tag: 'websites', pricing: [] };
		expect(stateFromSearch(stateToSearch(state), known)).toEqual(state);
	});

	it('el estado vacío da una cadena vacía', () => {
		expect(stateToSearch(empty)).toBe('');
		expect(stateFromSearch('', known)).toEqual(empty);
	});

	it('descarta los valores desconocidos', () => {
		expect(stateFromSearch('?category=Nada&tech=Foo&type=Sitios web&price=caro', known)).toEqual(empty);
	});

	it('guarda los precios como parámetros repetidos y sin duplicados', () => {
		expect(stateToSearch({ ...empty, pricing: ['free', 'freemium'] })).toBe('?price=free&price=freemium');
		expect(stateFromSearch('?price=free&price=free', known)).toEqual({ ...empty, pricing: ['free'] });
	});

	it('descarta el tipo si la categoría no es la galería', () => {
		expect(stateFromSearch('?category=components&type=websites', known)).toEqual({
			...empty,
			category: 'components',
		});
	});
});

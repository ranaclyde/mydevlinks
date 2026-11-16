import { describe, expect, it } from 'vitest';
import type { FilterState } from '../src/lib/filter';
import { GALLERY } from '../src/lib/links';
import { stateFromSearch, stateToSearch } from '../src/lib/url-state';

const known = {
	categories: ['Componentes y UI kits', GALLERY],
	techs: ['React', 'Tailwind', 'shadcn/ui'],
	tags: ['Sitios web'],
	pricing: ['gratis', 'freemium', 'de-pago'],
};
const empty: FilterState = { query: '', category: null, tech: [], tag: null, pricing: [] };

describe('estado en la URL', () => {
	it('sobrevive a la ida y vuelta', () => {
		const state: FilterState = {
			query: 'react hooks',
			category: 'Componentes y UI kits',
			tech: ['Tailwind', 'shadcn/ui'],
			tag: null,
			pricing: ['gratis', 'freemium'],
		};
		expect(stateFromSearch(stateToSearch(state), known)).toEqual(state);
	});

	it('conserva el tipo de galería', () => {
		const state: FilterState = { query: '', category: GALLERY, tech: [], tag: 'Sitios web', pricing: [] };
		expect(stateFromSearch(stateToSearch(state), known)).toEqual(state);
	});

	it('el estado vacío da una cadena vacía', () => {
		expect(stateToSearch(empty)).toBe('');
		expect(stateFromSearch('', known)).toEqual(empty);
	});

	it('descarta los valores desconocidos', () => {
		expect(stateFromSearch('?cat=Nada&tech=Foo&tipo=Sitios web&precio=caro', known)).toEqual(empty);
	});

	it('guarda los precios como parámetros repetidos y sin duplicados', () => {
		expect(stateToSearch({ ...empty, pricing: ['gratis', 'freemium'] })).toBe('?precio=gratis&precio=freemium');
		expect(stateFromSearch('?precio=gratis&precio=gratis', known)).toEqual({ ...empty, pricing: ['gratis'] });
	});

	it('descarta el tipo si la categoría no es la galería', () => {
		expect(stateFromSearch('?cat=Componentes y UI kits&tipo=Sitios web', known)).toEqual({
			...empty,
			category: 'Componentes y UI kits',
		});
	});
});

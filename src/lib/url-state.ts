import type { FilterState } from './filter';
import { GALLERY } from './links';

export interface KnownFilters {
	categories: string[];
	techs: string[];
	tags: string[];
	pricing: string[];
}

/** Filtros como query string: `''` o `'?q=…&category=…&type=…&price=…&tech=…'`, sin los vacíos. */
export function stateToSearch(state: FilterState): string {
	const params = new URLSearchParams();
	if (state.query) params.set('q', state.query);
	if (state.category) params.set('category', state.category);
	if (state.tag) params.set('type', state.tag);
	for (const price of state.pricing ?? []) params.append('price', price);
	for (const tech of state.tech) params.append('tech', tech);
	const search = params.toString();
	return search ? `?${search}` : '';
}

/** Lee los filtros de una query string y descarta lo que no existe. */
export function stateFromSearch(search: string, known: KnownFilters): FilterState {
	const params = new URLSearchParams(search);
	const value = params.get('category');
	const category = value && known.categories.includes(value) ? value : null;
	const type = params.get('type');
	const tag = category === GALLERY && type && known.tags.includes(type) ? type : null;
	const tech = [...new Set(params.getAll('tech'))].filter((item) => known.techs.includes(item));
	const pricing = [...new Set(params.getAll('price'))].filter((item) => known.pricing.includes(item));
	return { query: params.get('q') ?? '', category, tech, tag, pricing };
}

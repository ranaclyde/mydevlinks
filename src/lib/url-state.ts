import type { FilterState } from './filter';
import { GALLERY } from './links';

export interface KnownFilters {
	categories: string[];
	techs: string[];
	tags: string[];
}

/** Filtros como query string: `''` o `'?q=…&cat=…&tipo=…&tech=…'`, sin los vacíos. */
export function stateToSearch(state: FilterState): string {
	const params = new URLSearchParams();
	if (state.query) params.set('q', state.query);
	if (state.category) params.set('cat', state.category);
	if (state.tag) params.set('tipo', state.tag);
	for (const tech of state.tech) params.append('tech', tech);
	const search = params.toString();
	return search ? `?${search}` : '';
}

/** Lee los filtros de una query string y descarta lo que no existe. */
export function stateFromSearch(search: string, known: KnownFilters): FilterState {
	const params = new URLSearchParams(search);
	const cat = params.get('cat');
	const category = cat && known.categories.includes(cat) ? cat : null;
	const tipo = params.get('tipo');
	const tag = category === GALLERY && tipo && known.tags.includes(tipo) ? tipo : null;
	const tech = [...new Set(params.getAll('tech'))].filter((item) => known.techs.includes(item));
	return { query: params.get('q') ?? '', category, tech, tag };
}

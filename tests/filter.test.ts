import { describe, expect, it } from 'vitest';
import links from '../src/data/links.json';
import {
	activeTechs,
	categoryCounts,
	facetCounts,
	matches,
	normalize,
	queryWithoutTech,
	queryWithoutWords,
	splitQuery,
	tagCounts,
	TECH_ALIASES,
} from '../src/lib/filter';
import { TECHS as VOCABULARY } from '../src/lib/links';

const TECHS = [
	'React',
	'React Native',
	'Tailwind',
	'CSS',
	'Next.js',
	'Nuxt',
	'Node.js',
	'Vue',
	'shadcn/ui',
];

const shadcn = {
	name: 'shadcn/ui',
	description: 'Componentes accesibles que copias a tu proyecto.',
	category: 'Componentes y UI kits',
	tech: ['React', 'Tailwind'],
};
const motion = {
	name: 'Motion',
	description: 'Biblioteca de transiciones para interfaces.',
	category: 'Animación y efectos',
	tech: ['React'],
};
const tabla = {
	name: 'Tabla rápida',
	description: 'Tablas de datos.',
	category: 'Componentes y UI kits',
	tech: ['React', 'Next.js'],
};
const mobile = {
	name: 'Lista',
	description: 'Listas para móvil.',
	category: 'Herramientas de desarrollo',
	tech: ['React Native'],
};
const sinDescripcion = {
	name: 'Marcador viejo',
	category: 'Herramientas de desarrollo',
	tech: [],
};

const empty = { query: '', category: null, tech: [] };

describe('normalize', () => {
	it('pasa a minúsculas y quita diacríticos', () => {
		expect(normalize('Animación')).toBe('animacion');
		expect(normalize('SHADCN')).toBe('shadcn');
	});
});

describe('splitQuery', () => {
	it('separa una tecnología de las demás palabras', () => {
		expect(splitQuery('react tabla', TECHS)).toEqual({ techs: ['React'], words: ['tabla'] });
	});

	it('reconoce next.js y no distingue mayúsculas', () => {
		expect(splitQuery('NEXT.JS', TECHS)).toEqual({ techs: ['Next.js'], words: [] });
		expect(splitQuery('tAiLwInD', TECHS)).toEqual({ techs: ['Tailwind'], words: [] });
	});

	it('deja como palabra lo que no es una tecnología exacta', () => {
		expect(splitQuery('reactivo', TECHS)).toEqual({ techs: [], words: ['reactivo'] });
		expect(splitQuery('next', TECHS)).toEqual({ techs: [], words: ['next'] });
	});

	it('prefiere la tecnología de varias palabras', () => {
		expect(splitQuery('react native lista', TECHS)).toEqual({
			techs: ['React Native'],
			words: ['lista'],
		});
	});

	it('no repite una tecnología y acepta una consulta vacía', () => {
		expect(splitQuery('react React', TECHS)).toEqual({ techs: ['React'], words: [] });
		expect(splitQuery('   ', TECHS)).toEqual({ techs: [], words: [] });
	});
});

describe('alias de tecnologías', () => {
	it.each([
		['vue.js', 'Vue'],
		['vuejs', 'Vue'],
		['reactjs', 'React'],
		['react.js', 'React'],
		['nextjs', 'Next.js'],
		['next js', 'Next.js'],
		['nuxtjs', 'Nuxt'],
		['tailwindcss', 'Tailwind'],
		['Tailwind CSS', 'Tailwind'],
		['nodejs', 'Node.js'],
		['node js', 'Node.js'],
	])('%s equivale a %s', (query, tech) => {
		expect(splitQuery(query, TECHS)).toEqual({ techs: [tech], words: [] });
	});

	it('tailwind css es una sola tecnología, y en otro orden son dos', () => {
		expect(splitQuery('tailwind css', TECHS).techs).toEqual(['Tailwind']);
		expect(splitQuery('css tailwind', TECHS).techs).toEqual(['CSS', 'Tailwind']);
	});

	it('un alias no se aplica si su tecnología no está en la lista', () => {
		expect(splitQuery('vuejs', ['React'])).toEqual({ techs: [], words: ['vuejs'] });
	});

	it('vue.js da el mismo resultado que vue, también en enlaces que solo lo nombran', () => {
		const nombrado = [
			{ ...sinDescripcion, name: 'Guía de Vue' },
			{ ...sinDescripcion, name: 'Vue.js showcases' },
			{ ...sinDescripcion, name: 'Trucos de Vuejs' },
			{ ...sinDescripcion, name: 'Otra cosa' },
		];
		const results = ['vue', 'vue.js', 'vuejs'].map((query) =>
			nombrado.filter((item) => matches(item, { ...empty, query }, TECHS)).map((item) => item.name),
		);
		expect(results[0]).toEqual(['Guía de Vue', 'Vue.js showcases', 'Trucos de Vuejs']);
		expect(results[1]).toEqual(results[0]);
		expect(results[2]).toEqual(results[0]);
	});

	it('quitar la tecnología borra el alias de la consulta', () => {
		expect(queryWithoutTech('tailwind css tabla', 'Tailwind', TECHS)).toBe('tabla');
	});

	it('todo alias apunta al vocabulario', () => {
		const known: string[] = [...VOCABULARY];
		expect(Object.values(TECH_ALIASES).filter((tech) => !known.includes(tech))).toEqual([]);
	});
});

describe('palabras cortas', () => {
	const tailwind = { ...sinDescripcion, name: 'Tailwind', category: 'Galerías de inspiración' };
	const conIa = { ...sinDescripcion, name: 'Asistente', description: 'Genera código con IA.' };

	it.each(['ai', 'ia'])('%s no coincide dentro de otra palabra', (query) => {
		expect(matches(tailwind, { ...empty, query })).toBe(false);
	});

	it('ts y js no coinciden dentro de otra palabra', () => {
		const item = { ...sinDescripcion, name: 'Hojas de eventos para ajsutes' };
		expect(matches(item, { ...empty, query: 'ts' })).toBe(false);
		expect(matches(item, { ...empty, query: 'js' })).toBe(false);
	});

	it('coinciden como palabra entera, también junto a un signo', () => {
		expect(matches(conIa, { ...empty, query: 'ia' })).toBe(true);
		expect(matches({ ...sinDescripcion, name: 'Next.js' }, { ...empty, query: 'js' })).toBe(true);
	});

	it('coinciden al inicio de una palabra', () => {
		const animados = { ...sinDescripcion, name: 'Iconos animados' };
		const reactivo = { ...sinDescripcion, name: 'Formularios reactivos' };
		expect(matches(animados, { ...empty, query: 'ani' })).toBe(true);
		expect(matches(reactivo, { ...empty, query: 'rea' })).toBe(true);
		expect(matches(animados, { ...empty, query: 'mad' })).toBe(false);
		expect(matches({ ...sinDescripcion, name: 'Crear algo' }, { ...empty, query: 'rea' })).toBe(false);
	});

	it('desde cuatro caracteres se sigue buscando dentro de la palabra', () => {
		expect(matches(tailwind, { ...empty, query: 'twin' })).toBe(false);
		expect(matches(tailwind, { ...empty, query: 'ailw' })).toBe(true);
	});
});

describe('matches', () => {
	it('sin categoría coincide con todo; con valor, solo esa categoría', () => {
		expect(matches(shadcn, empty)).toBe(true);
		expect(matches(motion, empty)).toBe(true);
		expect(matches(shadcn, { ...empty, category: 'Componentes y UI kits' })).toBe(true);
		expect(matches(motion, { ...empty, category: 'Componentes y UI kits' })).toBe(false);
	});

	it('exige todas las tecnologías', () => {
		const state = { ...empty, tech: ['React', 'Tailwind'] };
		expect(matches(shadcn, state)).toBe(true);
		expect(matches(motion, state)).toBe(false);
	});

	it('busca en nombre, descripción, tecnologías y categoría', () => {
		expect(matches(shadcn, { ...empty, query: 'copias' })).toBe(true);
		expect(matches(motion, { ...empty, query: 'motion' })).toBe(true);
		expect(matches(shadcn, { ...empty, query: 'tailw' })).toBe(true);
		expect(matches(motion, { ...empty, query: 'efectos' })).toBe(true);
		expect(matches(motion, { ...empty, query: 'copias' })).toBe(false);
	});

	it('ignora acentos y mayúsculas', () => {
		expect(matches(motion, { ...empty, query: 'animacion' })).toBe(true);
		expect(matches(shadcn, { ...empty, query: 'SHADCN' })).toBe(true);
	});

	it('exige todas las palabras', () => {
		expect(matches(shadcn, { ...empty, query: 'copias accesibles' })).toBe(true);
		expect(matches(shadcn, { ...empty, query: 'copias kanban' })).toBe(false);
	});

	it('ignora los espacios y no filtra con una consulta vacía', () => {
		expect(matches(shadcn, { ...empty, query: '  copias  ' })).toBe(true);
		expect(matches(shadcn, { ...empty, query: '' })).toBe(true);
	});

	it('acepta un enlace sin descripción', () => {
		expect(matches(sinDescripcion, { ...empty, query: 'marcador' })).toBe(true);
		expect(matches(sinDescripcion, { ...empty, query: 'kanban' })).toBe(false);
	});

	it('aplica como filtro las tecnologías escritas en la consulta', () => {
		const state = { ...empty, query: 'react tabla' };
		expect(matches(tabla, state, TECHS)).toBe(true);
		expect(matches(mobile, state, TECHS)).toBe(false);
		expect(matches({ ...tabla, tech: [] }, state, TECHS)).toBe(false);
	});

	it('una tecnología escrita acepta el enlace que la nombra sin tenerla', () => {
		const enDescripcion = { ...motion, description: 'Hecho con React por dentro.', tech: [] };
		const enNombre = { ...motion, name: 'Tailwind CSS Animated', tech: [] };
		expect(matches(enDescripcion, { ...empty, query: 'react' }, TECHS)).toBe(true);
		expect(matches(enNombre, { ...empty, query: 'TAILWIND' }, TECHS)).toBe(true);
	});

	it('una tecnología escrita solo cuenta como palabra entera, y no en la categoría', () => {
		const techs = ['Go'];
		const parecido = { ...sinDescripcion, name: 'Algo de Google', description: 'Categorías.' };
		const enCategoria = { ...sinDescripcion, category: 'Go y más' };
		expect(matches(parecido, { ...empty, query: 'go' }, techs)).toBe(false);
		expect(matches(enCategoria, { ...empty, query: 'go' }, techs)).toBe(false);
		expect(matches({ ...parecido, name: 'Hecho en Go.' }, { ...empty, query: 'go' }, techs)).toBe(true);
	});

	it('acepta caracteres especiales en el nombre de una tecnología', () => {
		const techs = ['C++', 'shadcn/ui', 'tRPC-Kit'];
		for (const tech of techs) {
			const item = { ...sinDescripcion, name: `Guía de ${tech}.` };
			expect(matches(item, { ...empty, query: tech }, techs)).toBe(true);
		}
	});

	it('una casilla marcada sigue exigiendo la etiqueta', () => {
		const soloLoMenciona = { ...motion, description: 'Hecho con Vue por dentro.', tech: [] };
		expect(matches(soloLoMenciona, { ...empty, query: 'vue' }, TECHS)).toBe(true);
		expect(matches(soloLoMenciona, { ...empty, tech: ['Vue'] }, TECHS)).toBe(false);
		expect(matches(soloLoMenciona, { ...empty, query: 'vue', tech: ['Vue'] }, TECHS)).toBe(false);
	});

	it('todo enlace de links.json se encuentra por su propio nombre', () => {
		const techs = [...new Set(links.flatMap((link) => link.tech))];
		const lost = links.filter((link) => !matches(link, { ...empty, query: link.name }, techs));
		expect(lost.map((link) => link.name)).toEqual([]);
	});
});

describe('búsqueda por URL', () => {
	const vercel = {
		name: 'Mi demo',
		category: 'Herramientas de desarrollo',
		tech: [],
		url: 'https://www.mi-demo.vercel.app/',
	};
	const repo = {
		name: 'Repositorio',
		category: 'Herramientas de desarrollo',
		tech: [],
		url: 'http://github.com/acme/kit?tab=readme#top',
	};
	const q = (query: string) => ({ ...empty, query });

	it('encuentra por dominio, parcial o completo', () => {
		expect(matches(vercel, q('vercel.app'))).toBe(true);
		expect(matches(vercel, q('mi-demo'))).toBe(true);
		expect(matches(repo, q('github'))).toBe(true);
		expect(matches(repo, q('vercel.app'))).toBe(false);
	});

	it('encuentra por ruta', () => {
		expect(matches(repo, q('github.com/acme'))).toBe(true);
		expect(matches(repo, q('acme/kit'))).toBe(true);
	});

	it('ignora protocolo, www y barra final, también al escribirlos', () => {
		expect(matches(vercel, q('https://www.mi-demo.vercel.app/'))).toBe(true);
		expect(matches(vercel, q('www.mi-demo'))).toBe(true);
		expect(matches(repo, q('https://github.com/acme/kit/'))).toBe(true);
	});

	it('el protocolo no coincide con todo', () => {
		expect(matches(vercel, q('https'))).toBe(false);
		expect(matches(repo, q('http'))).toBe(false);
		expect(matches(vercel, q('www'))).toBe(false);
		expect(matches(vercel, q('https://'))).toBe(false);
	});

	it('no busca en la consulta ni en el fragmento de la URL', () => {
		expect(matches(repo, q('readme'))).toBe(false);
	});

	it('sin URL el resto sigue igual', () => {
		expect(matches(sinDescripcion, q('github'))).toBe(false);
	});
});

describe('activeTechs', () => {
	it('une las casillas y la consulta sin repetir', () => {
		expect(activeTechs({ ...empty, query: 'react next.js', tech: ['Vue', 'React'] }, TECHS)).toEqual([
			'Vue',
			'React',
			'Next.js',
		]);
	});
});

describe('queryWithoutTech y queryWithoutWords', () => {
	it('quita solo la tecnología pedida', () => {
		expect(queryWithoutTech('react tabla', 'React', TECHS)).toBe('tabla');
		expect(queryWithoutTech('tabla REACT vue', 'React', TECHS)).toBe('tabla vue');
		expect(queryWithoutTech('react native', 'React', TECHS)).toBe('react native');
		expect(queryWithoutTech('react native', 'React Native', TECHS)).toBe('');
	});

	it('quita las palabras y conserva las tecnologías', () => {
		expect(queryWithoutWords('react tabla grande', TECHS)).toBe('react');
	});
});

describe('facetCounts', () => {
	const items = [shadcn, motion, tabla, mobile];

	it('sin filtros cuenta todos los enlaces de cada tecnología', () => {
		expect(facetCounts(items, empty, ['React', 'Tailwind', 'Vue'])).toEqual({
			React: 3,
			Tailwind: 1,
			Vue: 0,
		});
	});

	it('refleja los demás filtros activos', () => {
		const state = { ...empty, category: 'Componentes y UI kits' };
		expect(facetCounts(items, state, ['React', 'Tailwind', 'Next.js'])).toEqual({
			React: 2,
			Tailwind: 1,
			'Next.js': 1,
		});
		expect(facetCounts(items, { ...empty, tech: ['Tailwind'] }, ['React', 'Next.js'])).toEqual({
			React: 1,
			'Next.js': 0,
		});
	});

	it('tiene en cuenta la consulta y las tecnologías escritas en ella', () => {
		expect(facetCounts(items, { ...empty, query: 'react tablas' }, TECHS)).toMatchObject({
			React: 1,
			'Next.js': 1,
			Tailwind: 0,
		});
	});
});

describe('facetCounts con tecnologías escritas', () => {
	it('cuenta lo que quedaría al marcar la casilla, que exige la etiqueta', () => {
		const menciona = { ...motion, description: 'Hecho con React por dentro.', tech: [] };
		expect(facetCounts([shadcn, menciona], { ...empty, query: 'react' }, ['React'])).toEqual({
			React: 1,
		});
	});
});

describe('categoryCounts', () => {
	it('cuenta cada categoría sin aplicar la categoría elegida', () => {
		const items = [shadcn, motion, tabla, mobile];
		const state = { query: '', category: 'Herramientas de desarrollo', tech: ['React'] };
		expect(categoryCounts(items, state, TECHS)).toEqual({
			'Componentes y UI kits': 2,
			'Animación y efectos': 1,
		});
	});
});

describe('etiquetas de galería', () => {
	const G = 'Galerías de inspiración';
	const landings = { name: 'Landings', description: 'Ejemplos.', category: G, tech: [], tags: ['Landing pages'] };
	const oscuras = {
		name: 'Oscuras',
		description: 'Ejemplos.',
		category: G,
		tech: [],
		tags: ['Sitios web', 'Estilos visuales'],
	};
	const items = [landings, oscuras, shadcn, motion];

	it('la etiqueta deja solo las galerías que la llevan', () => {
		const state = { query: '', category: G, tech: [], tag: 'Estilos visuales' };
		expect(items.filter((item) => matches(item, state, TECHS))).toEqual([oscuras]);
	});

	it('la búsqueda encuentra una galería por su etiqueta', () => {
		expect(matches(landings, { ...empty, query: 'landing' }, TECHS)).toBe(true);
		expect(matches(oscuras, { ...empty, query: 'landing' }, TECHS)).toBe(false);
	});

	it('tagCounts cuenta cada etiqueta ignorando la elegida', () => {
		const state = { query: '', category: G, tech: [], tag: 'Landing pages' };
		expect(tagCounts(items, state, TECHS)).toEqual({
			'Landing pages': 1,
			'Sitios web': 1,
			'Estilos visuales': 1,
		});
	});

	it('categoryCounts ignora la etiqueta', () => {
		const state = { query: '', category: G, tech: [], tag: 'Landing pages' };
		expect(categoryCounts(items, state, TECHS)).toEqual({
			[G]: 2,
			'Componentes y UI kits': 1,
			'Animación y efectos': 1,
		});
	});
});

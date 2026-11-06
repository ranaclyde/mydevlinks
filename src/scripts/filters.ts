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
	TOP_TECHS,
	VISIBLE_TECH,
	type FilterItem,
	type FilterState,
} from '../lib/filter';
import { GALLERY } from '../lib/links';

const ANNOUNCE_DELAY = 700;

interface Card extends FilterItem {
	el: HTMLElement;
	chips: HTMLElement[];
}

const $ = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T;

const grid = $<HTMLElement>('[data-grid]');
const side = $<HTMLElement>('[data-side]');
const search = $<HTMLInputElement>('[data-search]');
const heading = $<HTMLElement>('#resultados');
const countValue = $<HTMLElement>('[data-count-value]');
const countLabel = $<HTMLElement>('[data-count-label]');
const live = $<HTMLElement>('[data-live]');
const actives = $<HTMLElement>('[data-actives]');
const empty = $<HTMLElement>('[data-empty]');
const emptyText = $<HTMLElement>('[data-empty-text]');
const badge = $<HTMLElement>('[data-badge]');
const toggle = $<HTMLButtonElement>('[data-toggle]');
const showResults = $<HTMLButtonElement>('[data-show-results]');
const categoryCurrent = $<HTMLElement>('[data-category-current]');
const techField = $<HTMLElement>('[data-tech-field]');
const techFilter = $<HTMLInputElement>('[data-tech-filter]');
const techMore = document.querySelector<HTMLButtonElement>('[data-tech-more]');
const techNone = $<HTMLElement>('[data-tech-none]');

const categoryInputs = [...document.querySelectorAll<HTMLInputElement>('input[name="categoria"]')];
const tagGroup = document.querySelector<HTMLElement>('[data-tags]');
const tagInputs = [...document.querySelectorAll<HTMLInputElement>('input[name="tipo"]')];
const techOptions = [...document.querySelectorAll<HTMLElement>('[data-tech-option]')];
const techInputs = techOptions.map((option) => option.querySelector('input') as HTMLInputElement);
const allTechs = techInputs.map((input) => input.value);

const cards: Card[] = [...document.querySelectorAll<HTMLElement>('[data-card]')].map((el) => ({
	el,
	name: el.dataset.name ?? '',
	description: el.dataset.description,
	category: el.dataset.category ?? '',
	tech: JSON.parse(el.dataset.tech ?? '[]'),
	tags: JSON.parse(el.dataset.tags ?? '[]'),
	chips: [...el.querySelectorAll<HTMLElement>('[data-chip]')],
}));

const state: FilterState = { query: '', category: null, tech: [], tag: null };
let techListOpen = false;
let chipsKey = '';
let announceTimer: ReturnType<typeof setTimeout> | undefined;

function setCount(input: HTMLInputElement, count: number) {
	const label = input.closest('label') as HTMLElement;
	(label.querySelector('[data-count]') as HTMLElement).textContent = String(count);
	// Una opción marcada o con el foco nunca se deshabilita: se perdería la forma de quitarla.
	input.disabled = count === 0 && !input.checked && input !== document.activeElement;
}

function arrangeChips(card: Card, active: Set<string>) {
	if (card.chips.length === 0) return;
	const hits = card.chips.filter((chip) => active.has(chip.dataset.chip ?? ''));
	const others = card.chips.filter((chip) => !hits.includes(chip));
	const shown = Math.max(VISIBLE_TECH, hits.length);
	const ordered = [...hits, ...others];
	const box = card.el.querySelector('[data-chips]') as HTMLElement;
	const more = box.querySelector<HTMLElement>('[data-more]');
	const rest = box.querySelector<HTMLElement>('[data-rest]');

	for (const chip of card.chips) chip.classList.toggle('hit', hits.includes(chip));
	box.prepend(...ordered.slice(0, shown));
	rest?.append(...ordered.slice(shown));
	if (more && rest) {
		const hidden = ordered.length - shown;
		more.textContent = `+${hidden}`;
		more.hidden = hidden === 0;
		rest.hidden = hidden === 0;
	}
}

function pluralize(count: number): string {
	return count === 1 ? 'enlace' : 'enlaces';
}

function listJoin(items: string[]): string {
	return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items.at(-1)}`;
}

function pill(text: string, label: string, remove: () => void): HTMLButtonElement {
	const button = document.createElement('button');
	button.type = 'button';
	button.className =
		'border-accent text-accent bg-accent-soft hover:bg-accent hover:text-accent-ink inline-flex min-h-[30px] max-w-full cursor-pointer items-center gap-1.5 border py-[3px] pr-1.5 pl-2.5 text-[13px]';
	button.setAttribute('aria-label', label);
	button.dataset.pill = '';

	const name = document.createElement('span');
	name.className = 'truncate';
	name.textContent = text;
	button.append(name);
	button.insertAdjacentHTML(
		'beforeend',
		'<svg class="flex-none" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 2l6 6M8 2l-6 6"/></svg>',
	);
	button.addEventListener('click', () => {
		const index = [...actives.querySelectorAll('[data-pill]')].indexOf(button);
		remove();
		render();
		focusAfterRemoving(index);
	});
	return button;
}

function focusAfterRemoving(index: number) {
	const pills = actives.querySelectorAll<HTMLElement>('[data-pill]');
	const clear = (empty.hidden ? actives : empty).querySelector<HTMLElement>('[data-clear]');
	(pills[index] ?? clear ?? heading).focus();
}

function renderActives(words: string[], techs: string[], visible: number) {
	const items: HTMLElement[] = [];
	if (words.length > 0) {
		const text = words.join(' ');
		items.push(
			pill(`«${text}»`, `Quitar búsqueda «${text}»`, () => {
				state.query = queryWithoutWords(state.query, allTechs);
				search.value = state.query;
			}),
		);
	}
	if (state.category) {
		items.push(
			pill(state.category, `Quitar categoría ${state.category}`, () => {
				state.category = null;
				state.tag = null;
			}),
		);
	}
	if (state.tag) {
		items.push(
			pill(state.tag, `Quitar tipo ${state.tag}`, () => {
				state.tag = null;
			}),
		);
	}
	for (const tech of techs) {
		items.push(pill(tech, `Quitar ${tech}`, () => removeTech(tech)));
	}
	if (items.length > 0 && visible > 0) {
		const clear = document.createElement('button');
		clear.type = 'button';
		clear.className =
			'text-ink hover:text-accent min-h-[30px] cursor-pointer py-1 pr-1.5 text-[13px] underline underline-offset-3';
		clear.textContent = 'Limpiar filtros';
		clear.dataset.clear = '';
		items.push(clear);
	}
	actives.replaceChildren(...items);
}

function removeTech(tech: string) {
	state.tech = state.tech.filter((item) => item !== tech);
	state.query = queryWithoutTech(state.query, tech, allTechs);
	search.value = state.query;
}

function renderTechList() {
	const query = normalize(techFilter.value.trim());
	let shown = 0;
	techOptions.forEach((option, index) => {
		const inList = techListOpen ? normalize(allTechs[index]).includes(query) : index < TOP_TECHS;
		const checked = state.tech.includes(allTechs[index]);
		// La opción con el foco se queda: al ocultarla el foco caería en body.
		const focused = techInputs[index] === document.activeElement;
		const visible = inList || focused || checked;
		option.hidden = !visible;
		if (visible) shown++;
	});
	techField.hidden = !techListOpen;
	techNone.hidden = shown > 0;
	if (techMore) {
		techMore.setAttribute('aria-expanded', String(techListOpen));
		techMore.textContent = techListOpen ? 'Ver menos' : `Ver las ${allTechs.length}`;
	}
}

function renderEmpty(words: string[], techs: string[]) {
	const parts = ['Ningún enlace coincide'];
	if (words.length > 0) parts.push(`con «${words.join(' ')}»`);
	if (state.category) parts.push(`en ${state.category}`);
	if (state.tag) parts.push(`de tipo ${state.tag}`);
	if (techs.length > 0) parts.push(`con ${listJoin(techs)}`);
	emptyText.textContent = `${parts.join(' ')}.`;
}

function announce(count: number) {
	clearTimeout(announceTimer);
	announceTimer = setTimeout(() => {
		live.textContent = `${count} ${pluralize(count)}`;
	}, ANNOUNCE_DELAY);
}

function render() {
	const techs = activeTechs(state, allTechs);
	const active = new Set(techs);
	const { words } = splitQuery(state.query, allTechs);

	let visible = 0;
	for (const card of cards) {
		const show = matches(card, state, allTechs);
		card.el.hidden = !show;
		if (show) visible++;
	}

	const key = techs.join('|');
	if (key !== chipsKey) {
		chipsKey = key;
		for (const card of cards) arrangeChips(card, active);
	}

	countValue.textContent = String(visible);
	countLabel.textContent = pluralize(visible);
	showResults.textContent = `Ver ${visible} ${pluralize(visible)}`;
	announce(visible);

	grid.hidden = visible === 0;
	empty.hidden = visible > 0;
	if (visible === 0) renderEmpty(words, techs);

	const tech = facetCounts(cards, state, allTechs);
	techInputs.forEach((input) => {
		// Una tecnología escrita no marca la casilla: la casilla es más estricta que la búsqueda.
		input.checked = state.tech.includes(input.value);
		setCount(input, tech[input.value] ?? 0);
	});

	const category = categoryCounts(cards, state, allTechs);
	const total = Object.values(category).reduce((sum, count) => sum + count, 0);
	for (const input of categoryInputs) {
		input.checked = input.value === (state.category ?? '');
		setCount(input, input.value ? (category[input.value] ?? 0) : total);
	}
	categoryCurrent.textContent = state.category ?? '';

	if (tagGroup) {
		tagGroup.hidden = state.category !== GALLERY;
		const tags = tagCounts(cards, state, allTechs);
		const inGallery = categoryCounts(cards, state, allTechs)[GALLERY] ?? 0;
		for (const input of tagInputs) {
			input.checked = input.value === (state.tag ?? '');
			setCount(input, input.value ? (tags[input.value] ?? 0) : inGallery);
		}
	}

	const filters = state.tech.length + (state.category ? 1 : 0) + (state.tag ? 1 : 0);
	badge.textContent = String(filters);
	badge.hidden = filters === 0;

	renderActives(words, techs, visible);
	renderTechList();
}

function clearAll() {
	state.query = '';
	state.category = null;
	state.tag = null;
	state.tech = [];
	search.value = '';
	render();
	heading.focus();
}

function setPanelOpen(open: boolean) {
	side.toggleAttribute('data-collapsed', !open);
	toggle.setAttribute('aria-expanded', String(open));
	showResults.hidden = !open;
}

search.addEventListener('input', () => {
	state.query = search.value;
	render();
});

for (const input of categoryInputs) {
	input.addEventListener('change', () => {
		state.category = input.value || null;
		state.tag = null;
		render();
	});
}

for (const input of tagInputs) {
	input.addEventListener('change', () => {
		state.tag = input.value || null;
		render();
	});
}

for (const input of techInputs) {
	input.addEventListener('change', () => {
		state.tech = input.checked
			? [...state.tech, input.value]
			: state.tech.filter((tech) => tech !== input.value);
		render();
	});
}

techFilter.addEventListener('input', renderTechList);

techMore?.addEventListener('click', () => {
	techListOpen = !techListOpen;
	if (!techListOpen) techFilter.value = '';
	renderTechList();
	if (techListOpen) techFilter.focus();
});

toggle.addEventListener('click', () => {
	setPanelOpen(toggle.getAttribute('aria-expanded') !== 'true');
});

showResults.addEventListener('click', () => {
	setPanelOpen(false);
	heading.focus();
});

document.addEventListener('click', (event) => {
	if ((event.target as Element).closest('[data-clear]')) clearAll();
});

// El navegador puede restaurar el formulario al volver atrás.
search.value = '';
render();
clearTimeout(announceTimer);

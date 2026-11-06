/**
 * Brillo por cercanía en las fichas: cuanto más cerca pasa el cursor, más se enciende
 * el tramo del borde que lo mira. Solo con mouse y sin movimiento reducido.
 */

/** Distancia en px a la que el brillo empieza a aparecer. */
const RANGE = 140;

const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const cards = [...document.querySelectorAll<HTMLElement>('.ficha:not(.f-unv)')];
/** Solo se calculan las fichas en pantalla; las filtradas o fuera de vista no cuentan. */
const onScreen = new Set<HTMLElement>();
const lit = new Set<HTMLElement>();

let pointer: { x: number; y: number } | null = null;
let frame = 0;

function clear(card: HTMLElement) {
	card.style.removeProperty('--glow');
	card.style.removeProperty('--glow-a');
	lit.delete(card);
}

function paint() {
	frame = 0;
	if (!pointer) {
		for (const card of [...lit]) clear(card);
		return;
	}
	const { x, y } = pointer;

	// Primero todas las lecturas y después todas las escrituras, para no forzar layouts.
	const updates: Array<[HTMLElement, number, number]> = [];
	for (const card of onScreen) {
		const r = card.getBoundingClientRect();
		const dx = Math.max(r.left - x, 0, x - r.right);
		const dy = Math.max(r.top - y, 0, y - r.bottom);
		const glow = Math.max(0, 1 - Math.hypot(dx, dy) / RANGE);
		if (glow === 0) {
			if (lit.has(card)) updates.push([card, 0, 0]);
			continue;
		}
		// Ángulo desde el centro hacia el cursor, con 0 arriba y en sentido horario, como conic-gradient.
		const angle = (Math.atan2(x - (r.left + r.width / 2), (r.top + r.height / 2) - y) * 180) / Math.PI;
		updates.push([card, glow, angle]);
	}

	for (const [card, glow, angle] of updates) {
		if (glow === 0) {
			clear(card);
			continue;
		}
		card.style.setProperty('--glow', glow.toFixed(3));
		card.style.setProperty('--glow-a', angle.toFixed(1));
		lit.add(card);
	}
}

function schedule() {
	if (!frame) frame = requestAnimationFrame(paint);
}

const observer = new IntersectionObserver(
	(entries) => {
		for (const entry of entries) {
			const card = entry.target as HTMLElement;
			if (entry.isIntersecting) onScreen.add(card);
			else {
				onScreen.delete(card);
				if (lit.has(card)) clear(card);
			}
		}
		schedule();
	},
	{ rootMargin: `${RANGE}px` },
);

function onMove(event: PointerEvent) {
	if (event.pointerType !== 'mouse') return;
	pointer = { x: event.clientX, y: event.clientY };
	schedule();
}

function onLeave() {
	pointer = null;
	schedule();
}

function start() {
	for (const card of cards) observer.observe(card);
	document.addEventListener('pointermove', onMove, { passive: true });
	document.documentElement.addEventListener('pointerleave', onLeave);
	window.addEventListener('scroll', schedule, { passive: true });
}

function stop() {
	observer.disconnect();
	onScreen.clear();
	document.removeEventListener('pointermove', onMove);
	document.documentElement.removeEventListener('pointerleave', onLeave);
	window.removeEventListener('scroll', schedule);
	pointer = null;
	for (const card of [...lit]) clear(card);
}

function sync() {
	stop();
	if (fine.matches && !reduced.matches) start();
}

fine.addEventListener('change', sync);
reduced.addEventListener('change', sync);
sync();

import { shouldGoBack } from '../lib/back';

/**
 * "Volver al directorio" apunta a `/`. Si se llegó desde el directorio, vuelve en el
 * historial para conservar los filtros y el scroll; si no, sigue el enlace.
 */
for (const link of document.querySelectorAll<HTMLAnchorElement>('a[data-back]')) {
	link.addEventListener('click', (event) => {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		// En una pestaña nueva no hay a dónde volver aunque el referrer sea el directorio.
		if (history.length < 2 || !shouldGoBack(document.referrer, location.origin)) return;
		event.preventDefault();
		history.back();
	});
}

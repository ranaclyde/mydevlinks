import { shouldGoBack } from '../lib/back';

/** Si hay una entrada anterior en el historial de esta pestaña. */
function canGoBack(): boolean {
	const navigation = (window as { navigation?: { canGoBack: boolean } }).navigation;
	// Sin Navigation API, history.length también cuenta las entradas hacia adelante.
	return navigation ? navigation.canGoBack : history.length >= 2;
}

/**
 * "Volver al directorio" apunta a `/`. Si se llegó desde el directorio, vuelve en el
 * historial para conservar los filtros y el scroll; si no, sigue el enlace.
 */
for (const link of document.querySelectorAll<HTMLAnchorElement>('a[data-back]')) {
	link.addEventListener('click', (event) => {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		// En una pestaña nueva no hay a dónde volver aunque el referrer sea el directorio.
		if (!canGoBack() || !shouldGoBack(document.referrer, location.origin)) return;
		event.preventDefault();
		history.back();
	});
}

/**
 * Menús desplegables del encabezado (idioma y tema), hechos con <details>: sin JavaScript se
 * abren y cierran igual. Acá solo se suma lo que <details> no hace: abrir uno cierra el otro,
 * y un clic afuera o Escape lo cierran.
 */
const menus = [...document.querySelectorAll<HTMLDetailsElement>('details[data-menu]')];

export function closeMenu(menu: HTMLDetailsElement, focus = false) {
	menu.open = false;
	if (focus) menu.querySelector<HTMLElement>('summary')?.focus();
}

for (const menu of menus) {
	menu.addEventListener('toggle', () => {
		if (!menu.open) return;
		for (const other of menus) if (other !== menu) other.open = false;
	});
	menu.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && menu.open) {
			event.preventDefault();
			closeMenu(menu, true);
		}
	});
}

document.addEventListener('click', (event) => {
	for (const menu of menus) {
		if (menu.open && !menu.contains(event.target as Node)) closeMenu(menu);
	}
});

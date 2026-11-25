const KEY = 'mdl-theme';
const THEMES = ['system', 'light', 'dark'];
const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-theme-button]')];
const summary = document.querySelector<HTMLElement>('[data-theme-summary]');

function apply(theme: string) {
	const root = document.documentElement;
	if (theme === 'system') root.removeAttribute('data-theme');
	else root.setAttribute('data-theme', theme);
	for (const button of buttons) {
		button.setAttribute('aria-pressed', String(button.dataset.themeButton === theme));
	}
	// El disparador muestra el tema elegido (por CSS); acá se le pone el nombre para lectores de pantalla.
	const label = buttons.find((button) => button.dataset.themeButton === theme)?.textContent?.trim();
	if (summary && label) summary.setAttribute('aria-label', `${summary.dataset.label}: ${label}`);
}

function read(): string {
	try {
		const theme = localStorage.getItem(KEY) ?? '';
		return THEMES.includes(theme) ? theme : 'system';
	} catch {
		return 'system';
	}
}

function save(theme: string) {
	try {
		localStorage.setItem(KEY, theme);
	} catch {
		// Sin localStorage el tema dura hasta recargar.
	}
}

for (const button of buttons) {
	button.addEventListener('click', () => {
		const theme = button.dataset.themeButton ?? 'system';
		apply(theme);
		save(theme);
		const menu = button.closest('details');
		if (menu) {
			menu.open = false;
			menu.querySelector('summary')?.focus();
		}
	});
}

apply(read());

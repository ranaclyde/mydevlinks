const KEY = 'mdl-theme';
const THEMES = ['system', 'light', 'dark'];
const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-theme-button]')];

function apply(theme: string) {
	const root = document.documentElement;
	if (theme === 'system') root.removeAttribute('data-theme');
	else root.setAttribute('data-theme', theme);
	for (const button of buttons) {
		button.setAttribute('aria-pressed', String(button.dataset.themeButton === theme));
	}
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
	});
}

apply(read());

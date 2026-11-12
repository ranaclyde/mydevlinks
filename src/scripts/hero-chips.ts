/** "+N" en la cabecera del detalle: muestra u oculta las tecnologías que no entran. */
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-chips-toggle]')) {
	const box = button.closest<HTMLElement>('[data-hero-chips]');
	if (!box) continue;
	const collapsedText = button.textContent?.trim() ?? '';
	const collapsedLabel = button.getAttribute('aria-label') ?? '';

	button.addEventListener('click', () => {
		const open = !box.hasAttribute('data-open');
		box.toggleAttribute('data-open', open);
		button.setAttribute('aria-expanded', String(open));
		button.textContent = open ? 'Ver menos' : collapsedText;
		button.setAttribute('aria-label', open ? 'Ver menos tecnologías' : collapsedLabel);
	});
}

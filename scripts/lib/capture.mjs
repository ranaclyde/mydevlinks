/** Separa los ids pedidos en los que se pueden capturar y los errores a informar. */
export function pickTargets(ids, links) {
	const byId = new Map(links.map((link) => [link.id, link]));
	const targets = [];
	const errors = [];
	for (const id of ids) {
		const link = byId.get(id);
		if (!link) errors.push(`${id}: no existe`);
		else if (link.status === 'caido') errors.push(`${id}: está caído`);
		else if (link.private) errors.push(`${id}: es privado`);
		else targets.push(id);
	}
	return { targets, errors };
}

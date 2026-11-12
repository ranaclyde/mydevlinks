import type { Link } from './links';

function sharedTech(a: Link, b: Link): number {
	return a.tech.filter((tech) => b.tech.includes(tech)).length;
}

/** Enlaces fijados primero (en su orden) y, hasta `count`, los de la misma categoría con más tecnologías en común. */
export function alternativesFor(link: Link, links: Link[], pinned: string[] = [], count = 4): Link[] {
	const byId = new Map(links.map((other) => [other.id, other]));
	const result: Link[] = [];
	const seen = new Set<string>([link.id]);

	for (const id of pinned) {
		const found = byId.get(id);
		if (found && !seen.has(id)) {
			seen.add(id);
			result.push(found);
		}
	}

	const automatic = links
		.filter(
			(other) =>
				!seen.has(other.id) &&
				other.category === link.category &&
				other.status !== 'caido' &&
				!other.private,
		)
		.map((other) => ({ other, shared: sharedTech(link, other) }))
		.sort(
			(a, b) =>
				b.shared - a.shared || a.other.name.localeCompare(b.other.name, 'es', { sensitivity: 'base' }),
		)
		.map(({ other }) => other);

	return [...result, ...automatic].slice(0, count);
}

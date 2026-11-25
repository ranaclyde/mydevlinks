import { classifyResponse } from './site.mjs';

/** Días sin revisar a partir de los cuales un detalle se marca como viejo (unos 6 meses). */
export const STALE_DAYS = 183;

/** Respuestas que suelen venir de un antibot y no de un sitio caído. */
const BLOCKED_STATUSES = new Set([401, 403, 429]);

/**
 * ok = responde en el mismo dominio; redirect = acaba en otro dominio;
 * blocked = rechaza al bot (revisar a mano); dead = error de red o de servidor.
 * @param {{ ok?: boolean; status?: number; originalUrl: string; finalUrl?: string; error?: string }} response
 * @returns {'ok' | 'redirect' | 'blocked' | 'dead'}
 */
export function classifyCheck({ ok, status, originalUrl, finalUrl, error }) {
	if (error) return 'dead';
	if (!ok && status && BLOCKED_STATUSES.has(status)) return 'blocked';
	return classifyResponse({ ok, status, originalUrl, finalUrl });
}

/**
 * Enlaces a revisar: los públicos que no están marcados como caídos.
 * @template {{ private: boolean; status: string }} T
 * @param {T[]} links
 * @returns {T[]}
 */
export function linksToCheck(links) {
	return links.filter((link) => !link.private && link.status !== 'down');
}

/**
 * Detalles revisados hace más de `days` días, del más viejo al más nuevo.
 * @param {Array<{ id: string; name: string }>} links
 * @param {Map<string, { reviewedAt: string }>} details
 * @param {string} today fecha ISO
 */
export function staleLinks(links, details, today, days = STALE_DAYS) {
	const limit = new Date(`${today}T00:00:00Z`).getTime() - days * 86_400_000;
	return links
		.flatMap((link) => {
			const reviewedAt = details.get(link.id)?.reviewedAt;
			return reviewedAt && new Date(`${reviewedAt}T00:00:00Z`).getTime() < limit
				? [{ id: link.id, name: link.name, reviewedAt }]
				: [];
		})
		.sort((a, b) => a.reviewedAt.localeCompare(b.reviewedAt));
}

const item = (r) => `- [ ] **${r.name}** (\`${r.id}\`): ${r.url}`;

/**
 * Informe en Markdown para el issue. `problems` cuenta lo que pide acción: caídos, redirecciones
 * y detalles viejos. Los bloqueos van aparte porque casi siempre son antibots.
 * @param {{ results: Array<{ id: string; name: string; url: string; state: string; finalUrl?: string; detail?: string }>; stale: Array<{ id: string; name: string; reviewedAt: string }>; today: string; checked: number }} input
 */
export function buildReport({ results, stale, today, checked }) {
	const dead = results.filter((r) => r.state === 'dead');
	const redirect = results.filter((r) => r.state === 'redirect');
	const blocked = results.filter((r) => r.state === 'blocked');
	const problems = dead.length + redirect.length + stale.length;
	const lines = [`Revisión del ${today}: ${checked} enlaces pedidos.`, ''];

	if (!problems) lines.push('No hay enlaces caídos, redirigidos ni sin revisar hace más de 6 meses.', '');
	if (dead.length) {
		lines.push(`## Caídos (${dead.length})`, '');
		lines.push('No respondieron o dieron error de servidor, también al reintentar. Ábrelos en un navegador: si siguen caídos, pasa su `status` a `down`.', '');
		lines.push(...dead.map((r) => `${item(r)}. ${r.detail}`), '');
	}
	if (redirect.length) {
		lines.push(`## Redirigen a otro dominio (${redirect.length})`, '');
		lines.push('Si es el mismo producto con otro nombre, actualiza la URL (y el id, si cambia el dominio). Si es otra cosa, el enlace se quita.', '');
		lines.push(...redirect.map((r) => `${item(r)} → ${r.finalUrl}`), '');
	}
	if (stale.length) {
		lines.push(`## Sin revisar hace más de 6 meses (${stale.length})`, '');
		lines.push('Vuelve a leer el sitio, corrige el detalle (sobre todo el precio) y actualiza `reviewedAt` y la captura.', '');
		lines.push(...stale.map((s) => `- [ ] **${s.name}** (\`${s.id}\`): revisado el ${s.reviewedAt}`), '');
	}
	if (blocked.length) {
		lines.push(
			'<details>',
			`<summary>Rechazan al bot (${blocked.length}): no cuentan como problema</summary>`,
			'',
			'Respondieron 401, 403 o 429. Casi siempre es un antibot y el sitio funciona en un navegador. Revísalos a mano solo si siguen acá varias semanas.',
			'',
			...blocked.map((r) => `${item(r)}. ${r.detail}`),
			'',
			'</details>',
			'',
		);
	}
	lines.push('---', 'Generado por `pnpm check-links` (`.github/workflows/check-links.yml`). Se actualiza cada semana y se cierra solo cuando no queda nada pendiente.');
	return { markdown: `${lines.join('\n')}\n`, problems };
}

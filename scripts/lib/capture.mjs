/** Separa los ids pedidos en los que se pueden capturar y los errores a informar. */
export function pickTargets(ids, links) {
	const byId = new Map(links.map((link) => [link.id, link]));
	const targets = [];
	const errors = [];
	for (const id of ids) {
		const link = byId.get(id);
		if (!link) errors.push(`${id}: no existe`);
		else if (link.status === 'down') errors.push(`${id}: está caído`);
		else if (link.private) errors.push(`${id}: es privado`);
		else targets.push(id);
	}
	return { targets, errors };
}

/** Tamaño de las capturas: el viewport de escritorio con el que se toman. */
export const SCREENSHOT_SIZE = { width: 1280, height: 800 };

/** Calidad WebP: el texto de las portadas se lee bien y cada captura queda en unos 30-60 KB. */
export const WEBP_QUALITY = 82;

/**
 * Guarda una captura como `<dir>/<id>.webp` de 1280×800 (recorta desde arriba si la imagen tiene
 * otra proporción) y borra la versión JPG anterior, si había. Devuelve la ruta escrita.
 * @param {Buffer | string} input imagen en memoria o ruta a un archivo
 * @param {string} id
 * @param {string} dir
 */
export async function saveScreenshot(input, id, dir) {
	const { default: sharp } = await import('sharp');
	const { existsSync, mkdirSync, rmSync } = await import('node:fs');
	mkdirSync(dir, { recursive: true });
	const out = `${dir}/${id}.webp`;
	await sharp(input)
		.resize({ ...SCREENSHOT_SIZE, fit: 'cover', position: 'top' })
		.webp({ quality: WEBP_QUALITY })
		.toFile(out);
	const old = `${dir}/${id}.jpg`;
	if (existsSync(old)) rmSync(old);
	return out;
}

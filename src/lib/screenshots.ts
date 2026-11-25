import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

/**
 * Capturas en `src/assets/screenshots/<id>.<ext>`. Las nuevas se guardan en WebP; las primeras
 * siguen en JPG. Astro genera al compilar las versiones WebP en varios anchos que se sirven
 * (AVIF salía más pesado con la misma calidad).
 */
const files = import.meta.glob<ImageMetadata>('../assets/screenshots/*.{jpg,webp}', { eager: true, import: 'default' });

const byId = new Map(
	Object.entries(files).map(([path, image]) => [path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.')), image]),
);

export function screenshotOf(id: string): ImageMetadata | undefined {
	return byId.get(id);
}

/** Captura en JPG de 1280×800 para og:image: las redes no siempre aceptan WebP o AVIF. */
export async function screenshotOgImage(id: string) {
	const src = byId.get(id);
	if (!src) return undefined;
	const image = await getImage({ src, format: 'jpg', width: 1280, quality: 80 });
	return { path: image.src, width: 1280, height: 800 };
}

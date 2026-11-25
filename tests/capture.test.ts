import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterEach, describe, expect, it } from 'vitest';
import { pickTargets, saveScreenshot } from '../scripts/lib/capture.mjs';

const links = [
	{ id: 'activo-a', status: 'active', private: false },
	{ id: 'viejo-b', status: 'outdated', private: false },
	{ id: 'caido-c', status: 'down', private: false },
	{ id: 'privado-d', status: 'active', private: true },
];

describe('pickTargets', () => {
	it('acepta un id válido', () => {
		expect(pickTargets(['activo-a', 'viejo-b'], links)).toEqual({ targets: ['activo-a', 'viejo-b'], errors: [] });
	});

	it('rechaza un id desconocido', () => {
		expect(pickTargets(['nada'], links)).toEqual({ targets: [], errors: ['nada: no existe'] });
	});

	it('rechaza un enlace caído', () => {
		expect(pickTargets(['caido-c'], links)).toEqual({ targets: [], errors: ['caido-c: está caído'] });
	});

	it('rechaza un enlace privado', () => {
		expect(pickTargets(['privado-d'], links)).toEqual({ targets: [], errors: ['privado-d: es privado'] });
	});

	it('separa válidos y errores en un mismo pedido', () => {
		expect(pickTargets(['activo-a', 'nada', 'privado-d'], links)).toEqual({
			targets: ['activo-a'],
			errors: ['nada: no existe', 'privado-d: es privado'],
		});
	});
});

describe('saveScreenshot', () => {
	let dir = '';
	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	it('guarda un WebP de 1280×800 recortado desde arriba y borra la JPG anterior', async () => {
		dir = mkdtempSync(join(tmpdir(), 'capture-'));
		writeFileSync(join(dir, 'x.jpg'), 'vieja');
		const input = await sharp({ create: { width: 1440, height: 2000, channels: 3, background: '#fff' } }).png().toBuffer();

		const out = await saveScreenshot(input, 'x', dir);

		expect(out).toBe(`${dir}/x.webp`);
		expect(await sharp(out).metadata()).toMatchObject({ format: 'webp', width: 1280, height: 800 });
		expect(existsSync(join(dir, 'x.jpg'))).toBe(false);
	});
});

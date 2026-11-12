import { describe, expect, it } from 'vitest';
import { pickTargets } from '../scripts/lib/capture.mjs';

const links = [
	{ id: 'activo-a', status: 'activo', private: false },
	{ id: 'viejo-b', status: 'antiguo', private: false },
	{ id: 'caido-c', status: 'caido', private: false },
	{ id: 'privado-d', status: 'activo', private: true },
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

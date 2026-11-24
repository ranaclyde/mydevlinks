import { describe, expect, it } from 'vitest';
import { shouldGoBack } from '../src/lib/back';

const origin = 'http://localhost:4331';

describe('shouldGoBack', () => {
	it('vuelve en el historial si se llegó desde el directorio', () => {
		expect(shouldGoBack('http://localhost:4331/?cat=X', origin)).toBe(true);
	});

	it('no vuelve si se entró directo', () => {
		expect(shouldGoBack('', origin)).toBe(false);
	});

	it('no vuelve si se llegó desde otro sitio', () => {
		expect(shouldGoBack('https://example.com/', origin)).toBe(false);
	});

	it('en inglés vuelve solo si se llegó desde el directorio en inglés', () => {
		expect(shouldGoBack('http://localhost:4331/en?cat=X', origin, '/en')).toBe(true);
		expect(shouldGoBack('http://localhost:4331/', origin, '/en')).toBe(false);
	});

	it('no vuelve si se llegó desde otra página de enlace', () => {
		expect(shouldGoBack('http://localhost:4331/tool/otro', origin)).toBe(false);
	});
});

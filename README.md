# mydevlinks

Una base propia de enlaces para desarrollar, que reemplaza años de bookmarks. Cada enlace se entiende sin abrirlo y se filtra por categoría, tecnología y texto. Es una sola página estática en Astro y Tailwind, sin framework de interfaz.

## Ejecutar

Requiere la versión de Node de `.nvmrc`.

```sh
nvm use
pnpm install
pnpm exec playwright install chromium   # solo para test:e2e
```

| Comando | Qué hace |
| --- | --- |
| `pnpm astro dev --background` | Servidor de desarrollo. Se maneja con `pnpm astro dev status`, `logs` y `stop`. |
| `pnpm test` | Pruebas unitarias y de datos con Vitest. |
| `pnpm test:e2e` | Pruebas de navegador con Playwright, sobre un build nuevo. |
| `pnpm check` | Revisión de tipos con `astro check`. |
| `pnpm build` | Build estático en `dist/`. |

## Agregar un enlace

Agrega una entrada a `src/data/links.json`:

```json
{
	"id": "ejemplo-dev",
	"name": "Ejemplo",
	"url": "https://ejemplo.dev/",
	"description": "Qué es y para qué sirve, en unos 75 caracteres para que entre en la ficha.",
	"category": "Componentes y UI kits",
	"tech": ["React", "Tailwind"],
	"status": "activo",
	"verified": true,
	"private": false,
	"logo": "/logos/ejemplo-dev.png"
}
```

- **Categorías, estados y tecnologías:** son listas cerradas en `src/lib/links.ts` (`CATEGORIES`, `STATUSES`, `TECHS`). Una tecnología nueva se agrega a `TECHS`. Sus otras formas de escribirla van en `TECH_ALIASES`, en `src/lib/filter.ts`.
- **Logo:** el archivo va en `public/logos/` y es opcional. Sin logo, la ficha muestra la inicial.
- **`verified: false`:** el enlace va sin `description` ni `tech`, y la ficha lo indica.
- **`private: true`:** el enlace se ve en desarrollo y no entra en el build. No le pongas logo, porque `public/` se copia entero a `dist/`.

**Qué lo valida:** `linkSchema`, en `src/lib/links.ts`, hace fallar `pnpm build` si un valor no es válido, por ejemplo una tecnología mal escrita. `pnpm test` revisa además en `tests/data.test.ts` que `id` y `url` sean únicos, que el logo exista y el largo de la descripción, y `pnpm test:e2e` que los privados no lleguen a `dist/`.

## Scripts

Los archivos de `scripts/` se usaron una sola vez, para analizar los sitios. Necesitan una caché local que está fuera de git, y no hacen falta para agregar enlaces.

# toolshelf

Una base propia de enlaces para desarrollar, que reemplaza años de bookmarks. Cada enlace se entiende sin abrirlo y se filtra por categoría, tecnología y texto. En el directorio, la ficha lleva al detalle del enlace (`/tool/<id>`) y la flecha junto al nombre abre la web en otra pestaña. Es un sitio estático en Astro y Tailwind, sin framework de interfaz.

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
- **`tags`:** solo para Galerías de inspiración y enlaces verificados. Dice qué muestra la galería y alimenta el filtro "Tipo de galería". Es una lista cerrada en `GALLERY_TAGS`, en `src/lib/links.ts`; cada galería verificada lleva al menos una.
- **Logo:** el archivo va en `public/logos/` y es opcional. Sin logo, la ficha muestra la inicial.
- **`verified: false`:** el enlace va sin `description` ni `tech`, y la ficha lo indica.
- **`featured: true`:** opcional. El enlace aparece primero, con un tinte índigo en el borde y una estrella en la esquina. Solo para enlaces verificados.
- **`private: true`:** el enlace se ve en desarrollo y no entra en el build. No le pongas logo, porque `public/` se copia entero a `dist/`.

**Qué lo valida:** `linkSchema`, en `src/lib/links.ts`, hace fallar `pnpm build` si un valor no es válido, por ejemplo una tecnología mal escrita. `pnpm test` revisa además en `tests/data.test.ts` que `id` y `url` sean únicos, que el logo exista y el largo de la descripción, y `pnpm test:e2e` que los privados no lleguen a `dist/`.

## Agregar un detalle

Cada enlace público tiene una página `/tool/<id>`. Con el archivo `src/data/detalles/<id>.json` muestra el detalle completo; sin él, la página queda sin contenido. Los campos los valida `detailSchema`, en `src/lib/details.ts`:

- **`whatIs`:** uno o dos párrafos que explican qué es.
- **`uses`:** exactamente tres usos.
- **`caveats`:** dos o tres cosas a tener en cuenta.
- **`pricing`:** `gratis`, `freemium` o `de-pago`. **`pricingNote`** lo aclara en una frase.
- **`pricingUrl`:** la página de precios. Es obligatoria salvo si el precio es `gratis`.
- **`idealFor`:** para quién es.
- **`reviewedAt`:** fecha ISO (`YYYY-MM-DD`) de la revisión.
- **`reviewedByAuthor`:** `true` solo si el autor revisó el texto. Con `false`, el detalle muestra el aviso "Descripción generada a partir del sitio".
- **`screenshotAt`:** opcional, fecha ISO de la captura.
- **`alternatives`:** opcional, ids de otros enlaces.

La captura de pantalla es un archivo estático, `public/capturas/<id>.jpg`. Se toma a mano con Chromium (1280×800):

```sh
pnpm capture <id> [<id>…]
```

El script rechaza ids que no existen y enlaces caídos o privados, y al terminar recuerda poner `screenshotAt` en el JSON. No corre en el build ni en las pruebas. `pnpm test` falla si hay una captura sin su detalle.

## Publicar en Netlify

`netlify.toml` define el build (`pnpm build`, carpeta `dist`), los headers de seguridad y la caché. Netlify toma Node de `.nvmrc` y pnpm del campo `packageManager` de `package.json`, así que no hace falta configurar nada en el panel: basta con conectar el repositorio.

- **Dominio:** `astro.config.mjs` usa la variable `URL` que Netlify define en cada build, con el dominio principal del sitio. De ella salen el canonical, las URLs de Open Graph, el sitemap y `robots.txt`. Al cambiar de dominio en Netlify, el próximo deploy lo toma solo.
- **Previews:** los deploy previews y branch deploys se construyen con `SITE_NOINDEX=1`, que pone `noindex` en todas las páginas y `Disallow: /` en `robots.txt`.
- **URLs:** las fichas se generan como `/tool/<id>.html` y se sirven en `/tool/<id>`, sin barra final.

## SEO

Cada página lleva título, descripción, canonical, Open Graph y tarjeta de X. Las fichas usan su captura como imagen para redes; el inicio y la 404 usan `public/og.png` (1200×630). El inicio declara `WebSite` y `CollectionPage` en JSON-LD, y cada ficha `BreadcrumbList` y `WebPage`. `/sitemap.xml` lista el inicio y cada enlace público, con la fecha de revisión de su detalle como `lastmod`.

## Scripts

Salvo `capture.mjs`, los archivos de `scripts/` se usaron una sola vez, para analizar los sitios. Necesitan una caché local que está fuera de git, y no hacen falta para agregar enlaces.

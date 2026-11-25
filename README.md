# toolshelf

Una base propia de enlaces para desarrollar, que reemplaza años de bookmarks. Cada enlace se entiende sin abrirlo y se filtra por categoría, tecnología y texto. En el directorio, la ficha lleva al detalle del enlace (`/tool/<id>`) y la flecha junto al nombre abre la web en otra pestaña. Es un sitio estático en Astro y Tailwind, sin framework de interfaz, en español y en inglés.

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
| `pnpm add-link <url>` | Crea un enlace nuevo con su logo y los archivos por completar. Ver [docs/adding-links.md](docs/adding-links.md). |
| `pnpm capture <id>` | Toma la captura de un enlace. |

## Agregar un enlace

> El paso a paso completo, de la URL al pull request, está en [docs/adding-links.md](docs/adding-links.md). Para otros aportes, ver [CONTRIBUTING.md](CONTRIBUTING.md). Esta sección describe el formato de los datos.

Agrega una entrada a `src/data/links.json`:

```json
{
	"id": "ejemplo-dev",
	"name": "Ejemplo",
	"url": "https://ejemplo.dev/",
	"description": "Qué es y para qué sirve, en unos 75 caracteres para que entre en la ficha.",
	"category": "components",
	"tech": ["React", "Tailwind"],
	"status": "active",
	"verified": true,
	"private": false,
	"logo": "/logos/ejemplo-dev.png"
}
```

- **Categorías, estados y tecnologías:** son listas cerradas en `src/lib/links.ts` (`CATEGORIES`, `STATUSES`, `TECHS`). Las categorías, los tipos y los estados (`active`, `outdated`, `down`) son ids en inglés; el nombre que se ve en cada idioma está en `src/i18n/ui.ts`. Una tecnología nueva se agrega a `TECHS`. Sus otras formas de escribirla van en `TECH_ALIASES`, en `src/lib/filter.ts`.
- **`tags`:** solo para galerías de inspiración (`inspiration`) y enlaces verificados. Dice qué muestra la galería y alimenta el filtro "Tipo de galería". Es una lista cerrada en `GALLERY_TAGS`, en `src/lib/links.ts`; cada galería verificada lleva al menos una.
- **Logo:** el archivo va en `public/logos/` y es opcional. Sin logo, la ficha muestra la inicial.
- **`verified: false`:** el enlace va sin `description` ni `tech`, y la ficha lo indica.
- **`featured: true`:** opcional. El enlace aparece primero, con un tinte índigo en el borde y una estrella en la esquina. Solo para enlaces verificados.
- **`private: true`:** el enlace se ve en desarrollo y no entra en el build. No le pongas logo, porque `public/` se copia entero a `dist/`.

**Qué lo valida:** `linkSchema`, en `src/lib/links.ts`, hace fallar `pnpm build` si un valor no es válido, por ejemplo una tecnología mal escrita. `pnpm test` revisa además en `tests/data.test.ts` que `id` y `url` sean únicos, que el logo exista y el largo de la descripción, y `pnpm test:e2e` que los privados no lleguen a `dist/`.

## Agregar un detalle

Cada enlace público tiene una página `/tool/<id>`. Con el archivo `src/data/details/<id>.json` muestra el detalle completo; sin él, la página queda sin contenido. Los campos los valida `detailSchema`, en `src/lib/details.ts`:

- **`whatIs`:** uno o dos párrafos que explican qué es.
- **`uses`:** exactamente tres usos.
- **`caveats`:** dos o tres cosas a tener en cuenta.
- **`pricing`:** `free`, `freemium` o `paid`. **`pricingNote`** lo aclara en una frase.
- **`pricingUrl`:** la página de precios. Es obligatoria salvo si el precio es `free`.
- **`idealFor`:** para quién es.
- **`reviewedAt`:** fecha ISO (`YYYY-MM-DD`) de la revisión.
- **`reviewedByAuthor`:** `true` solo si el autor revisó el texto. Con `false`, el detalle muestra el aviso "Descripción generada a partir del sitio".
- **`screenshotAt`:** opcional, fecha ISO de la captura.
- **`alternatives`:** opcional, ids de otros enlaces.

La captura de pantalla es un archivo estático, `public/screenshots/<id>.jpg`. Se toma a mano con Chromium (1280×800):

```sh
pnpm capture <id> [<id>…]
```

El script rechaza ids que no existen y enlaces caídos o privados, y al terminar recuerda poner `screenshotAt` en el JSON. No corre en el build ni en las pruebas. `pnpm test` falla si hay una captura sin su detalle.

## Idiomas

El sitio usa el [i18n de Astro](https://docs.astro.build/en/guides/internationalization/). El español va en la raíz (`/`, `/tool/<id>`) y el inglés bajo `/en` (`/en`, `/en/tool/<id>`). Las páginas de `src/pages/` y de `src/pages/en/` solo eligen la ruta; el contenido está en `src/views/`, y cada componente toma el idioma de `Astro.currentLocale`.

- **Textos de la interfaz:** están en `src/i18n/ui.ts`, un diccionario por idioma con la misma forma. Los scripts del navegador lo leen según `<html lang>`. Las categorías, los tipos de galería y los precios se traducen solo como etiqueta. Su valor interno es un id en inglés, el mismo en los dos idiomas, que es el que usan los datos y los filtros de la URL (`?category=developer-tools&price=free`).
- **Contenido en inglés:** la descripción de cada enlace va en `src/data/en/links.json`, como `{ "id", "description" }`. Los textos de cada detalle (`whatIs`, `uses`, `caveats`, `pricingNote` e `idealFor`) van en `src/data/en/details/<id>.json`. El precio, las fechas, la captura y las alternativas salen del detalle en español.
- **Lo que falta traducir:** la página en inglés muestra el texto en español, avisa que no está traducida y lleva `noindex`. Tampoco tiene `hreflang` y no entra en el sitemap. Cuando una ficha tiene todos sus textos en inglés, las dos versiones se enlazan con `hreflang` y las dos van al sitemap. El inicio en inglés hace lo mismo cuando están todas las descripciones.

## Publicar en Netlify

`netlify.toml` define el build (`pnpm build`, carpeta `dist`), los headers de seguridad y la caché. Netlify toma Node de `.nvmrc` y pnpm del campo `packageManager` de `package.json`, así que no hace falta configurar nada en el panel: basta con conectar el repositorio.

- **Dominio:** `astro.config.mjs` usa la variable `URL` que Netlify define en cada build, con el dominio principal del sitio. De ella salen el canonical, las URLs de Open Graph, el sitemap y `robots.txt`. Al cambiar de dominio en Netlify, el próximo deploy lo toma solo.
- **Previews:** los deploy previews y branch deploys se construyen con `SITE_NOINDEX=1`, que pone `noindex` en todas las páginas y `Disallow: /` en `robots.txt`.
- **URLs:** las fichas se generan como `/tool/<id>.html` y se sirven en `/tool/<id>`, sin barra final. El inicio en inglés es `/en.html`, que se sirve en `/en`.
- **404:** una ruta que no existe bajo `/en/` muestra `/en/404.html`, por una regla de `netlify.toml`. Cualquier otra muestra `/404.html`.

## SEO

Cada página lleva título, descripción, canonical, Open Graph y tarjeta de X. Las fichas usan su captura como imagen para redes; el inicio y la 404 usan `public/og.png` (1200×630). El inicio declara `WebSite` y `CollectionPage` en JSON-LD, y cada ficha `BreadcrumbList` y `WebPage`, con el idioma en `inLanguage`. `/sitemap.xml` lista el inicio y cada enlace público, con la fecha de revisión de su detalle como `lastmod`. Las páginas traducidas aparecen en los dos idiomas, enlazadas con `xhtml:link`.

## Scripts

- **`add-link.mjs`** (`pnpm add-link`): crea un enlace nuevo a partir de su URL. Revisa duplicados, pide la página, baja el logo y deja los archivos por completar.
- **`capture.mjs`** (`pnpm capture`): toma las capturas.
- **`fetch-sites.mjs`:** se usó una sola vez, para analizar los sitios importados de los bookmarks. Necesita una caché local que está fuera de git y no hace falta para agregar enlaces.

Las funciones compartidas están en `scripts/lib/` y tienen sus pruebas en `tests/`.

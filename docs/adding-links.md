# Agregar un enlace

Paso a paso para pasar de una URL a un pull request con el enlace completo: ficha en el directorio, página de detalle con captura y versión en inglés. Sirve igual para personas que para agentes de IA. Si usas Claude Code, `/toolshelf-add-link <url>` sigue esta misma guía.

El formato de cada campo está en el [README](../README.md#agregar-un-enlace). Esta guía dice **cómo** se completa y **qué se revisa**.

## Antes de empezar: ¿entra en la colección?

toolshelf es una colección curada de recursos para construir interfaces web: componentes, inspiración, iconos, fuentes, generadores, herramientas para el día a día del frontend, CMS y backends sin servidor, constructores con IA, documentación y directorios. Antes de agregar algo, comprueba que:

- **Es una herramienta o un recurso que se usa, no contenido suelto.** No van vídeos de YouTube, artículos o tutoriales sueltos, ni pens de CodePen.
- **Es de frontend o lo usa el frontend.** No van bases de datos (Turso, Neon, MongoDB Atlas…), editores de código generales ni recursos fuera del tema (por ejemplo, datasets).
- **Está vigente.** No van productos declarados obsoletos ni librerías atadas a versiones que llegaron al fin de su vida útil (Vue 2, Nuxt 2, Bootstrap 4…).
- **Responde y es lo que dice ser.** Si la web está caída, es un dominio estacionado o redirige a otro producto, no se agrega. Si redirige al mismo producto con otro nombre, se agrega la URL nueva.
- **No está repetido.** Se prefiere la raíz del producto (`https://flowbite.com/`) a una subpágina (`https://flowbite.com/blocks/`), salvo que la subpágina sea un recurso distinto, como Material Symbols dentro de Google Fonts.

Si dudas, pregunta en el issue o en el pull request antes de escribir.

## Requisitos

```sh
nvm use                                  # versión de Node de .nvmrc
pnpm install
pnpm exec playwright install chromium    # para las capturas y test:e2e
```

## Paso a paso

### 1. Rama

```sh
git switch main && git pull
git switch -c feat/enlace-<nombre>
```

Si son varios enlaces relacionados, pueden ir en la misma rama y el mismo PR.

### 2. Crear la entrada

```sh
pnpm add-link <url> [--name "Nombre"] [--id id] [--force]
```

El script:

1. Arma el id con el dominio sin `www` y la ruta, en minúsculas y con guiones: `https://www.daisyui.com/` da `daisyui-com`, y `https://fonts.google.com/icons` da `fonts-google-com-icons`. `--id` lo cambia, pero sigue esa convención salvo que haya un motivo.
2. Corta si la URL o el id ya están en el directorio, y avisa si hay otros enlaces del mismo dominio. En ese caso revisa que el nuevo no repita a alguno.
3. Pide la página. Corta si no responde o si redirige a otro dominio.
4. Baja el icono del sitio a `public/logos/<id>.<ext>`.
5. Crea las entradas para completar: el enlace en `src/data/links.json`, su traducción en `src/data/en/links.json`, y el detalle en `src/data/details/<id>.json` y `src/data/en/details/<id>.json`, con la fecha de hoy.

Los campos quedan vacíos a propósito: `pnpm test` y el build fallan hasta completarlos. El nombre sale del `<title>` de la página; corrígelo con el nombre del producto tal como lo escribe su marca (`daisyUI`, no `DaisyUI - Tailwind CSS Components`).

**Si el script dice que el sitio no responde,** ábrelo en un navegador. Si carga, el sitio bloquea bots (pasa con Freepik, Unsplash o SVG Repo): repite con `--force` y saca el logo a mano (paso 6). Si tampoco carga en el navegador, el enlace no se agrega.

**Si dice que redirige a otro dominio,** mira adónde. Si es el mismo producto con otro nombre, usa la URL final. `--force` deja la original, y casi nunca es lo correcto.

### 3. Leer el sitio real

Todo lo que se escriba tiene que salir de lo que el sitio dice hoy. Lee como mínimo:

- la portada;
- la documentación o la introducción;
- la página de precios, de licencia o la tienda, si existe;
- el repositorio, si es código abierto, para confirmar la licencia.

Si un dato (licencia, qué es gratis, cifras como "más de 200 componentes") no se puede confirmar, **se deja fuera**. No se adivina ni se completa con lo que "suele ser".

### 4. Completar el enlace (`src/data/links.json`)

- **`description`:** qué es y para qué sirve, en una frase de unos 70 caracteres (máximo 120, para que entre en la ficha). Arranca por lo que es, sin repetir el nombre, y termina con punto. Ejemplos:
  - `Biblioteca de componentes semánticos para Tailwind, con temas incluidos.`
  - `Comprime y compara imágenes con distintos códecs desde el navegador.`
- **`category`:** una sola, de la tabla de abajo.
- **`tech`:** solo las tecnologías con las que el recurso **funciona de verdad**: el framework de los componentes, el lenguaje del código que entrega o con el que se integra. La lista es cerrada (`TECHS` en `src/lib/links.ts`). Si el recurso no depende de ninguna, como una galería o un editor de imágenes, va vacía. Una tecnología nueva solo se suma a `TECHS` si hace falta de verdad, y se avisa en el PR.
- **`tags`:** solo en galerías de inspiración (`inspiration`), y en ellas es obligatorio. Dice qué muestra la galería: `websites`, `landing-pages`, `sections`, `app-ui`, `motion`, `visual-styles`, `design-systems` o `branding`. Pueden ser varias.
- **`status`:** `active`. `outdated` y `down` son para enlaces que ya estaban y envejecieron, no para agregar uno nuevo.
- **`featured`:** no lo pongas. Lo decide quien mantiene el sitio.

| `category` | Nombre en el sitio | Qué va |
| --- | --- | --- |
| `components` | Componentes y UI kits | Librerías y colecciones de componentes, incluidos los animados (Magic UI, Aceternity UI). |
| `animation` | Animación y efectos | Librerías y herramientas de animación, 3D y efectos visuales (Spline). |
| `inspiration` | Galerías de inspiración | Galerías de sitios, landings, secciones, interfaces o estilos. Llevan `tags`. |
| `icons` | Iconos e ilustraciones | Iconos, ilustraciones, avatares y bancos de imágenes (Unsplash, Magnific). |
| `fonts-color` | Fuentes y color | Tipografías, paletas y herramientas de color. |
| `generators` | Generadores CSS/SVG | Herramientas que generan código CSS o SVG: sombras, degradados, blobs, patrones. También los optimizadores de SVG. |
| `developer-tools` | Herramientas de desarrollo | Utilidades del día a día: conversores, editores de imágenes (Squoosh), servicios y APIs que se usan desde el frontend (Resend, Public APIs). |
| `serverless` | Serverless | CMS headless (Strapi, Directus) y backends sin servidor (PocketBase). No bases de datos sueltas. |
| `ai-builders` | Constructores con IA | Herramientas que generan sitios o interfaces con IA, y colecciones de prompts para eso. |
| `learning` | Aprendizaje y documentación | Documentación oficial, guías de referencia y sitios para aprender (Refactoring.Guru). |
| `directories` | Directorios de recursos | Sitios que, como este, reúnen enlaces a otras herramientas. |

### 5. Completar el detalle (`src/data/details/<id>.json`)

El esquema está en `detailSchema` (`src/lib/details.ts`) y el ejemplo de tono y forma es `src/data/details/daisyui-com.json`.

- **`whatIs`:** uno o dos párrafos. El primero dice qué es y cómo funciona; el segundo, si hace falta, cuándo conviene.
- **`uses`:** exactamente tres casos prácticos que un developer reconozca ("Armar el panel de administración de un proyecto personal…"), no frases de marketing ("Mejora tu productividad").
- **`caveats`:** dos o tres cosas reales que revisar antes de elegirlo: requisitos, límites del plan gratis, dependencias, licencia.
- **`pricing`:**
  - `free`: el producto listado no tiene plan pago ni funciones bloqueadas, aunque se vendan extras aparte (eso va en `pricingNote`).
  - `freemium`: hay un plan gratis y uno pago del mismo producto. También cuando los términos mencionan planes pagos aunque no haya precios publicados.
  - `paid`: no hay uso gratis real. Una prueba temporal no cuenta como gratis.
- **`pricingNote`:** una frase corta que lo aclara ("Código abierto con licencia MIT; la tienda vende plantillas y extras de pago.").
- **`pricingUrl`:** obligatoria salvo con `free`. Es la página donde el sitio informa los precios o, si no tiene una, la página donde aparece esa información (por ejemplo, los términos). Si no aplica, borra el campo.
- **`idealFor`:** una frase corta que dice para quién es.
- **`reviewedAt`** y **`screenshotAt`:** los deja el script con la fecha de hoy. Si no hay captura, borra `screenshotAt`.
- **`reviewedByAuthor`:** `false`. Solo quien mantiene el sitio lo pasa a `true` cuando revisa el texto.
- **`alternatives`:** no lo pongas. Las alternativas se calculan solas con la categoría y las tecnologías en común.

**Reglas de redacción** (para la descripción y el detalle):

- Español neutro, sin voseo: "puedes", no "podés". Claro, concreto y con palabras propias. Nunca se copian frases del sitio.
- Los nombres de clases, APIs, comandos y productos van tal cual (`btn`, `showModal()`, `npx shadcn add`).
- El texto le habla a quien visita el sitio, no a quien lo editó. Nada de "según el sitio", "no pude confirmar…" o "la web no lo dice". Lo que no se puede confirmar, se omite.

### 6. Logo

Si el script bajó el logo, ábrelo y mira que sea el del producto y se vea bien en tamaño chico. Si no lo bajó o salió mal:

1. Busca el icono oficial del sitio: en el `<head>`, el `<link rel="icon">` o el `apple-touch-icon`. Si no, el logo de su kit de prensa o de su repositorio. Prefiere SVG; si no, el PNG más grande.
2. Guárdalo como `public/logos/<id>.<ext>`, de menos de 512 KB.
3. Pon `"logo": "/logos/<id>.<ext>"` en el enlace.

Sin logo, la ficha muestra la inicial del nombre; no es un error. Cuidado con las extensiones del navegador que inyectan su propio favicon en la página: el icono tiene que venir del sitio.

### 7. Captura

```sh
pnpm capture <id>
```

Toma la portada con Chromium a 1280×800 y la guarda en `public/screenshots/<id>.jpg`. Ábrela y revísala:

- **Sale a medio cargar o a medio animar.** Es común en sitios que se arman en el navegador. Repite con más espera: copia `scripts/capture.mjs` a una carpeta temporal, sube `SETTLE_MS` (8000 a 12000) y córrela desde la raíz del repo.
- **La tapa un banner de cookies, un modal o un muro de login.** Ciérralo antes de capturar (con un script de Playwright de un solo uso o desde el navegador) y vuelve a tomarla. Una barra promocional chica o un anuncio a un costado no impiden usarla.
- **El sitio bloquea bots.** No intentes saltarte la protección. Toma la captura desde un navegador normal, con la ventana a 1280×800 de área visible, y guárdala como JPG de 1280×800 en `public/screenshots/<id>.jpg`.

Si no hay forma de una captura limpia, no la incluyas, borra `screenshotAt` del detalle y avísalo en el PR.

### 8. Traducción al inglés

- **`src/data/en/links.json`:** la descripción en inglés del enlace, de 120 caracteres como máximo.
- **`src/data/en/details/<id>.json`:** `whatIs`, `uses`, `caveats`, `pricingNote` e `idealFor`, con **la misma cantidad** de párrafos, usos y advertencias que el original. El precio, las fechas y la captura salen del detalle en español.

Inglés natural, no literal, con el mismo contenido: no se agrega ni se quita información. Las cifras, los nombres y los comandos tienen que coincidir con el español; revísalos uno por uno.

Sin la traducción, la página en inglés se publica con `noindex`, queda fuera del sitemap y el inicio en inglés también deja de indexarse. Por eso es parte del enlace, no un extra.

### 9. Verificar

```sh
pnpm test        # datos, esquemas y traducciones
pnpm check       # tipos
pnpm test:e2e    # navegador, sobre un build nuevo
```

Los tres tienen que pasar. Después, mira el resultado:

```sh
pnpm astro dev --background
```

Abre `/`, busca el enlace y revisa la ficha (logo, descripción, tecnologías). Abre `/tool/<id>` y `/en/tool/<id>`: captura, textos y precio. Al terminar, `pnpm astro dev stop`.

### 10. Commit y pull request

```sh
git add src/data public/logos public/screenshots
git commit -m "feat: agrega <Nombre>"
git push -u origin HEAD
```

El mensaje sigue el formato del repo: `feat:`, `fix:` o `refactor:`, y una descripción en español. En el PR incluye:

- el enlace, la categoría y las tecnologías;
- el precio elegido y la URL que lo respalda;
- lo que no se pudo confirmar y quedó fuera, o lo que se hizo a mano (logo, captura).

## Lista final

- [ ] Entra en la colección y no repite otro enlace.
- [ ] `links.json`: nombre de marca, descripción de 120 caracteres como máximo, categoría, tecnologías reales y `tags` si es una galería.
- [ ] Detalle con los datos sacados del sitio de hoy, sin frases copiadas, con `pricingUrl` si no es `free`.
- [ ] Logo revisado, o ausente a propósito.
- [ ] Captura revisada, limpia y con `screenshotAt`, o ausente y avisada.
- [ ] Descripción y detalle en inglés, con la misma forma y las mismas cifras.
- [ ] `pnpm test`, `pnpm check` y `pnpm test:e2e` en verde.
- [ ] PR con categoría, precio y lo que quedó fuera.

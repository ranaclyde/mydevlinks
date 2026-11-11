# Página propia para cada enlace — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada enlace público tiene una página `/enlace/<id>` con captura, qué es, precio, usos, qué revisar, alternativas y fecha de revisión. La ficha del directorio lleva ahí, y los filtros viven en la URL. Incluye el contenido piloto de daisyUI.

**Architecture:**
- **Contenido:** un JSON por enlace en `src/data/detalles/`, cargado como colección de contenido `details` y validado con zod.
- **Página:** una ruta estática de Astro que se arma con `getStaticPaths` sobre los enlaces visibles. Las secciones sin datos no se renderizan.
- **Lógica:** lo que se puede probar sin navegador (estado en la URL, alternativas, volver atrás, formato de fecha) vive en funciones puras de `src/lib/`. Los scripts del cliente solo las conectan al DOM.

**Tech Stack:** Astro 7, TypeScript, Tailwind 4, zod (`astro/zod`), Vitest, Playwright. No se agregan dependencias.

**Spec:** `docs/superpowers/specs/2026-11-11-pagina-de-enlace-design.md`. Maqueta aprobada: `.superpowers/brainstorm/44534-1794413275/content/pagina-enlace-v2.html` (fuera de git; léela antes de la Task 5).

## Global Constraints

- Node `>=22.23.4`. En esta máquina, `export PATH="$HOME/.nvm/versions/node/v24.22.2/bin:$PATH"` antes de cualquier `pnpm`.
- Sin dependencias nuevas.
- Todo texto visible en español y con el vocabulario del sitio: "ficha", "enlace", "Directorio".
- **Colores y estilo:**
  - solo las variables de `src/styles/global.css`;
  - esquinas rectas, sin sombras nuevas;
  - corte de esquina solo en fichas;
  - índigo solo para estado e interacción;
  - mayúsculas espaciadas solo en sellos.

  Ver `DESIGN.md`.
- **Ancho del detalle:**
  - `max-width: 1160px`, centrado, con 20 px de margen lateral (16 px por debajo de 48rem);
  - prosa de hasta `68ch`;
  - columna lateral de 300 px;
  - una sola columna por debajo de 48rem.
- **Alternativas:** grilla `repeat(auto-fill, minmax(min(270px,100%),1fr))` con `gap: 12px`.
- **Encabezado:** idéntico en directorio y detalle (alto de 58 px y fijo desde 48rem).
- **Funciona sin JavaScript:** el detalle se lee completo y todos sus enlaces funcionan.
- **Fecha visible:** formato `11 nov 2026` (`es`, `day: 'numeric'`, `month: 'short'`, `year: 'numeric'`, `timeZone: 'UTC'`).
- **Mensajes de commit** en español, estilo `feat: …`, con la línea `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Enlace sin JSON de detalle, o caído:** la página se genera igual. Muestra cabecera, categoría y alternativas, sin secciones vacías ni títulos huérfanos. Un enlace caído muestra el recuadro "El sitio no responde; no hay captura". *(Task 5)*
2. **URL con parámetros inválidos** (`?cat=Nada&tech=Foo&tipo=x`): se ignoran sin errores y el directorio muestra todo. *(Task 3)*
3. **Entrar directo al detalle y pulsar "Volver al directorio":** lleva a `/`, no a la página anterior de otro sitio. *(Task 5)*
4. **JSON de detalle huérfano** (id inexistente o privado) **o con captura declarada que no existe:** `pnpm test` falla. *(Task 1)*
5. **Navegación con teclado por la ficha:** el Tab llega primero al enlace del detalle y después a la flecha externa, cada uno con foco visible, sin enlaces anidados. *(Task 6)*

---

### Task 1: Esquema y colección de detalles

**Files:**
- Create: `src/lib/details.ts`, `src/data/detalles/.gitkeep`, `tests/details.test.ts`
- Modify: `src/content.config.ts`

**Interfaces:**
- Produces:
  - `PRICING = ['gratis', 'freemium', 'de-pago'] as const`
  - `detailSchema` (zod)
  - `type Detail = z.infer<typeof detailSchema>`
  - la colección `details`, con id igual al nombre del archivo sin `.json`
  - `screenshotPath(id: string): string`, que devuelve `/capturas/<id>.jpg`
  - `formatDate(iso: string): string`
- Campos de `detailSchema`:
  - `whatIs: string[]`, de 1 a 2 párrafos no vacíos;
  - `uses: string[]`, exactamente 3;
  - `caveats: string[]`, de 2 a 3;
  - `pricing: enum(PRICING)`;
  - `pricingNote: string`;
  - `pricingUrl?: url`;
  - `idealFor: string`;
  - `reviewedAt: string` ISO `YYYY-MM-DD`;
  - `reviewedByAuthor: boolean`;
  - `screenshotAt?: string` ISO `YYYY-MM-DD`;
  - `alternatives?: string[]`.

  Con un `.refine`: `pricingUrl` es obligatoria salvo si `pricing === 'gratis'`.

> Corrección al spec (decisión de Claude, para que el autor la vea): las capturas son **JPEG** (`public/capturas/<id>.jpg`, calidad 80), no WebP. Playwright no exporta WebP y no se agregan dependencias.

- [ ] **Step 1: Write the failing tests** in `tests/details.test.ts`:
  - `detailSchema`:
    - acepta un detalle completo de `freemium` con `pricingUrl`;
    - rechaza `freemium` sin `pricingUrl`;
    - acepta `gratis` sin `pricingUrl`;
    - rechaza `uses` con 2 elementos;
    - rechaza `reviewedAt: '11/11/2026'`.
  - `formatDate('2026-11-11')` devuelve `'11 nov 2026'`.
  - `screenshotPath('daisyui-com')` devuelve `'/capturas/daisyui-com.jpg'`.
  - **Datos reales** (lee `src/data/detalles/*.json` con `readdirSync` y `src/data/links.json`):
    - cada archivo pasa `detailSchema`;
    - su id existe en `links.json` y no es `private`;
    - cada id de `alternatives` existe y no es el propio;
    - si tiene `screenshotAt`, existe `public/capturas/<id>.jpg`;
    - si `public/capturas/` existe, cada archivo suyo corresponde a un detalle.

    Con la carpeta vacía, estas pruebas pasan.
- [ ] **Step 2: Run** `pnpm test tests/details.test.ts`. Expected: FAIL, porque `../src/lib/details` no existe.
- [ ] **Step 3: Implement** `src/lib/details.ts` and register the collection in `src/content.config.ts`: `defineCollection({ loader: glob({ pattern: '*.json', base: 'src/data/detalles' }), schema: detailSchema })`, exported as `details`. Create `src/data/detalles/.gitkeep`.
- [ ] **Step 4: Run** `pnpm test` and `pnpm check`. Expected: todo PASS y 0 errores.
- [ ] **Step 5: Commit** — `feat: agrega el esquema y la colección de detalles`

---

### Task 2: Alternativas automáticas

**Files:**
- Create: `src/lib/alternatives.ts`, `tests/alternatives.test.ts`

**Interfaces:**
- Consumes: `type Link` from `src/lib/links.ts`.
- Produces: `alternativesFor(link: Link, links: Link[], pinned?: string[], count = 4): Link[]`.

Reglas:
- Si hay `pinned`, devuelve esos enlaces en ese orden, filtrando los que no existen, y rellena hasta `count` con las automáticas.
- Las automáticas son de la misma categoría, sin el propio enlace, sin `status === 'caido'` y sin `private`. Se ordenan por cantidad de tecnologías compartidas (de más a menos) y después por nombre con `localeCompare(…, 'es', { sensitivity: 'base' })`.
- Nunca repite un enlace.

- [ ] **Step 1: Write the failing tests:**
  - ordena por tecnologías compartidas: el que comparte 2 va antes que el que comparte 1, y a igualdad, por nombre;
  - excluye el propio, los caídos, los privados y los de otra categoría;
  - con 2 candidatos devuelve 2;
  - `pinned: ['b','x-inexistente']` devuelve `b` primero y rellena hasta 4 sin repetir `b`.
- [ ] **Step 2: Run** `pnpm test tests/alternatives.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `alternativesFor`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** — `feat: elige alternativas por categoría y tecnologías`

---

### Task 3: Filtros en la URL

**Files:**
- Create: `src/lib/url-state.ts`, `tests/url-state.test.ts`
- Modify: `src/scripts/filters.ts` (estado inicial, al final del archivo, y `render()`)
- Test: `tests/e2e/interfaz.spec.ts`

**Interfaces:**
- Consumes: `type FilterState` from `src/lib/filter.ts`.
- Produces:
  - `stateToSearch(state: FilterState): string`. Devuelve `''` o `'?…'` con los parámetros `q`, `cat`, `tipo` y `tech` (uno por tecnología, en el orden del estado). Omite los vacíos.
  - `stateFromSearch(search: string, known: { categories: string[]; techs: string[]; tags: string[] }): FilterState`. Descarta los valores que no están en `known`, y descarta `tipo` si `cat` no es `GALLERY`.

- [ ] **Step 1: Write the failing unit tests:**
  - ida y vuelta: `{ query: 'react hooks', category: 'Componentes y UI kits', tech: ['Tailwind','shadcn/ui'], tag: null }` sobrevive a `stateToSearch` seguido de `stateFromSearch`;
  - el estado vacío da `''`;
  - `'?cat=Nada&tech=Foo&tipo=Sitios web'` da el estado vacío;
  - `tipo` válido con `cat` distinta de `GALLERY` se descarta.
- [ ] **Step 2: Run** `pnpm test tests/url-state.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `src/lib/url-state.ts`.
- [ ] **Step 4: Connect it in `src/scripts/filters.ts`:**
  - **Al cargar:** en lugar de `search.value = ''`, el estado sale de `stateFromSearch(location.search, …)`, con `categories` tomadas de `categoryInputs` y `tags` de `tagInputs`, ignorando el valor vacío. El campo de búsqueda toma `state.query`.
  - **Panel de tecnologías:** si hay una tecnología fuera de las primeras `TOP_TECHS`, se abre `techListOpen`.
  - **Al final de `render()`:** `history.replaceState(history.state, '', location.pathname + stateToSearch(state) + location.hash)`, solo si cambió.
- [ ] **Step 5: Add e2e tests** to `tests/e2e/interfaz.spec.ts`:
  - `los filtros se guardan en la URL y sobreviven a recargar`: marca una categoría y React, comprueba que `page.url()` contiene `cat=` y `tech=React`, recarga y comprueba el mismo conteo y las píldoras;
  - `parámetros inválidos en la URL no rompen el directorio`: `page.goto('/?cat=Nada&tech=Foo')` y el conteo es `TOTAL`.

  El `beforeEach` va a `/`; estas pruebas navegan después.
- [ ] **Step 6: Run** `pnpm test && pnpm test:e2e`. Expected: todo PASS.
- [ ] **Step 7: Commit** — `feat: guarda los filtros en la URL`

---

### Task 4: Encabezado compartido y título por página

**Files:**
- Create: `src/components/SiteHeader.astro`
- Modify: `src/pages/index.astro` (mover a `SiteHeader` el `<header>` y el arreglo `themes`), `src/layouts/Layout.astro`

**Interfaces:**
- Produces:
  - `<SiteHeader total={number} />`. Mantiene el marcado y las clases actuales. La marca pasa a ser un enlace a `/`, sin cambiar su aspecto, y conserva el `h1` solo cuando le pasan `asHeading`.
  - `<Layout title?: string description?: string>`, con `mydevlinks` y la descripción actual como valores por defecto.

- [ ] **Step 1: Extract** `SiteHeader.astro`. Uso en el índice: `<SiteHeader total={links.length} asHeading />`.
- [ ] **Step 2: Add** las props `title` y `description` a `Layout.astro`.
- [ ] **Step 3: Run** `pnpm check && pnpm test:e2e`. Expected: PASS sin cambios en las pruebas existentes, incluida la del tema guardado.
- [ ] **Step 4: Commit** — `refactor: extrae el encabezado y admite título por página`

---

### Task 5: Página de detalle

**Files:**
- Create:
  - `src/pages/enlace/[id].astro`
  - `src/components/detail/DetailHero.astro`
  - `src/components/detail/TechSheet.astro`
  - `src/components/detail/Screenshot.astro`
  - `src/components/detail/AltCard.astro`
  - `src/lib/back.ts`
  - `src/scripts/back.ts`
  - `tests/back.test.ts`
  - `tests/e2e/detalle.spec.ts`
- Modify: `DESIGN.md` (nueva subsección "Página de detalle" en Components)

**Interfaces:**
- Consumes:
  - `visibleLinks`, `sortLinks`, `domainOf` y `type Link` (links.ts);
  - la colección `details`, `screenshotPath` y `formatDate` (Task 1);
  - `alternativesFor` (Task 2);
  - `stateToSearch` (Task 3);
  - `SiteHeader` y `Layout` (Task 4).
- Produces:
  - la ruta `/enlace/<id>` para cada enlace de `visibleLinks(…, import.meta.env.DEV)`;
  - `shouldGoBack(referrer: string, origin: string): boolean`, que es `true` solo si `referrer` tiene el mismo `origin` y su ruta es `/`.

Estructura y estilos según la maqueta v2 y las Global Constraints:
- **Cabecera:** usa los sellos de `LinkCard` (mueve el marcado de los sellos a `src/components/Stamps.astro` y úsalo en ambos lados).
- **Ficha técnica:**
  - si hay detalle, muestra precio, enlace a precios (solo si hay `pricingUrl`), "Ideal para", categoría, "Última revisión" y el aviso punteado si `reviewedByAuthor === false`;
  - sin detalle, solo la categoría.
- **Enlace de la categoría:** `/` + `stateToSearch({ query: '', category, tech: [], tag: null })`.
- **Secciones** "¿Qué es?", "Casos de uso" y "Qué revisar antes de elegirlo": solo si hay detalle.
- **Captura:**
  - si hay `screenshotAt`, `<img>` con `width=1280 height=800`, `loading="lazy"`, `alt="Captura de <dominio>"` y la barra "Captura del <fecha>";
  - si `status === 'caido'`, el recuadro punteado "El sitio no responde; no hay captura";
  - si no, nada.
- **Volver:** "← Directorio" y "Volver al directorio" son `<a href="/" data-back>`. `src/scripts/back.ts` intercepta el clic con `shouldGoBack(document.referrer, location.origin)` y llama a `history.back()`.
- **Móvil:** por debajo de 48rem, la ficha técnica va antes de la captura.
- **Título de la página:** `<nombre> · mydevlinks`. La descripción es la del enlace.

- [ ] **Step 1: Write the failing unit tests** in `tests/back.test.ts`:
  - `shouldGoBack('http://localhost:4331/?cat=X', 'http://localhost:4331')` es `true`;
  - con referrer `''` es `false`;
  - desde otro origen es `false`;
  - desde `/enlace/otro` es `false`.
- [ ] **Step 2: Run** `pnpm test tests/back.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `src/lib/back.ts`, the components, the page and `src/scripts/back.ts`.
- [ ] **Step 4: Write the e2e tests** in `tests/e2e/detalle.spec.ts`, sin `beforeEach` compartido con `interfaz.spec.ts`:
  - `un enlace sin detalle muestra cabecera y alternativas, sin secciones vacías`:
    - usa el primer enlace público que no esté en `src/data/detalles/`;
    - existen el `h1` con su nombre, "Visitar <dominio>" con `target=_blank` y la sección "Alternativas", con entre 1 y 4 fichas que no incluyen al propio;
    - no existen "¿Qué es?" ni "Casos de uso".
  - `entrar directo y volver lleva al directorio`: `goto('/enlace/<id>')`, clic en "Volver al directorio" y `expect(page).toHaveURL('/')`.
  - `volver desde el directorio conserva los filtros`: `goto('/?cat=<categoría del enlace>')`, `goto` al detalle con `referer` del directorio (usar el clic real desde la grilla una vez hecha la Task 6; hasta entonces `page.goto(url, { referer })`), "Volver al directorio" y la URL vuelve a contener `cat=`.
  - `sin JavaScript el detalle se lee completo`: contexto con `javaScriptEnabled: false`; están el `h1` y las alternativas, y "Volver al directorio" tiene `href="/"`.
  - `a 390 px no hay desborde horizontal`: `document.documentElement.scrollWidth <= 390`.
- [ ] **Step 5: Run** `pnpm test && pnpm test:e2e && pnpm check`. Expected: todo PASS.
- [ ] **Step 6: Document** la página de detalle en `DESIGN.md` (estructura, ancho, aviso punteado de contenido generado y recuadro de enlace caído).
- [ ] **Step 7: Commit** — `feat: agrega la página de detalle de cada enlace`

---

### Task 6: La ficha lleva al detalle y la flecha a la web

**Files:**
- Modify: `src/components/LinkCard.astro`, `src/styles/global.css`, `tests/e2e/interfaz.spec.ts`, `tests/e2e/detalle.spec.ts`, `README.md`

**Interfaces:**
- Consumes: la ruta `/enlace/<id>` (Task 5).
- Produces:
  - en cada `[data-card]`, un enlace principal `a[data-detail]` con `href="/enlace/<id>"` y el nombre como texto accesible;
  - un enlace `a[data-external]` con `href=<url>`, `target="_blank"`, `rel="noopener noreferrer"`, `aria-label="Abrir <nombre> en otra pestaña"` y la flecha actual como icono.

Restricciones:
- No anidar `<a>`. Toda la ficha sigue siendo clicable hacia el detalle (enlace estirado sobre la ficha).
- La flecha queda por encima y es su propio objetivo de clic: al menos 24×24 px en escritorio y 40×40 px en táctil (regla de las dos densidades).
- `.ficha::before` (corte) y `.ficha::after` (brillo) ya están ocupados; el enlace estirado usa un pseudo-elemento de otro nodo.
- Mantener los atributos `data-*` del `<li>` que lee `filters.ts`, el hover (subrayado y flecha índigo), la estrella de destacada y el estilo sin verificar.
- Quitar `(abre en otra pestaña)` del enlace principal.

- [ ] **Step 1: Write the failing e2e tests** in `tests/e2e/interfaz.spec.ts`:
  - `la ficha lleva al detalle y la flecha a la web`:
    - en la primera ficha visible, `[data-detail]` tiene `href` `/enlace/<id>` y no tiene `target`;
    - `[data-external]` tiene el `url` del enlace y `target=_blank`;
    - un clic en la descripción de la ficha navega a `/enlace/<id>`.
  - `con teclado se llega al detalle y después a la flecha` (solo escritorio): foco en la primera ficha con `Tab`; el elemento activo es `[data-detail]` y, con el siguiente `Tab`, `[data-external]`.
  - `no hay enlaces anidados`: `page.locator('a a')` tiene `count` 0.

  Ajusta las pruebas existentes que dependan de que la ficha sea un enlace externo.
- [ ] **Step 2: Run** `pnpm test:e2e`. Expected: las nuevas FAIL.
- [ ] **Step 3: Implement** the change in `LinkCard.astro` and `global.css`.
- [ ] **Step 4: Replace in `tests/e2e/detalle.spec.ts`** el `goto` con `referer` por el clic real desde la grilla.
- [ ] **Step 5: Run** `pnpm test:e2e && pnpm check`. Expected: todo PASS.
- [ ] **Step 6: Update `README.md`:** la ficha lleva al detalle, y la flecha a la web.
- [ ] **Step 7: Commit** — `feat: la ficha abre el detalle y la flecha va a la web`

---

### Task 7: Script de capturas

**Files:**
- Create: `scripts/capture.mjs`, `scripts/lib/capture.mjs`, `tests/capture.test.ts`
- Modify: `package.json` (script `"capture": "node scripts/capture.mjs"`), `README.md`

**Interfaces:**
- Produces:
  - `pickTargets(ids: string[], links: {id: string; status: string; private: boolean}[]): { targets: string[]; errors: string[] }`, en `scripts/lib/capture.mjs`;
  - el comando `pnpm capture <id> [<id>…]`, que escribe `public/capturas/<id>.jpg`.

Reglas de `pickTargets`:
- un id desconocido va a `errors` con `"<id>: no existe"`;
- un enlace caído, con `"<id>: está caído"`;
- un enlace privado, con `"<id>: es privado"`.

Captura: Chromium de `@playwright/test`, viewport de 1280×800, `deviceScaleFactor: 1`, `colorScheme: 'light'`, `goto` con `waitUntil: 'networkidle'` y 30 s de espera máxima (si se agota, captura igual), 1500 ms extra, `type: 'jpeg'` y `quality: 80`. Al terminar imprime, por cada id, `ok` o el error, y recuerda poner `screenshotAt` en el JSON. El script corre a mano; no corre en el build ni en las pruebas.

- [ ] **Step 1: Write the failing tests** for `pickTargets`, cubriendo los tres errores y un id válido.
- [ ] **Step 2: Run** `pnpm test tests/capture.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `scripts/lib/capture.mjs` and `scripts/capture.mjs`.
- [ ] **Step 4: Run** `pnpm test`. Expected: PASS.
- [ ] **Step 5: Document** en `README.md` cómo agregar un detalle: el archivo en `src/data/detalles/<id>.json`, sus campos, `pnpm capture <id>` y `reviewedByAuthor`.
- [ ] **Step 6: Commit** — `feat: agrega el script de capturas`

---

### Task 8: Piloto con daisyUI

**Files:**
- Create: `src/data/detalles/daisyui-com.json`, `public/capturas/daisyui-com.jpg`

- [ ] **Step 1: Read** https://daisyui.com/ and its pricing or store page, and write `daisyui-com.json`:
  - textos propios en español y sin copiar frases del sitio;
  - `reviewedAt` y `screenshotAt` con la fecha de hoy;
  - `reviewedByAuthor: false`;
  - `pricing` y `pricingUrl` según lo que el sitio dice hoy.

  La maqueta tiene un borrador de tono, pero sus datos no están verificados.
- [ ] **Step 2: Run** `pnpm capture daisyui-com`. Expected: `daisyui-com: ok` and the file exists. Ábrelo y comprueba que no lo tapa un banner de cookies.
- [ ] **Step 3: Run** `pnpm test && pnpm test:e2e && pnpm check && pnpm build`. Expected: todo PASS.
- [ ] **Step 4: Add** to `tests/e2e/detalle.spec.ts`: `el piloto muestra todas las secciones`. En `/enlace/daisyui-com` están "¿Qué es?", 3 casos de uso, "Qué revisar antes de elegirlo", "Ficha técnica" con "Última revisión", el aviso de contenido no revisado, la captura cargada (`naturalWidth > 0`) y 4 alternativas. Run `pnpm test:e2e`. Expected: PASS.
- [ ] **Step 5: Commit** — `feat: agrega el detalle piloto de daisyUI`
- [ ] **Step 6: Stop.** Muéstrale al autor `/enlace/daisyui-com` en el servidor de desarrollo, en tema claro y oscuro y en el celular, y espera su ajuste antes de cualquier tanda.

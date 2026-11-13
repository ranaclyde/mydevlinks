# Revisión de enlaces

Enlaces que necesitan atención o que tienen una decisión anotada. Cada línea lleva nombre, URL y motivo. Todos siguen en `src/data/links.json`, salvo los de `Quitados`.

## Pendientes

### Sin logo

La ficha muestra la inicial del nombre. Se agrega guardando el archivo en `public/logos/` y completando `logo` en `src/data/links.json`.

- 97 Cosas: https://97cosas.com/. El sitio responde, pero no se obtuvo un ícono usable.

### Ideas

- it's free*: https://itsfree.dev/es. Queda en Directorios de recursos; el autor quiere destacarlo de algún modo en la web.

## Notas

### Clasificación

- Confirmados por el autor sin cambios: Spline en Animación y efectos; SVGOMG, SVG Viewer y SvgTrace en Generadores CSS/SVG; MotionSites, Websiteprompts.ai, GetLayers AI y Manus en Constructores con IA.
- Serverless reúne los CMS headless (Directus, Strapi y Storyblok) y PocketBase. Antes se llamaba Backend y datos; las bases de datos (Turso, Upstash, Neon y MongoDB Atlas) se quitaron.
- Servicios y APIs para usar desde el frontend (Resend, Lemon Squeezy, AnyAPI, RapidAPI y Public APIs) van en Herramientas de desarrollo.
- No hay categoría Otros: Terraink pasó a Generadores CSS/SVG y AI Particle Simulator a Animación y efectos.
- Componentes animados (React Vibe, Magic UI, Aceternity UI, Cult UI) van en Componentes y UI kits, no en Animación y efectos.
- Bancos de imágenes (Picography, Unsplash, Magnific) van en Iconos e ilustraciones.
- Editores de imágenes (Squoosh, Shots, Cleanup.pictures) van en Herramientas de desarrollo.
- Prompts para generar secciones o sitios con IA (MotionSites, Websiteprompts.ai, GetLayers AI, The Prompts Factory, Motionin.design) van en Constructores con IA.
- Google Fonts: https://fonts.google.com/. Apunta a la raíz, en Fuentes y color. Los iconos tienen su propia entrada: Material Symbols (https://fonts.google.com/icons), en Iconos e ilustraciones.
- Originkit: https://www.originkit.dev/. Según el autor, se copia en React, se instala por CLI (bun, npm, yarn o pnpm), por MCP o con un prompt para IA; por eso lleva `React`.
- Magnific: https://www.magnific.com/. Antes Freepik. Hoy se presenta sobre todo como plataforma de IA creativa, pero queda como banco de recursos.
- Motionin.design: https://motionin.design/. El sitio se llama "Motion"; se nombra por su dominio para no confundirlo con la biblioteca Motion.
- Httpster: https://httpster.net/. Las fichas no muestran fecha y no se pudo confirmar que siga publicando, aunque el pie dice 2012–2026. Queda `activo`.

### Descripciones que no salen del sitio

Estos bloquean la lectura o llegan vacíos, así que la descripción y las tecnologías vienen del autor o de otra página.

- Uiverse: https://uiverse.io/. Del título de https://uiverse.io/elements, que copió el autor.
- SVG Repo: https://www.svgrepo.com/. Del texto del sitio que copió el autor.
- Dribbble: https://dribbble.com/. Del autor.
- TypeUI: https://www.typeui.sh/. Del texto del sitio que copió el autor.
- Landing Love: https://www.landing.love/. Del texto del sitio que copió el autor.
- Land-book: https://land-book.com/. Del texto del sitio que copió el autor.
- Lapa Ninja: https://www.lapa.ninja/. Del texto del sitio que copió el autor.
- Unsplash: https://unsplash.com/. Del texto que muestra en Google, que pasó el autor.
- Flaticon: https://www.flaticon.com/. Del texto que muestra en Google, que pasó el autor.
- Toolbox by SignalSupply: https://toolbox.signalsupply.co/. La página solo muestra "Loading..."; según el autor reúne blobs con degradado en CSS, patrones, Sharp y Perspectr.
- Flowbite: https://flowbite.com/. La página llega vacía; la clasificación y `tech` se apoyan en su documentación.

### Logos

- Siteinspire: el logo es un círculo rojo dibujado aquí (`public/logos/siteinspire-com.svg`), porque el sitio bloquea la descarga de su favicon y su marca es ese círculo.

## Quitados

Cada id quitado figura con su motivo en `REMOVED`, en `tests/data.test.ts`.

**Caídos:**

- PeepsLab: https://peepslab.com/. Responde 402: el sitio está pausado.
- Intools: https://intools.co/. Dominio estacionado.
- Vuex - Documentación ES: http://op6gls4d1.bkt.clouddn.com/vuejs-vuex/docs/es/. Error 404.
- Unit testing Vuex (Codecourse): https://www.codecourse.com/lessons/unit-testing-vuex/1775. Error 404.
- Vue Telescope: https://vuetelescope.com/explore. Error 404.
- Factor: https://factor.dev/. El dominio no resuelve.
- Show the weather forecast in a NativeScript with Vue.js iOS and Android Application: https://www.youtube.com/watch?v=Z5YMfADiUZU&ab_channel=HERETechnologies. El vídeo ya no está en YouTube.

**Antiguos:**

- Create React App: https://create-react-app.dev/. El sitio declara que está obsoleto.
- Vetur: https://marketplace.visualstudio.com/items?itemName=octref.vetur. Reemplazado por Volar.
- BootstrapVue: https://bootstrap-vue.org/docs/. Apunta a Vue 2 y Bootstrap 4.
- Instalación de Nuxt 2: https://nuxt.com/docs/2.x/getting-started/installation. Nuxt 2 llegó al fin de su vida útil el 30 de junio de 2024.
- vue-focus y vue-authenticate: https://github.com/simplesmiler/vue-focus y https://github.com/dgrubelic/vue-authenticate. Librerías de Vue 2.
- Curso de Next.js 12 desde cero: https://www.youtube.com/watch?v=pFT8wD2uRSE. Versión vieja.

**Vídeos de YouTube.** El autor decidió no guardar vídeos:

- Nuxt SEO: https://www.youtube.com/watch?v=pbMA28qcW7I&list=PLzlG0L9jlhENcUiAQU1x95sBLLCUihwIX&index=6. Además usaba vue-meta, de la época de Nuxt 2.
- Vue.js: Composition API, Pinia y Router 4: https://www.youtube.com/watch?v=sHXxASRp2nw.
- Vue 3 Composition API Tutorial: https://www.youtube.com/watch?v=3B0ry4GI1cE.

**Reemplazados:**

- HTML to JSX: https://magic.reactjs.net/htmltojsx.htm. Por Transform (https://transform.tools/), que incluye HTML a JSX y muchas otras conversiones.
- React Router v6: https://reactrouter.com/6.30.6. Por TanStack (https://tanstack.com/), que reúne Router, Query, Table, Form y otras librerías.
- Pch.vector y Vectorjuice en Freepik: https://www.freepik.es/search?author=10171402&authorSlug=pch.vector&dates=any&format=author&page=1&query=contact&sort=popular&type=vector y https://www.freepik.es/search?author=26713452&authorSlug=vectorjuice&dates=any&format=author&page=1&query=contact&sort=popular&type=vector. Por una sola entrada de Magnific (https://www.magnific.com/), el nuevo nombre de Freepik.
- Tailwind CSS Components: https://tailwindcomponents.com/. Redirige con 301 a https://www.creative-tim.com/twcomponents/ y sirve el mismo contenido; se conserva esa entrada.

**Fuera de la colección:**

- Todo lo de NativeScript: Introduction - NativeScript-Vue (https://nativescript-vue.org/en/docs/introduction/, además caído), NativeScript Marketplace (https://market.nativescript.org/), Apps nativas con NativeScript-Vue (https://www.youtube.com/watch?v=k3NTWrxyvZA) y Awesome NativeScript-Vue (https://github.com/Gonzalo2310/awesome-nativescript-vue). También se quitó `NativeScript` de `TECHS`.

**Sin verificar:**

- Blob gradient animation: https://codepen.io/Smitche/pen/MowNba. Pen de CodePen.
- Proximity Glow Cards: https://codepen.io/jh3y/pen/QWYPaax. Pen de CodePen.
- Tailwind CSS Components - Tailwind Plus: https://tailwindcss.com/plus/ui-blocks.

**Decisión del autor:**

- Clippy: https://bennettfeely.com/clippy/.
- Vue.js Lifecycle Hooks: https://www.digitalocean.com/community/tutorials/vuejs-component-lifecycle.
- Redux en español: https://es.redux.js.org/.
- Visual Studio Code: https://code.visualstudio.com/. Editor general.
- Clone Wars: https://github.com/gorvgoyl/clone-wars. Viejo.
- Blobs! (CSS-Tricks), React en español y Cómo aprender Vue.js: https://css-tricks.com/blobs/, https://es.react.dev/ y https://escuelavue.es/software/como-aprender-vue/. Quitados el 13 de noviembre de 2026; en su lugar se agregó Refactoring.Guru (https://refactoring.guru/es).

**Fuera de frontend:**

- Turso, Upstash, Neon y MongoDB Atlas: https://turso.tech/, https://upstash.com/, https://neon.com/ y https://www.mongodb.com/es/products/platform/atlas-database. Bases de datos.
- exercises-dataset: https://github.com/hasaneyldrm/exercises-dataset. Dataset de ejercicios físicos.

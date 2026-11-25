# Contribuir a toolshelf

Gracias por querer sumar. toolshelf es una colección curada: importa más que cada enlace esté bien elegido y bien descrito que la cantidad. Esta guía explica qué se puede aportar y cómo.

## Qué puedes aportar

| Quieres… | Cómo |
| --- | --- |
| **Sugerir una herramienta o recurso** | Abre un issue con la plantilla [Sugerir un enlace](https://github.com/ranaclyde/mydevlinks/issues/new?template=suggest-link.yml). |
| **Sumarlo tú mismo** | Sigue [docs/adding-links.md](docs/adding-links.md). Con Claude Code: `/toolshelf-add-link <url>`. |
| **Avisar que un enlace está caído, cambió o quedó viejo** | Abre un issue con la plantilla [Reportar un enlace](https://github.com/ranaclyde/mydevlinks/issues/new?template=report-link.yml). Si sabes el arreglo, un PR que cambie `status` (`outdated` o `down`) o la URL. |
| **Corregir un dato de un detalle** (precio, licencia, descripción) | PR que cambie el JSON en `src/data/details/<id>.json` y su traducción en `src/data/en/details/<id>.json`. Pon en el PR de dónde sale el dato. |
| **Mejorar el sitio** (interfaz, filtros, accesibilidad, rendimiento) | Abre un issue antes de un cambio grande, para acordar el enfoque. |

## Preparar el entorno

```sh
nvm use                                  # versión de Node de .nvmrc
pnpm install
pnpm exec playwright install chromium    # para capturas y test:e2e
pnpm astro dev --background              # servidor de desarrollo
```

Los comandos están en el [README](README.md#ejecutar).

## Cómo trabajar

- **Ramas:** desde `main` y con prefijo: `feat/…`, `fix/…`, `refactor/…`. Por ejemplo, `feat/enlace-daisyui`.
- **Commits:** `tipo: descripción en español`, en presente. Por ejemplo, `feat: agrega daisyUI` o `fix: corrige el precio de Shots`.
- **Un tema por PR.** Varios enlaces relacionados pueden ir juntos. Un enlace y un cambio de código, no.
- **Antes de abrir el PR,** los tres chequeos tienen que pasar:

  ```sh
  pnpm test
  pnpm check
  pnpm test:e2e
  ```

## Convenciones del código

- **Stack:** Astro estático con Tailwind, sin framework de interfaz. El JavaScript del navegador vive en `src/scripts/`, es chico y la página funciona sin él.
- **Idiomas:** todo texto de la interfaz va en `src/i18n/ui.ts`, en español y en inglés, con la misma forma. Nunca se escribe texto suelto en un componente. Los valores internos (categorías, precios, estados) son ids en inglés.
- **Datos:** los esquemas de `src/lib/links.ts`, `src/lib/details.ts` y `src/lib/translations.ts` son la fuente de verdad. Si agregas un campo, agrégalo ahí y en el README.
- **Capturas:** viven en `src/assets/screenshots/` y se usan siempre a través de `src/lib/screenshots.ts` (`screenshotOf` para mostrarlas con `<Image>`, `screenshotOgImage` para `og:image`), nunca con una ruta fija. Las nuevas se guardan en WebP con `pnpm capture`; las primeras siguen en JPG y pasan a WebP solo cuando se rehacen: no las conviertas en masa, porque suma peso al historial sin ganar casi nada. No se usa AVIF: en estas capturas pesaba más que WebP y hacía la compilación mucho más lenta.
- **Estilo:** tabulaciones para indentar. Los comentarios explican el porqué, no el qué.
- **Diseño:** colores, tipografía y componentes están en [DESIGN.md](DESIGN.md), con los tokens en `src/styles/global.css`. Un cambio visual respeta ese sistema o lo propone en el PR.
- **Pruebas:** una regla nueva sobre los datos lleva su prueba en `tests/`. Un comportamiento nuevo en el navegador, su prueba en `tests/e2e/`.

## Idioma del código

El código va en inglés y lo que se lee como texto va en español. Las ramas pueden ir en cualquiera de los dos.

| En inglés | En español |
| --- | --- |
| Nombres de archivos y carpetas, incluidos los de `docs/`, `tests/` y `.claude/skills/` | Comentarios en el código |
| Funciones, variables, constantes y tipos (`alternativesFor`, `linkSkeleton`) | Descripciones de los tests (`it('ordena por tecnologías…')`) |
| Clases CSS y atributos `data-*` (`card`, `frame`, `data-tech`) | Mensajes que imprimen los scripts |
| Ids y valores de los datos (`developer-tools`, `freemium`, `active`) | Mensajes de commit y textos de los PR |
| Parámetros de URL y rutas del sitio (`?price=`, `/tool/<id>`) | Contenido de la documentación (README, guías, este archivo) |
| Nombres de scripts y comandos (`pnpm add-link`, `/toolshelf-add-link`) | |

Los textos que ve quien visita el sitio no se escriben en el código: van en `src/i18n/ui.ts`, en los dos idiomas.

## Contribuir con agentes de IA

El repo trae instrucciones para agentes. [AGENTS.md](AGENTS.md) es el punto de entrada y la guía para agregar enlaces sirve igual para personas y para agentes. Revisa lo que el agente escribió como si fuera tuyo, en especial precios, licencias y cifras: tienen que salir del sitio real, no de la memoria del modelo.

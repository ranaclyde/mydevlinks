# Contribuir a toolshelf

Gracias por querer sumar. toolshelf es una colección curada: importa más que cada enlace esté bien elegido y bien descrito que la cantidad. Esta guía explica qué se puede aportar y cómo.

## Qué puedes aportar

| Quieres… | Cómo |
| --- | --- |
| **Sumar una herramienta o recurso** | Sigue [docs/agregar-enlace.md](docs/agregar-enlace.md). Con Claude Code: `/agregar-enlace <url>`. |
| **Avisar que un enlace está caído, cambió o quedó viejo** | Abre un issue con el enlace y lo que viste. Si sabes el arreglo, un PR que cambie `status` (`outdated` o `down`) o la URL. |
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
- **Estilo:** tabulaciones para indentar y comentarios en español, que expliquen el porqué, no el qué.
- **Diseño:** colores, tipografía y componentes están en [DESIGN.md](DESIGN.md), con los tokens en `src/styles/global.css`. Un cambio visual respeta ese sistema o lo propone en el PR.
- **Pruebas:** una regla nueva sobre los datos lleva su prueba en `tests/`. Un comportamiento nuevo en el navegador, su prueba en `tests/e2e/`.

## Contribuir con agentes de IA

El repo trae instrucciones para agentes. [AGENTS.md](AGENTS.md) es el punto de entrada y la guía para agregar enlaces sirve igual para personas y para agentes. Revisa lo que el agente escribió como si fuera tuyo, en especial precios, licencias y cifras: tienen que salir del sitio real, no de la memoria del modelo.

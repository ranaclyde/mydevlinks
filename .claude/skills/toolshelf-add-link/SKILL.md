---
name: toolshelf-add-link
description: Agrega uno o más enlaces nuevos a toolshelf a partir de su URL, completos y listos para PR (entrada en links.json, logo, detalle, captura y traducción al inglés). Úsalo cuando pidan agregar, sumar o cargar una herramienta, sitio o recurso al directorio.
argument-hint: <url> [<url>…]
---

# Agregar enlace a toolshelf

URLs pedidas: $ARGUMENTS

Si te pasan un issue de sugerencia (etiqueta `new-link`), toma la URL y lo que cuenta de ahí, y cierra el issue desde el PR con `Closes #<número>`.

La fuente de verdad es `docs/adding-links.md`. **Léela entera antes de empezar** y sigue sus pasos en orden; este skill solo agrega cómo ejecutarla como agente.

## Cómo trabajar

1. **Filtro editorial primero.** Para cada URL, aplica "¿Entra en la colección?" de la guía antes de correr nada. Si una no entra o hay dudas reales (tema, duplicado parcial con otro enlace del mismo dominio), pregunta antes de seguir con esa URL; con las demás puedes avanzar.
2. **Rama.** Si estás en `main`, crea `feat/enlace-<nombre>` (o `feat/enlaces-<tema>` si son varios). No trabajes sobre `main`.
3. **Node.** Usa la versión de `.nvmrc` (`nvm use`) antes de cualquier `pnpm`.
4. **`pnpm add-link <url>`** por cada URL. Lee su salida: nombre propuesto, logo, avisos de mismo dominio. Si corta por sitio caído o redirección, sigue lo que dice la guía; no uses `--force` sin haber comprobado el sitio.
5. **Lee el sitio real** con tus herramientas web (portada, docs, precios, licencia o repositorio). Si una página bloquea el acceso automático y tienes un navegador disponible (por ejemplo Claude in Chrome), léela desde ahí. Nunca saltes protecciones antibots con Playwright ni con otros trucos.
6. **Redacta** el enlace y el detalle con las reglas de la guía. Toma `src/data/details/daisyui-com.json` como ejemplo de tono. Cada cifra, licencia o dato de precio tiene que estar en lo que leíste hoy; si no, déjalo fuera.
7. **Logo y captura.** Abre el logo y la captura con la herramienta de lectura de imágenes y revísalos de verdad: cookies, modales, contenido a medio cargar, logo equivocado. Corrige según la guía.
8. **Traduce** al inglés y compara cifras, nombres y comandos con el español, uno por uno.
9. **Verifica** con `pnpm test`, `pnpm check` y `pnpm test:e2e`. No declares nada terminado sin haberlos visto pasar. Si un test falla por un archivo ajeno a tus enlaces, dilo en vez de tocarlo.
10. **Edita JSON con cuidado:** indentación con tabulaciones, UTF-8 sin escapar acentos y salto de línea final (como `JSON.stringify(valor, null, '\t') + '\n'`).

## Varios enlaces

Con más de tres URLs puedes repartir los pasos 5 a 8 entre subagentes en paralelo, unos cinco enlaces por subagente. Pásales la ruta de la guía, sus ids y la fecha de hoy, y pídeles que no hagan commit ni corran la suite completa. Después revisa tú lo que escribieron contra el sitio (sobre todo precios y cifras) y corre la verificación una vez para todo.

## Al terminar

Resume por enlace: id, categoría, precio y su URL, y lo que quedó fuera o se hizo a mano. Haz commit y abre el PR (formato del paso 10 de la guía) solo si te lo pidieron; si no, deja todo listo y pregunta.

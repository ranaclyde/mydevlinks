# Página propia para cada enlace

> Diseño del 11 de noviembre de 2026. El autor aprobó los dos destinos de la ficha y los filtros en la URL. Lo marcado como **(decisión de Claude)** no lo decidió el autor; está para que lo revise.

## Por qué

Hoy la ficha lleva directo a la web del enlace. Antes de salir, quien visita quiere saber qué es, cómo se ve, cuánto cuesta y si le sirve, para no abrir pestañas a ciegas. Eso hace que el directorio valga más que una lista de enlaces.

## Objetivos

- Cada enlace público tiene su propia página de detalle, con su URL, que funciona sin JavaScript.
- La página muestra:
  - una captura de la web;
  - qué es;
  - el precio, con un enlace a la página de precios del sitio;
  - casos de uso;
  - qué revisar antes de elegirlo;
  - alternativas;
  - la fecha de la última revisión.
- El contenido se genera primero y el autor lo corrige con el tiempo. Lo que no revisó a mano se nota.
- Volver de un detalle al directorio deja los filtros y la posición de scroll como estaban.

## Fuera de alcance

- Un paso a paso para probar la herramienta. La referencia lo tiene, pero es lo más difícil de generar bien sin haber probado el sitio.
- Las ideas para más adelante (ver la sección del final).
- Consultar algo en el momento en que alguien visita la página. Todo se genera antes y se publica como sitio estático.

## Lo que sería un fracaso

- Presentar texto generado como si fuera opinión del autor.
- Que la página de detalle se sienta como otro sitio.
- Que el directorio pierda los filtros al volver.
- Texto inventado o desactualizado sobre precios sin un enlace a la fuente.

## Decidido por el autor

- **Una página propia para cada enlace**, en lugar de un modal. Ruta propuesta: `/enlace/<id>`.
- **Estructura** tomada de https://itsfree.dev/es/tools/cloudflare, con el sistema visual de `DESIGN.md` y sin su estética de rótulos `// SECCIÓN`.
- **Maqueta aprobada:** `.superpowers/brainstorm/65208-1794492251/content/pagina-enlace-v4.html`. Está fuera de git, así que el plan debe copiarla o tomar de ella lo necesario. En orden:
  1. **Encabezado** igual al del directorio: color de marco (`.marco`) y el logotipo "mydev**links**". La animación del logotipo solo corre en el directorio; en el detalle aparece ya resaltado (decisión de Claude, sin objeción del autor).
  2. **Ruta:** ← Directorio / categoría / nombre.
  3. **Cabecera:** ficha grande con corte. Lleva logo en placa (64 px), nombre, dominio, sellos de estado ("Antiguo" y "Caído"), la descripción actual, el botón principal "Visitar <dominio> ↗", el secundario "Volver al directorio" y las tecnologías bajo una línea punteada.
  4. **Columna principal:** captura con su fecha, "¿Qué es?", tres casos de uso numerados y "Qué revisar antes de elegirlo".
  5. **Columna lateral "Ficha técnica"** (300 px):
     - sello de precio;
     - nota del precio;
     - enlace "Ver precios en <dominio> ↗";
     - "Ideal para";
     - categoría, que enlaza al directorio filtrado;
     - "Última revisión <fecha>";
     - un aviso con borde punteado cuando el contenido no está revisado a mano.

     En móvil va justo debajo de la captura y antes de "¿Qué es?", con sus filas apiladas (sin columnas) (decisión del autor, 12 nov 2026).

     Va en **Hoja**, como el resto de las fichas, y no en color de marco: es contenido, no un control. Así se cumple la regla de `DESIGN.md`, que reserva el marco para el encabezado y el panel lateral (decisión del autor, 12 nov 2026).

     Desde 48rem, y si la ventana mide al menos 600 px de alto, la ficha **acompaña el scroll** (`position: sticky`, `top: 78px`, es decir, 58 px de encabezado más 20 px) para no dejar un hueco vacío junto a la columna principal (decisión del autor).
  6. **Alternativas:** cuatro fichas reales del directorio y "Ver toda la categoría →".
- **Ancho** (confirmado con las skills impeccable y ui-ux-pro-max):
  - el directorio sigue a todo el ancho;
  - el detalle mide `max-width: 1160px`, centrado, con 20 px de margen lateral (16 px en móvil);
  - el encabezado es idéntico en las dos páginas: 58 px y fijo desde 48rem;
  - las alternativas usan la misma grilla del directorio, `minmax(min(270px,100%),1fr)` con 12 px de separación;
  - la prosa llega a unos 68ch;
  - pasa a una columna por debajo de 48rem.
- **Filtros en la URL** (por ejemplo `?cat=…&tech=…&q=…`): el directorio lee y escribe su estado ahí, con `history.replaceState`, para que volver atrás lo restaure y las búsquedas se puedan compartir. Cómo vuelve "Volver al directorio" está en las decisiones de Claude.
- **Dos destinos desde la ficha del directorio:**
  - la ficha lleva al detalle;
  - la flecha junto al nombre lleva directo a la web, como hoy, en una pestaña nueva.

  Cómo resolverlo sin anidar enlaces, y con buena accesibilidad, queda en manos de quien lo construya.
- **Contenido:** se genera para todos y el autor lo ajusta después. Se arranca con **un enlace piloto**, se ajusta el formato con el autor y después se sigue por tandas, una categoría a la vez.
- **Herramientas:**
  - capturas con Playwright, que ya está en el proyecto;
  - textos escritos por Claude leyendo cada sitio.

## Decisiones de Claude (a revisar)

- **Dónde vive el contenido:** un archivo JSON por enlace en `src/data/detalles/<id>.json`, validado con un esquema de zod en `src/lib/`, como `linkSchema`. Así `links.json` no crece. Campos:
  - `whatIs`: uno o dos párrafos;
  - `uses`: tres frases;
  - `caveats`: dos o tres frases;
  - `pricing`: `gratis`, `freemium` o `de-pago`;
  - `pricingNote`;
  - `pricingUrl`: opcional;
  - `idealFor`;
  - `reviewedAt`: fecha ISO;
  - `reviewedByAuthor`: booleano;
  - `screenshotAt`: fecha ISO;
  - `alternatives`: lista opcional de `id`, que reemplaza a las automáticas.
- **Capturas:** `public/capturas/<id>.jpg` (JPEG, calidad 80; Playwright no exporta WebP y no se agregan dependencias), a 1280×800 con escala 1, en tema claro, generadas por un script en `scripts/`. El autor lo corre a mano; no se ejecuta en el build.
- **Alternativas automáticas:** se toman de la misma categoría, ordenadas por cuántas tecnologías comparten y después por nombre, sin enlaces caídos. Son cuatro. Si la categoría tiene menos, se muestran las que haya.
- **Alcance de este plan:** la infraestructura completa (página de detalle, cambio de la ficha, filtros en la URL, esquema, script de capturas y pruebas) más **un solo enlace piloto con contenido: daisyUI**, el de la maqueta. El plan termina ahí. Las tandas por categoría se planifican aparte, una vez que el autor apruebe el formato del piloto.
- **Volver al directorio:**
  - con el botón Atrás, los filtros salen de la URL y se aplican al cargar, antes de que el navegador restaure el scroll;
  - con "Volver al directorio" y la ruta: si la página anterior es el directorio del mismo sitio, se hace `history.back()`, que conserva los filtros y el scroll; si no (se entró directo al detalle o no hay JavaScript), es un enlace normal a `/`;
  - el enlace de la categoría, en la ficha técnica, siempre lleva a `/?cat=<categoría>`.
- **Precio sin página de precios:** `pricingUrl` es obligatoria salvo cuando `pricing` es `gratis`. Si un sitio de pago o freemium no tiene página de precios, se usa la página donde aparece esa información, aunque sea la portada. En `gratis` sin URL no se muestra el enlace.
- **Enlace sin contenido generado todavía:** la página existe igual, con cabecera, ficha técnica (solo categoría) y alternativas. Las secciones sin datos no aparecen. Así se puede publicar por tandas.
- **Enlace caído:** sin captura. En su lugar va un recuadro punteado que dice "El sitio no responde; no hay captura". Se ve el sello "Caído" y se mantiene "Visitar".
- **La fecha de revisión** se suma a los sellos "Antiguo" y "Caído"; no los reemplaza.
- **Los enlaces privados** no tienen página en el build, igual que hoy no tienen ficha.

## Lo que queda en manos de quien lo construya

- La estructura de componentes de Astro y cuánto se reutiliza de `LinkCard.astro`.
- Las pruebas, siguiendo lo que ya existe: unitarias en `tests/` y e2e en `tests/e2e/`.
- El script de capturas: esperas, cookies, banners y tiempo de espera.
- El formato de fecha visible: "11 nov 2026".

## Para más adelante

- **Opinión del autor** en una línea ("Lo uso para…", "Ojo: el plan gratis se queda corto en…"). Es lo que más distingue al sitio de otros directorios.
- **Qué pide para empezar:** cuenta, tarjeta, instalación.
- **Idioma de la web**, español o inglés.
- **Código abierto:** enlace al repositorio y licencia.
- **Para quién es:** si sirve para alguien que está aprendiendo o da por hecho que ya sabes.
- **Transición animada entre páginas** (View Transitions de Astro), para que se sienta como un modal.

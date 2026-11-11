---
name: mydevlinks
description: Enlaces para desarrollar, presentados como hojas de datos y filtrables por categoría, tecnología y texto.
colors:
  accent: "#1f3fbf"
  accent-ink: "#ffffff"
  accent-soft: "#e2e7fb"
  bg: "#eceef2"
  surface: "#ffffff"
  sunk: "#e2e6ec"
  ink: "#14171d"
  muted: "#525966"
  line: "#cbd0d8"
  line-strong: "#8a92a0"
  plate: "#f1f2f5"
  plate-ink: "#2b303a"
  old: "#7a4e00"
  old-bg: "#fff0c7"
  down: "#a3190f"
  down-bg: "#fce6e3"
  accent-dark: "#97a8ff"
  accent-ink-dark: "#0e1014"
  accent-soft-dark: "#1e2649"
  bg-dark: "#0e1014"
  surface-dark: "#161920"
  sunk-dark: "#1d212b"
  ink-dark: "#e7e9ee"
  muted-dark: "#a4abb7"
  line-dark: "#2b313c"
  line-strong-dark: "#5d6675"
  plate-dark: "#aeb3bd"
  plate-ink-dark: "#22262e"
  old-dark: "#f2c566"
  old-bg-dark: "#2c230f"
  down-dark: "#ff9b90"
  down-bg-dark: "#3a1714"
typography:
  display:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "tabular-nums"
  headline:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "18px"
    fontWeight: 600
    letterSpacing: "-0.02em"
  title:
    fontFamily: "IBM Plex Sans, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "IBM Plex Sans, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "IBM Plex Sans, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.08em"
  stamp:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.06em"
  chip:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: 1.3
  meta:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.02em"
rounded:
  none: "0px"
spacing:
  chip-gap: "5px"
  control-gap: "8px"
  grid-gap: "12px"
  card-inset: "14px"
  gutter-mobile: "16px"
  gutter-desktop: "20px"
components:
  ficha:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 16px 12px 14px"
  plate:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.plate-ink}"
    rounded: "{rounded.none}"
    size: "40px"
  chip:
    textColor: "{colors.muted}"
    typography: "{typography.chip}"
    rounded: "{rounded.none}"
    padding: "2px 6px"
  chip-hit:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    rounded: "{rounded.none}"
    padding: "8px 14px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
  pill:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    rounded: "{rounded.none}"
    padding: "3px 6px 3px 10px"
  pill-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
  input-search:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: "40px"
  option-category-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
  stamp-old:
    backgroundColor: "{colors.old-bg}"
    textColor: "{colors.old}"
    typography: "{typography.stamp}"
    rounded: "{rounded.none}"
    padding: "2px 6px"
  stamp-down:
    backgroundColor: "{colors.down-bg}"
    textColor: "{colors.down}"
    typography: "{typography.stamp}"
    rounded: "{rounded.none}"
    padding: "2px 6px"
  stamp-unverified:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.stamp}"
    rounded: "{rounded.none}"
    padding: "2px 6px"
---

# Design System: mydevlinks

## Overview

**Creative North Star: "La ficha técnica"**

Cada enlace es una hoja de datos: dice qué es, con qué funciona y por qué apareció. El sistema toma de la documentación de componentes su lenguaje de líneas finas, metadatos monoespaciados, sellos de estado y esquina cortada, y lo pone al servicio del filtrado.

La densidad es de herramienta de trabajo. Se usa junto al editor, así que la expresión nunca estorba: un gris azulado frío, un solo acento índigo y ninguna sombra. Lo que da carácter son la línea, la tipografía y el recorte de la ficha, no la decoración. El tema claro y el oscuro son equivalentes, y el tema del sistema es el predeterminado.

El movimiento es mínimo y solo confirma una interacción: entre 100 y 150 ms sobre el color del borde, la flecha de la ficha y los chevrones. Con movimiento reducido, las transiciones desaparecen.

**Características clave:**

- Gris azulado frío con un solo acento índigo reservado a estado e interacción.
- Esquinas rectas en todo; la única excepción de forma es el corte de la ficha.
- Profundidad por líneas y tonos, sin sombras.
- IBM Plex Mono para datos, IBM Plex Sans para lectura y controles.
- Avisos con palabra, icono y color.

## Colors

Neutros fríos de baja saturación, un acento índigo y dos colores de aviso que solo viven en los sellos. Cada valor tiene pareja oscura con sufijo `-dark`; las variables CSS no cambian de nombre entre temas.

### Primary

- **Índigo de estado** (#1f3fbf, oscuro #97a8ff): categoría seleccionada, casilla marcada, insignia del botón Filtros, foco, selección de texto, cursor y hover de botones y enlaces de acción.
- **Tinta sobre índigo** (#ffffff, oscuro #0e1014): texto e iconos sobre el acento lleno.
- **Índigo tenue** (#e2e7fb, oscuro #1e2649): fondo de chips coincidentes y píldoras de filtros activos.

### Neutral

- **Niebla azulada** (#eceef2, oscuro #0e1014): fondo de la página y de los campos de texto.
- **Hoja** (#ffffff, oscuro #161920): fichas, encabezado y panel lateral.
- **Hundido** (#e2e6ec, oscuro #1d212b): hover de opciones y del selector de tema.
- **Tinta** (#14171d, oscuro #e7e9ee): texto principal; relleno del botón primario y del tema activo.
- **Tinta apagada** (#525966, oscuro #a4abb7): dominios, contadores, chips y texto secundario.
- **Línea** (#cbd0d8, oscuro #2b313c): bordes de fichas, chips y divisiones de estructura.
- **Línea fuerte** (#8a92a0, oscuro #5d6675): bordes de controles, hover de la ficha y panel flotante de tecnologías.
- **Placa** (#f1f2f5, oscuro #aeb3bd): fondo neutro detrás de logos e iniciales.
- **Tinta de placa** (#2b303a, oscuro #22262e): inicial cuando no hay logo.

### Avisos

- **Ámbar antiguo** (#7a4e00 sobre #fff0c7; oscuro #f2c566 sobre #2c230f): sello Antiguo.
- **Rojo caído** (#a3190f sobre #fce6e3; oscuro #ff9b90 sobre #3a1714): sello Caído.

### Named Rules

**La regla del acento útil.** El índigo marca estado o interacción, nunca decoración. Si al quitarlo no se pierde información sobre qué está activo, buscado o enfocado, no corresponde.

**La regla de la placa neutra.** Todo logo ajeno va sobre la placa, nunca directo sobre la ficha. En tema oscuro la placa sigue siendo un gris medio para que los logos oscuros se distingan.

**La regla de los dos bordes.** Las estructuras usan Línea; los controles que aceptan una acción usan Línea fuerte, que mantiene 3:1 sobre la Hoja en ambos temas.

## Typography

**Fuente display:** IBM Plex Mono (con ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)
**Fuente de texto:** IBM Plex Sans (con system-ui, -apple-system, Segoe UI, Roboto, sans-serif)

**Carácter:** una sola familia en dos registros. La mono aporta la voz de hoja de datos y la sans deja leer sin esfuerzo. Ambas se alojan en el proyecto mediante Fontsource, con pesos 400, 500 y 600.

### Hierarchy

- **Display** (mono 600, 26 px, altura 1, cifras tabulares): solo el contador de resultados.
- **Headline** (mono 600, 18 px, -0.02em): la marca en el encabezado.
- **Title** (sans 600, 16 px, altura 1.3): nombre del enlace, hasta 2 líneas, subrayado en hover.
- **Body** (sans 400, 15 px, altura 1.5): base de la página.
- **Body pequeño** (sans 400, 14 px, altura 1.45): descripciones, hasta 2 líneas, opciones y campos. En texto sin verificar va en cursiva y apagado.
- **Label** (mono 600, 11 px, 0.08em, mayúsculas): rótulos de controles del panel: Buscar, Categoría y Tecnologías.
- **Sello** (mono 600, 11 px, 0.06em, mayúsculas): avisos de estado.
- **Chip** (mono 400, 11.5 px, altura 1.3; 500 si coincide): tecnologías.
- **Meta** (mono 400, 11 px, 0.02em): dominio. Los contadores del panel usan mono de 12 px con cifras tabulares.

### Named Rules

**La regla del dato monoespaciado.** Lo que se lee como dato va en mono: marca, cifras, dominios, tecnologías, sellos e iniciales. Lo que se lee como frase o se acciona como control va en sans.

**La regla de las mayúsculas con función.** Las mayúsculas espaciadas solo rotulan un control del panel o un sello de estado. No encabezan secciones ni acompañan títulos.

## Layout

El modelo es una aplicación de dos columnas sobre el ancho completo. Desde 48rem, un panel fijo de 264 px queda bajo un encabezado fijo de 58 px y la columna derecha contiene el contador, las píldoras activas y la grilla. El panel se desplaza por separado y `scroll-padding-top` de 70 px evita que el encabezado tape el foco.

La grilla llena el ancho con columnas de al menos 270 px y 12 px de separación. Las fichas de una misma fila igualan su altura; descripción y chips se alinean con filas internas. En móvil hay una columna, el encabezado se desplaza con la página, el panel queda plegado tras el botón Filtros y aparece una barra inferior fija para ver resultados.

Sin JavaScript se quitan los controles y la grilla de fichas ocupa todo el ancho.

### Named Rules

**La regla de las dos densidades.** El escritorio es compacto: opciones de 34 px, campos de 36 a 40 px. El móvil es táctil: opciones y campos de 44 px, y ningún control por debajo de 40 px. Todo control nuevo declara ambos tamaños.

## Elevation & Depth

El sistema es plano y no usa sombras. La profundidad sale de tres tonos (Niebla, Hoja, Hundido) y de las líneas. El único elemento flotante, la lista completa de tecnologías, se abre con borde de Línea fuerte y fondo Hoja, solapando la fila siguiente sin mover la grilla.

### Named Rules

**La regla de la línea antes que la sombra.** Para separar o levantar algo, primero se cambia el tono o el borde. El hover de una ficha fortalece su línea y nada se eleva.

## Shapes

Todo tiene esquinas rectas (0 px): fichas, botones, campos, chips, casillas, sellos y placas. La silueta propia es la esquina superior derecha cortada 16 px en diagonal, dibujada con un trazo de 1 px. La marca del encabezado y el favicon repiten esa misma hoja cortada.

El corte se pinta con el color de lo que hay detrás, que por defecto es el fondo de página; una ficha sobre otro fondo debe indicar ese color en `--nb`. La ficha sin verificar tiene contorno punteado y no lleva corte.

Las líneas punteadas son nativas del mundo: separan los chips de la descripción y marcan lo abierto o sin resolver, como "+N", el estado sin resultados y las fichas sin verificar.

### Named Rules

**La regla del corte único.** La esquina cortada es exclusiva de las fichas y de la marca. Paneles, botones y campos conservan sus cuatro esquinas.

## Components

### Buttons

Sólidos y directos.

- **Forma:** esquinas rectas (0 px).
- **Primario:** relleno Tinta con texto Niebla; alto de 40 px, 14 px sans 500, en "Limpiar filtros" del estado vacío. La barra móvil de resultados usa el mismo relleno a todo el ancho, sin borde, con 52 px de alto y 15 px.
- **Hover / Foco:** pasa a relleno índigo; el foco es un contorno índigo de 2 px con 2 px de separación, común a toda la interfaz.
- **Secundario:** el botón Filtros usa fondo Niebla y borde de Línea fuerte.
- **Terciario:** enlaces de acción de 13 px subrayados, que pasan a índigo en hover.
- **Selector de tema:** tres botones de icono unidos con borde de Línea y separadores; el activo se rellena de Tinta.

### Chips

- **Estilo:** borde de Línea, texto apagado y mono de 11.5 px, sin relleno.
- **Estado:** el chip coincidente lleva borde índigo, fondo Índigo tenue y peso 500, y pasa al principio de la lista. "+N" usa borde punteado y texto Tinta.
- **Desborde:** se ven hasta 5 tecnologías, o todas las coincidentes si son más. Con puntero, "+N" abre el resto sobre la fila siguiente; en táctil no hay "+N" y la lista completa queda en línea.

### Pills

Filtros activos que se quitan con un clic.

- **Estilo:** borde índigo, fondo Índigo tenue, 13 px sans y aspa de 10 px; altura compacta de escritorio de 30 px. El nombre se trunca y nunca desborda.
- **Hover:** relleno índigo con texto Tinta sobre índigo.
- **Etiqueta:** cada píldora anuncia qué quita; la búsqueda escrita va entre comillas angulares.

### Cards / Containers

La ficha es el componente central: un enlace completo con cuatro zonas en grilla.

- **Estilo de esquina:** recta, con el corte superior derecho (ver Shapes).
- **Fondo:** Hoja.
- **Sombra:** ninguna (ver Elevation & Depth).
- **Borde:** 1 px de Línea; Línea fuerte en hover e índigo con foco, con una transición de 120 ms.
- **Padding interno:** 14 px arriba y a la izquierda, 16 px a la derecha, 12 px abajo.
- **Contenido:** placa de 40 px; nombre con flecha; dominio; sello opcional; descripción; y chips bajo una línea punteada.
- **Hover:** el nombre se subraya y la flecha pasa a índigo y se mueve 1 px en diagonal.
- **Destacada** (`featured`): aparece primero en la grilla, con un tinte índigo que nace en el borde y se apaga hacia el centro, y una estrella índigo de 9 px metida en el corte. No lleva sello; la palabra "Destacado" queda solo para lectores de pantalla. Es la única excepción a la regla del acento útil, decidida por el autor.

### Inputs / Fields

- **Estilo:** fondo Niebla, borde de Línea fuerte y esquinas rectas; 40 px en escritorio (36 px en el filtro de tecnologías) y 44 px en móvil. El buscador lleva lupa de 16 px.
- **Foco:** borde índigo en el buscador y contorno índigo de 2 px alrededor del conjunto.
- **Opciones del panel:** filas completas con contador a la derecha y hover Hundido. La categoría elegida se rellena de índigo; la tecnología elegida marca su casilla cuadrada de 16 px y sube a peso 600.
- **Deshabilitado:** opacidad 50 % y sin hover.

### Navigation

- **Encabezado:** fondo Hoja con línea inferior; marca a la izquierda, total de enlaces en escritorio y selector de tema a la derecha.
- **Panel lateral:** búsqueda, categorías con plegado nativo y tecnologías con las más usadas primero y "Ver las N".
- **Móvil:** el panel se pliega tras el botón Filtros, con insignia índigo que cuenta los activos.

### Sellos de estado

- **Forma:** borde del color actual, 2 px de padding vertical, 6 px horizontal e icono de 11 px.
- **Antiguo:** ámbar con reloj.
- **Caído:** rojo con círculo tachado. El logo pasa a gris con opacidad del 55 %.
- **Sin verificar:** apagado sobre Hoja, con borde punteado e interrogación.
- **Caído y sin verificar:** sello Caído, logo apagado, contorno punteado y "Sin descripción: el sitio no responde."

### Named Rules

**La regla del aviso triple.** Todo aviso combina palabra, icono y color. Un estado nunca se comunica solo con color.

## Do's and Don'ts

### Do:

- **Haz** que cada ficha responda qué es y con qué funciona, con las tecnologías coincidentes primero y resaltadas.
- **Haz** referencia a las variables CSS de `src/styles/global.css`; los colores se resuelven por tema.
- **Haz** que el contorno punteado de una ficha signifique "sin verificar" y nada más.
- **Haz** que el hover de una superficie cambie su línea o su tono, en 150 ms o menos.
- **Haz** que todo color de texto nuevo se compruebe en ambos temas; los pares actuales superan 5.6:1.

### Don't:

- **No** redondees esquinas ni añadas sombras.
- **No** uses el índigo como decoración ni introduzcas un segundo acento.
- **No** uses el ámbar o el rojo fuera de los sellos de aviso.
- **No** pongas un logo directamente sobre la ficha.
- **No** dependas del hover en táctil para mostrar tecnologías.
- **No** apliques el corte de esquina a componentes que no sean fichas o la marca.

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Desarrolladores que construyen interfaces web, empezando por su autor. Entran con una necesidad concreta ("necesito un componente de React para esta pantalla") o a buscar inspiración. El sitio es público, en español y en inglés, y acepta aportes de otros desarrolladores (ver `CONTRIBUTING.md`).

## Product Purpose

Nació para reemplazar años de bookmarks por una base propia de enlaces. Cada enlace se entiende sin abrirlo y se encuentra por lo que hace y por la tecnología con la que funciona. Tiene éxito si quien lo usa deja de abrir enlaces uno por uno para saber qué son.

## Positioning

Una colección curada personalmente durante años, clasificada dos veces: qué es cada recurso y con qué funciona.

## Operating Context

Se usa en medio del trabajo de desarrollo, junto al editor y al navegador. No hay panel de administración: los enlaces nuevos se agregan por pull request, siguiendo `docs/adding-links.md`.

## Capabilities and Constraints

- Sitio estático en Astro con Tailwind, sin framework de interfaz, publicado en Netlify.
- Un directorio con más de 200 enlaces en 11 categorías, filtrable por categoría, tecnología, tipo de galería, precio y texto.
- Cada categoría tiene su página (`/category/<id>`), con una presentación y sus enlaces, para que se encuentre desde buscadores.
- Cada enlace tiene su página de detalle (`/tool/<id>`): qué es, captura, usos, qué revisar antes de elegirlo, precio y alternativas.
- En español (raíz) y en inglés (`/en`). Lo que no está traducido se muestra en español y no se indexa.
- Algunos enlaces pueden quedar marcados como antiguos o caídos, y conservan su aviso.
- Los logos provienen de cada sitio y varían en calidad; algunos enlaces solo tienen la inicial.

## Evidence on Hand

Datos reales en `src/data/links.json`, detalles en `src/data/details/` (con su traducción en `src/data/en/`), logos en `public/logos/` y capturas en `src/assets/screenshots/`. Los detalles se redactan a partir de lo que dice cada sitio, y avisan si su autor todavía no los revisó. No hay testimonios ni métricas de uso.

## Product Principles

- Entender antes de abrir: la tarjeta responde qué es y con qué funciona.
- La evidencia manda: nada se inventa, y lo no comprobado se dice.
- Filtrar es la acción principal, no un extra.
- Los logos ajenos deben distinguirse rápido sin competir con la interfaz.

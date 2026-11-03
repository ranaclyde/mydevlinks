# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Su autor, un desarrollador que construye proyectos reales. Entra con una necesidad concreta ("necesito un componente de React para esta pantalla") o a buscar inspiración. Más adelante la web se publicará para otros desarrolladores.

## Product Purpose

Reemplaza años de bookmarks por una base propia de enlaces. Cada enlace se entiende sin abrirlo y se encuentra por lo que hace y por la tecnología con la que funciona. Tiene éxito si el autor deja de abrir enlaces uno por uno para saber qué son.

## Positioning

Una colección curada personalmente durante años, clasificada dos veces: qué es cada recurso y con qué funciona.

## Operating Context

Se usa en medio del trabajo de desarrollo, junto al editor y al navegador. Los enlaces nuevos se agregan editando `src/data/links.json`; no hay panel de administración.

## Capabilities and Constraints

- Una sola página estática en Astro con Tailwind, sin framework de interfaz.
- 202 enlaces públicos en 12 categorías, filtrables por categoría, tecnología y texto.
- Algunos enlaces están marcados como antiguos, caídos o sin verificar, y conservan su aviso.
- Los logos provienen de cada sitio y varían en calidad; algunos enlaces solo tienen la inicial.
- Toda la interfaz va en español.
- Sin decidir: alojamiento y dominio.

## Evidence on Hand

Datos reales en `src/data/links.json` y logos en `public/logos/`. No hay testimonios ni métricas de uso.

## Product Principles

- Entender antes de abrir: la tarjeta responde qué es y con qué funciona.
- La evidencia manda: nada se inventa, y lo no comprobado se dice.
- Filtrar es la acción principal, no un extra.
- Los logos ajenos deben distinguirse rápido sin competir con la interfaz.

// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// Netlify define URL en cada build con el dominio principal del sitio (el propio o el .netlify.app).
// Fuera de Netlify se usa SITE_URL o, si falta, el subdominio por defecto.
const site = process.env.URL ?? process.env.SITE_URL ?? 'https://toolshelf.netlify.app';

// https://astro.build/config
export default defineConfig({
  site,
  // /tool/<id>.html en lugar de /tool/<id>/index.html: Netlify lo sirve en /tool/<id>,
  // la misma URL que usan los enlaces internos y el canonical, sin redirigir a la barra final.
  build: { format: 'file' },
  // Español en la raíz (/, /tool/<id>) e inglés bajo /en/ (/en/, /en/tool/<id>).
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()]
  }
});

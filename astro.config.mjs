// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// Netlify define URL en cada build con el dominio principal del sitio (el propio o el .netlify.app).
// Fuera de Netlify se usa SITE_URL o, si falta, el subdominio por defecto.
const site = process.env.URL ?? process.env.SITE_URL ?? 'https://mydevlinks.netlify.app';

// https://astro.build/config
export default defineConfig({
  site,
  // /enlace/<id>.html en lugar de /enlace/<id>/index.html: Netlify lo sirve en /enlace/<id>,
  // la misma URL que usan los enlaces internos y el canonical, sin redirigir a la barra final.
  build: { format: 'file' },
  vite: {
    plugins: [tailwindcss()]
  }
});

// Configuration Astro du site « Tour de France IA ».
// Le site est servi dans un sous-dossier : https://axion-ia.com/tourdefrance-ia/
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://axion-ia.com',
  base: '/tourdefrance-ia',
  trailingSlash: 'always',
  output: 'static',
  build: {
    // Feuilles de style injectées dans la page si elles sont petites (meilleur LCP)
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

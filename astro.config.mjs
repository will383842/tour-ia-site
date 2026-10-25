// Configuration Astro du site « Tour de France IA ».
// Le site est servi dans un sous-dossier : https://axion-ia.com/tourdefrance-ia/
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { readFile, writeFile } from 'node:fs/promises';

// PUBLIC_INDEXABLE (défaut : false) pilote le noindex des pages et de _headers
try {
  process.loadEnvFile('.env');
} catch {
  // Pas de fichier .env : valeurs par défaut
}
const indexable = process.env.PUBLIC_INDEXABLE === 'true';

/** Retire l’en-tête X-Robots-Tag de dist/_headers quand le site devient indexable. */
const enTetesRobots = {
  name: 'en-tetes-robots',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      if (!indexable) return;
      const fichier = new URL('_headers', dir);
      const contenu = await readFile(fichier, 'utf8');
      await writeFile(fichier, contenu.replace(/^\s*X-Robots-Tag:.*\n?/gim, ''));
      logger.info('Site indexable : X-Robots-Tag retiré de _headers');
    },
  },
};

export default defineConfig({
  site: 'https://axion-ia.com',
  base: '/tourdefrance-ia',
  trailingSlash: 'always',
  output: 'static',
  build: {
    // Feuilles de style injectées dans la page si elles sont petites (meilleur LCP)
    inlineStylesheets: 'auto',
  },
  integrations: [enTetesRobots],
  vite: {
    plugins: [tailwindcss()],
  },
});

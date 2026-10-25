#!/usr/bin/env node
// Captures d’écran de l’accueil (mobile 360x800 et bureau 1440x900) à partir de dist/.
// Vérifie aussi : aucun défilement horizontal et CLS nul.
// Les images vont dans captures/ (ignoré par git, publié comme artifact par la CI).

import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const racine = fileURLToPath(new URL('..', import.meta.url));
const dist = join(racine, 'dist');
const sortie = join(racine, 'captures');
const BASE = '/tourdefrance-ia/';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

// Petit serveur statique qui reproduit le sous-dossier de production
const serveur = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (!url.pathname.startsWith(BASE)) {
    res.writeHead(404).end();
    return;
  }
  let chemin = normalize(url.pathname.slice(BASE.length)).replace(/^(\.\.[/\\])+/, '');
  if (chemin === '.' || chemin.endsWith('/')) chemin = join(chemin, 'index.html');
  try {
    const contenu = await readFile(join(dist, chemin));
    res.writeHead(200, { 'content-type': TYPES[extname(chemin)] ?? 'application/octet-stream' }).end(contenu);
  } catch {
    res.writeHead(404, { 'content-type': TYPES['.html'] }).end(await readFile(join(dist, '404.html')));
  }
});
await new Promise((ok) => serveur.listen(0, '127.0.0.1', ok));
const adresse = `http://127.0.0.1:${serveur.address().port}${BASE}`;

const formats = [
  { nom: 'accueil-mobile-360x800', largeur: 360, hauteur: 800, mobile: true },
  { nom: 'accueil-bureau-1440x900', largeur: 1440, hauteur: 900, mobile: false },
];

await mkdir(sortie, { recursive: true });
const navigateur = await chromium.launch();
const problemes = [];

for (const f of formats) {
  const contexte = await navigateur.newContext({
    viewport: { width: f.largeur, height: f.hauteur },
    deviceScaleFactor: f.mobile ? 2 : 1,
    isMobile: f.mobile,
    hasTouch: f.mobile,
    locale: 'fr-FR',
  });
  const page = await contexte.newPage();
  // Mesure du CLS dès le début du chargement
  await page.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((liste) => {
      for (const e of liste.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(adresse, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const mesures = await page.evaluate(() => ({
    debordement: document.documentElement.scrollWidth - window.innerWidth,
    cls: window.__cls,
  }));
  if (mesures.debordement > 0) problemes.push(`${f.nom} : défilement horizontal de ${mesures.debordement} px`);
  if (mesures.cls > 0) problemes.push(`${f.nom} : CLS = ${mesures.cls.toFixed(4)}`);

  await page.screenshot({ path: join(sortie, `${f.nom}.png`), fullPage: true });
  console.log(`✓ ${f.nom}.png (débordement ${mesures.debordement} px, CLS ${mesures.cls.toFixed(4)})`);
  await contexte.close();
}

await navigateur.close();
serveur.close();

if (problemes.length > 0) {
  console.error(`✗ ${problemes.join('\n✗ ')}`);
  process.exit(1);
}

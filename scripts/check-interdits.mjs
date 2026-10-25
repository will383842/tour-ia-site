#!/usr/bin/env node
// Contrôle des textes publics : mots interdits (src/, public/, dist/, README)
// et typographie française du texte visible des pages construites (dist/).
// Échoue avec le code 1 au moindre problème.

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = fileURLToPath(new URL('..', import.meta.url));
const ceScript = fileURLToPath(import.meta.url);

// Espaces possibles entre deux mots (dont insécables)
const E = '[\\s\\u00a0\\u202f]+';
// Bornes de mot compatibles avec les lettres accentuées
const avant = '(?<![\\p{L}\\p{N}])';
const apres = '(?![\\p{L}\\p{N}])';
const mot = (m) => new RegExp(`${avant}${m.replaceAll(' ', E)}${apres}`, 'giu');

// Liste des interdits : [libellé, expression]
const INTERDITS = [
  ['Grenoble', mot('grenoble')],
  ['devis', mot('devis')],
  ['palmarès', mot('palmar[eè]s')],
  ['« Ils en parlent »', mot('ils en parlent')],
  ['« Aucun gain garanti »', mot('aucun gain garanti')],
  ['« certifié Qualiopi »', mot('certifi[ée]e?s? qualiopi')],
  ['Qualiopi', mot('qualiopi')],
  ['CPF', mot('cpf')],
  ['OPCO', mot('opco')],
  ['étincelle', mot('[ée]tincelles?')],
  ['spark', mot('sparks?')],
  ['✨', /✨/gu],
  ['obligatoire', mot('obligatoires?')],
  ['« réservé aux TPE/PME »', mot('r[ée]serv[ée]e?s? aux (tpe|pme)(\\s*/\\s*(tpe|pme))?')],
  ['candidater', mot('candidat(er|ez|ons)')],
  ['candidature', mot('candidatures?')],
  ['« marque déposée »', mot('marques? d[ée]pos[ée]es?')],
  ['« Nous, si. »', new RegExp(`nous,${E}si${E}?\\.`, 'giu')],
  ['slogan de l’organisateur', mot('on vous parle d[’\']ia partout')],
  ['gratuit', mot('gratuit(e|s|es|ement)?')],
  ['offert', mot('offert(e|s|es)?')],
];

const EXTENSIONS = new Set(['.astro', '.ts', '.mjs', '.js', '.css', '.html', '.md', '.json', '.svg', '.txt', '.xml', '']);
const DOSSIERS = ['src', 'public', 'dist'];
const FICHIERS = ['README.md'];

async function existe(chemin) {
  try {
    await stat(chemin);
    return true;
  } catch {
    return false;
  }
}

async function* parcourir(dossier) {
  for (const entree of await readdir(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) yield* parcourir(chemin);
    else if (EXTENSIONS.has(extname(entree.name))) yield chemin;
  }
}

const erreurs = [];
const signaler = (fichier, texte, index, message) => {
  const ligne = texte.slice(0, index).split('\n').length;
  erreurs.push(`${relative(racine, fichier)}:${ligne}  ${message}`);
};

// Texte visible d’une page HTML (sans scripts, styles ni balises) + titre et description
function texteVisible(html) {
  const meta = [...html.matchAll(/<(?:title)>([^<]*)<\/title>|name="description" content="([^"]*)"/g)]
    .map((m) => m[1] ?? m[2])
    .join('\n');
  const corps = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  return decoder(`${meta}\n${corps}`);
}

function decoder(t) {
  return t
    .replace(/&nbsp;|&#160;|&#xa0;/gi, ' ')
    .replace(/&#39;|&#x27;|&apos;/gi, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

// Règles typographiques vérifiées sur le texte visible
const TYPO = [
  ['apostrophe droite (utiliser ’)', /\p{L}'\p{L}/gu],
  ['espace insécable manquante avant : ; ? ! »', /(?:\p{L}|\p{N}|\))[ ]?[:;?!»]/gu],
  ['espace insécable manquante après «', /«[ ]?\p{L}/gu],
  ['écrire « e-mail »', /(?<![\p{L}-])(email|mail|e mail)s?(?!\p{L})/giu],
];

for (const dossier of DOSSIERS) {
  const chemin = join(racine, dossier);
  if (!(await existe(chemin))) {
    console.warn(`(dossier ${dossier}/ absent : ignoré)`);
    continue;
  }
  for await (const fichier of parcourir(chemin)) {
    if (fichier === ceScript) continue;
    const texte = await readFile(fichier, 'utf8');
    // Les noms de fichiers hachés et le CSS minifié ne sont pas du texte public
    const aScanner = fichier.endsWith('.css') && dossier === 'dist' ? '' : texte;
    for (const [libelle, re] of INTERDITS) {
      for (const m of aScanner.matchAll(re)) signaler(fichier, aScanner, m.index, `mot interdit : ${libelle} (« ${m[0]} »)`);
    }
    if (dossier === 'dist' && fichier.endsWith('.html')) {
      const visible = texteVisible(texte);
      for (const [libelle, re] of TYPO) {
        for (const m of visible.matchAll(re)) {
          // Les URL (https:) ne sont pas du texte courant
          if (m[0].endsWith(':') && /https?$/.test(visible.slice(Math.max(0, m.index - 5), m.index + 1))) continue;
          const contexte = visible.slice(Math.max(0, m.index - 25), m.index + 25).replace(/\s+/g, ' ').trim();
          erreurs.push(`${relative(racine, fichier)}  typographie : ${libelle} (… ${contexte} …)`);
        }
      }
    }
  }
}

for (const nom of FICHIERS) {
  const fichier = join(racine, nom);
  if (!(await existe(fichier))) continue;
  const texte = await readFile(fichier, 'utf8');
  for (const [libelle, re] of INTERDITS) {
    for (const m of texte.matchAll(re)) signaler(fichier, texte, m.index, `mot interdit : ${libelle} (« ${m[0]} »)`);
  }
}

if (erreurs.length > 0) {
  console.error(`✗ ${erreurs.length} problème(s) dans les textes publics :\n`);
  for (const e of erreurs) console.error(`  ${e}`);
  process.exit(1);
}
console.log('✓ Textes publics conformes (mots interdits et typographie).');

# Tour de France IA

Site vitrine statique du Tour de France IA, organisé par Axion-IA.
Servi sous `https://axion-ia.com/tourdefrance-ia/`.

## Pile

Astro (sortie statique, `base: '/tourdefrance-ia'`), TypeScript strict, Tailwind CSS v4, polices auto-hébergées. Aucun framework JavaScript côté client.

## Commandes

Node 22.23.4 ou plus récent, pnpm.

```sh
pnpm install
pnpm dev          # serveur local : http://localhost:4321/tourdefrance-ia/
pnpm build        # génère dist/
pnpm check        # mots interdits et typographie (src/, public/, dist/)
pnpm screenshots  # captures de l’accueil à partir de dist/ (Playwright)
```

## Données

Source unique dans `src/data/` :

- `brand.ts` : noms, URL, liens de l’organisateur ;
- `faits.ts` : seuil d’ouverture, durées, soirée du vendredi ;
- `etapes.ts` : villes du Tour (liste vide tant qu’aucune étape n’est réelle).

## Indexation

Préproduction : `noindex, nofollow` partout (balise meta et `X-Robots-Tag` dans `_headers`).
Pour autoriser l’indexation, construire avec `PUBLIC_INDEXABLE=true`.
Le fichier `_headers` doit être servi à la racine du déploiement qui héberge le sous-dossier.

## CI

`.github/workflows/ci.yml` : installation, build, contrôle des textes, puis captures mobile (360x800) et bureau (1440x900) publiées comme artifact du workflow.

// Identité du site : source unique pour les noms et les URL.

export const MARQUE_NOM = 'Tour de France IA';
export const ORGANISATEUR = 'Axion-IA';
export const FONDATEUR = 'Williams Jullin';

/** Domaine qui héberge le site. */
export const SITE_ORIGINE = 'https://axion-ia.com';
/** Sous-dossier du site (identique au `base` d’Astro). */
export const BASE = '/tourdefrance-ia/';
/** URL absolue de la page d’accueil du Tour. */
export const URL_BASE = `${SITE_ORIGINE}${BASE}`;

/** Liens vers le site de l’organisateur. */
export const LIENS_ORGANISATEUR = {
  accueil: `${SITE_ORIGINE}/fr/`,
  aPropos: `${SITE_ORIGINE}/fr/a-propos`,
  presse: `${SITE_ORIGINE}/fr/presse`,
  glossaire: `${SITE_ORIGINE}/fr/glossaire`,
  contact: `${SITE_ORIGINE}/fr/contact`,
  mentionsLegales: `${SITE_ORIGINE}/fr/mentions-legales`,
  confidentialite: `${SITE_ORIGINE}/fr/politique-confidentialite`,
  accessibilite: `${SITE_ORIGINE}/fr/accessibilite`,
} as const;

/** Mention affichée sur toutes les pages. */
export const MENTION_INDEPENDANCE =
  'Le Tour de France IA n’a aucun lien avec le Tour de France cycliste ni avec son organisateur.';

/**
 * Construit un chemin interne en tenant compte du `base`.
 * Écrire le chemin avec son / final : lien('participer/'), lien('#etapes').
 */
export function lien(chemin = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  return `${base}${chemin.replace(/^\/+/, '')}`;
}

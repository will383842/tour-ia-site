// Étapes du Tour. Source unique : aucune ville n’est inventée.
// Ajouter une étape ici seulement quand elle est réelle.

import { SEUIL_OUVERTURE } from './faits';

export type EtatEtape = 'a-annoncer' | 'inscriptions-ouvertes' | 'confirmee' | 'terminee';

export type Etape = {
  slug: string;
  ville: string;
  region: string;
  etat: EtatEtape;
  /** Date de début au format ISO (AAAA-MM-JJ). */
  dateDebut?: string;
  /** Nombre d’entreprises ayant confirmé. */
  confirmees: number;
  seuil: typeof SEUIL_OUVERTURE;
};

export const LIBELLES_ETAT: Record<EtatEtape, string> = {
  'a-annoncer': 'À annoncer',
  'inscriptions-ouvertes': 'Inscriptions ouvertes',
  confirmee: 'Confirmée',
  terminee: 'Terminée',
};

// Liste vide au départ : les villes s’ouvrent au fil des inscriptions.
export const ETAPES: Etape[] = [];

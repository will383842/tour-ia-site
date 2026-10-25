// Faits du Tour : chiffres et formats réutilisés partout dans le site.

/** Nombre d’entreprises confirmées nécessaire pour ouvrir une ville. */
export const SEUIL_OUVERTURE = 5 as const;

export const AUDIT = {
  moment: 'Le matin',
  dureeMin: 2,
  dureeMax: 4,
  libelleDuree: '2 à 4 h',
} as const;

export const FORMATION = {
  moment: 'L’après-midi',
  duree: 4,
  libelleDuree: '4 h',
} as const;

export const SOIREE = {
  moment: 'Le vendredi soir',
  libelle: 'la soirée réseau Tour de France IA',
} as const;

/** Durée de la visio de cadrage, en minutes. */
export const VISIO_MINUTES = 20 as const;
/** Temps estimé pour participer, en minutes. */
export const PARTICIPATION_MINUTES = 2 as const;

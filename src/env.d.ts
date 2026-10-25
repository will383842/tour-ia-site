/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** « true » pour autoriser l'indexation ; tout le reste = noindex (préproduction). */
  readonly PUBLIC_INDEXABLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

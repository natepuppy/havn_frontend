/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PEST_API_URL?: string;
  readonly VITE_AUTH_API_URL?: string;
  readonly VITE_DEV_EMAIL?: string;
  readonly VITE_DEV_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

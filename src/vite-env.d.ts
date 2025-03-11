/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly VITE_API_URL?: string;
  readonly VITE_BASE_URL?: string;
  readonly VITE_ENABLE_DATA_EXPORT?: string;
  readonly VITE_ENABLE_DATA_IMPORT?: string;
  readonly VITE_ENABLE_CHARTING?: string;
  readonly VITE_ENABLE_REPORTING?: string;
  readonly VITE_ENABLE_NOTIFICATIONS?: string;
  readonly VITE_ENABLE_OFFLINE_MODE?: string;
  readonly VITE_ENABLE_SUBSCRIPTIONS?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

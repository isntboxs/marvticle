interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_BUCKET_PUBLIC_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

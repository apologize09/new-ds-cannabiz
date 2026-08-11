/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_PACDORA_APP_ID?: string
  readonly VITE_PACDORA_USER_ID?: string
  readonly VITE_PACDORA_SDK_URL?: string
}

interface ImportMeta { readonly env: ImportMetaEnv }

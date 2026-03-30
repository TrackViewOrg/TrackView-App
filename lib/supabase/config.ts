const RUNTIME_DATASET_KEYS = {
  NEXT_PUBLIC_SUPABASE_URL: 'supabaseUrl',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'supabaseAnonKey',
} as const

function getBrowserRuntimeEnv(
  name: keyof typeof RUNTIME_DATASET_KEYS
): string | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const datasetKey = RUNTIME_DATASET_KEYS[name]
  return document.body?.dataset[datasetKey]?.trim()
}

function getRequiredEnv(name: keyof typeof RUNTIME_DATASET_KEYS) {
  const value = process.env[name]?.trim() || getBrowserRuntimeEnv(name)?.trim()

  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${name}`)
  }

  return value
}

export function getSupabaseConfig() {
  return {
    url: getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  }
}

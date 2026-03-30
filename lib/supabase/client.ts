import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseConfig } from '@/lib/supabase/config'

/**
 * Creates a Supabase client for use in the browser (client-side components).
 * This client handles authentication state automatically and persists it in cookies/local storage.
 *
 * @returns A Supabase client instance configured for the browser.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseConfig()

  return createBrowserClient(url, anonKey)
}

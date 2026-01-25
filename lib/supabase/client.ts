import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in the browser (client-side components).
 * This client handles authentication state automatically and persists it in cookies/local storage.
 *
 * @returns A Supabase client instance configured for the browser.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

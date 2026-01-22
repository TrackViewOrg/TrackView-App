import { createClient } from '@/lib/supabase/client'
import { createBrowserClient } from '@supabase/ssr'

jest.mock('@supabase/ssr')

describe('Supabase Client', () => {
    it('should create a browser client with correct env vars', () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

        createClient()

        expect(createBrowserClient).toHaveBeenCalledWith(
            'https://example.supabase.co',
            'anon-key'
        )
    })
})

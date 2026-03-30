import { createClient } from '@/lib/supabase/client'
import { createBrowserClient } from '@supabase/ssr'

jest.mock('@supabase/ssr')

describe('Supabase Client', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    delete document.body.dataset.supabaseUrl
    delete document.body.dataset.supabaseAnonKey
    jest.clearAllMocks()
  })

  it('should create a browser client with correct env vars', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

    createClient()

    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key'
    )
  })

  it('should fall back to runtime dataset values in the browser', () => {
    document.body.dataset.supabaseUrl = 'https://runtime.supabase.co'
    document.body.dataset.supabaseAnonKey = 'runtime-anon-key'

    createClient()

    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://runtime.supabase.co',
      'runtime-anon-key'
    )
  })
})

import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

jest.mock('@supabase/ssr')
jest.mock('next/headers')

describe('Supabase Server Client', () => {
    it('should create a server client with cookie handling', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

        const mockCookieStore = {
            getAll: jest.fn().mockReturnValue([]),
            set: jest.fn(),
        }
        ;(cookies as jest.Mock).mockResolvedValue(mockCookieStore)

        await createClient()

        expect(createServerClient).toHaveBeenCalledWith(
            'https://example.supabase.co',
            'anon-key',
            expect.objectContaining({
                cookies: expect.objectContaining({
                    getAll: expect.any(Function),
                    setAll: expect.any(Function),
                }),
            })
        )
    })

    it('should handle cookie setting in setAll', async () => {
        const mockCookieStore = {
            getAll: jest.fn(),
            set: jest.fn(),
        }
        ;(cookies as jest.Mock).mockResolvedValue(mockCookieStore)

        // Capture the options passed to createServerClient
        let capturedOptions: any
        ;(createServerClient as jest.Mock).mockImplementation((url, key, options) => {
            capturedOptions = options
            return {}
        })

        await createClient()

        // Simulate calling setAll
        const cookiesToSet = [
            { name: 'test', value: 'value', options: { path: '/' } }
        ]
        capturedOptions.cookies.setAll(cookiesToSet)

        expect(mockCookieStore.set).toHaveBeenCalledWith('test', 'value', { path: '/' })
    })
})

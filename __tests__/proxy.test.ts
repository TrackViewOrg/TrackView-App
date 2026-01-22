import middleware from '@/proxy'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

jest.mock('@supabase/ssr')
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      next: jest.fn(() => ({
        cookies: {
          set: jest.fn(),
          getAll: jest.fn().mockReturnValue([]),
        },
      })),
      redirect: jest.fn(() => ({
        cookies: {
          set: jest.fn(),
          getAll: jest.fn().mockReturnValue([]),
        },
      })),
    },
  }
})

describe('Middleware (Proxy)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRequest: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
        mfa: {
          getAuthenticatorAssuranceLevel: jest.fn(),
        },
      },
    }
    ;(createServerClient as jest.Mock).mockReturnValue(mockSupabase)

    mockRequest = {
      nextUrl: {
        pathname: '/',
        clone: jest.fn().mockReturnThis(),
        search: '',
      },
      cookies: {
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
      },
      headers: new Headers(),
    } as unknown as NextRequest
  })

  it('should redirect unauthenticated user to signin', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    mockRequest.nextUrl.pathname = '/dashboard'

    // We need to ensure the response object returned by NextResponse.next()
    // has the structure expected by the `navigate` function.
    // The `navigate` function calls `originalResponse.cookies.getAll()`.
    // In our mock above, we added `getAll` to the return value of `next` and `redirect`.

    await middleware(mockRequest)

    expect(NextResponse.redirect).toHaveBeenCalled()
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/auth/signin')
  })

  it('should allow unauthenticated user to access public pages', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    mockRequest.nextUrl.pathname = '/auth/signin'

    await middleware(mockRequest)

    expect(NextResponse.next).toHaveBeenCalled()
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it('should redirect authenticated user to verify-mfa if MFA pending', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '1' } } })
    mockSupabase.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { nextLevel: 'aal2', currentLevel: 'aal1' },
    })
    mockRequest.nextUrl.pathname = '/dashboard'

    await middleware(mockRequest)

    expect(NextResponse.redirect).toHaveBeenCalled()
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/auth/verify-mfa')
  })

  it('should allow authenticated user to access dashboard', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '1' } } })
    mockSupabase.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { nextLevel: 'aal1', currentLevel: 'aal1' },
    })
    mockRequest.nextUrl.pathname = '/dashboard'

    await middleware(mockRequest)

    expect(NextResponse.next).toHaveBeenCalled()
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it('should redirect authenticated user from signin to dashboard', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '1' } } })
    mockSupabase.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { nextLevel: 'aal1', currentLevel: 'aal1' },
    })
    mockRequest.nextUrl.pathname = '/auth/signin'

    await middleware(mockRequest)

    expect(NextResponse.redirect).toHaveBeenCalled()
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/dashboard')
  })

  it('should allow access to callback route even if authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '1' } } })
    mockSupabase.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { nextLevel: 'aal1', currentLevel: 'aal1' },
    })
    mockRequest.nextUrl.pathname = '/auth/callback'

    await middleware(mockRequest)

    expect(NextResponse.next).toHaveBeenCalled()
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })
})

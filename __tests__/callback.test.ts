import { GET } from '@/app/auth/callback/route'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

jest.mock('@/lib/supabase/server')
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      redirect: jest.fn(() => ({
        cookies: { set: jest.fn() },
      })),
    },
  }
})

describe('Callback Route', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRequest: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabase = {
      auth: {
        exchangeCodeForSession: jest.fn(),
        mfa: {
          listFactors: jest.fn(),
        },
      },
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    mockRequest = {
      url: 'http://localhost:3000/auth/callback?code=123',
    }
  })

  it('should exchange code for session and redirect to dashboard', async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })
    mockSupabase.auth.mfa.listFactors.mockResolvedValue({ data: { all: [] } })

    await GET(mockRequest as Request)

    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('123')
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      'http://localhost:3000/dashboard'
    )
  })

  it('should redirect to signin if code exchange fails', async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
      error: { message: 'Invalid code' },
    })

    await GET(mockRequest as Request)

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      'http://localhost:3000/auth/signin?error=Authentication failed'
    )
  })

  it('should redirect to verify-mfa if user has verified TOTP', async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })
    mockSupabase.auth.mfa.listFactors.mockResolvedValue({
      data: { all: [{ status: 'verified', factor_type: 'totp' }] },
    })

    await GET(mockRequest as Request)

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.stringContaining('/auth/verify-mfa')
    )
  })

  it('should set recovery cookie if next is update-password', async () => {
    mockRequest.url =
      'http://localhost:3000/auth/callback?code=123&next=/update-password'
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })
    mockSupabase.auth.mfa.listFactors.mockResolvedValue({ data: { all: [] } })

    const response = await GET(mockRequest as Request)

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      'http://localhost:3000/update-password'
    )
    expect(response.cookies.set).toHaveBeenCalledWith(
      'trackview-recovery-mode',
      'true',
      expect.any(Object)
    )
  })
})

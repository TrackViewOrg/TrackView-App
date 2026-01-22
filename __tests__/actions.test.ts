import {
  signin,
  handleSignup,
  signout,
  verifyOtpForLogin,
  handleForgotPassword,
  updatePasswordAction,
  handleGoogleLogin,
} from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

jest.mock('@/lib/supabase/server')
jest.mock('next/navigation')
jest.mock('next/cache')
jest.mock('next/headers')

describe('Auth Actions', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockCookieStore: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabase = {
      auth: {
        signInWithPassword: jest.fn(),
        mfa: {
          listFactors: jest.fn(),
          challenge: jest.fn(),
          verify: jest.fn(),
        },
        signInWithOAuth: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        updateUser: jest.fn(),
      },
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    mockCookieStore = {
      set: jest.fn(),
      delete: jest.fn(),
    }
    ;(cookies as jest.Mock).mockResolvedValue(mockCookieStore)
  })

  describe('signin', () => {
    it('should redirect with error if email or password missing', async () => {
      await signin('', '')
      expect(redirect).toHaveBeenCalledWith(
        expect.stringContaining('error=Email and password are required')
      )
    })

    it('should return error if signInWithPassword fails', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: { message: 'Invalid login' },
      })
      const result = await signin('test@example.com', 'password')
      expect(result).toEqual({ error: 'Invalid login' })
    })

    it('should redirect to verify-mfa if user has verified TOTP', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })
      mockSupabase.auth.mfa.listFactors.mockResolvedValue({
        data: { all: [{ status: 'verified', factor_type: 'totp' }] },
        error: null,
      })

      await signin('test@example.com', 'password')
      expect(redirect).toHaveBeenCalledWith('/auth/verify-mfa')
    })

    it('should redirect to dashboard if no MFA', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })
      mockSupabase.auth.mfa.listFactors.mockResolvedValue({
        data: { all: [] },
        error: null,
      })

      await signin('test@example.com', 'password')
      expect(redirect).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('handleGoogleLogin', () => {
    it('should redirect to provider url', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://google.com/auth' },
        error: null,
      })
      await handleGoogleLogin()
      expect(redirect).toHaveBeenCalledWith('https://google.com/auth')
    })

    it('should return error if signInWithOAuth fails', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        error: { message: 'OAuth failed' },
      })
      const result = await handleGoogleLogin()
      expect(result).toEqual({ error: 'OAuth failed' })
    })
  })

  describe('signup', () => {
    it('should redirect to verify-email on success', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ error: null })
      await handleSignup({
        email: 'test@example.com',
        password: 'pass',
        username: 'user',
      })
      expect(redirect).toHaveBeenCalledWith('/auth/verify-email')
    })

    it('should return error if signUp fails', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        error: { message: 'Signup failed' },
      })
      const result = await handleSignup({
        email: 'test@example.com',
        password: 'pass',
        username: 'user',
      })
      expect(result).toEqual({ error: 'Signup failed' })
    })
  })

  describe('signout', () => {
    it('should sign out and redirect to signin', async () => {
      await signout()
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/auth/signin')
    })
  })

  describe('verifyOtpForLogin', () => {
    it('should return error if code is missing', async () => {
      const formData = new FormData()
      const result = await verifyOtpForLogin(formData)
      expect(result).toEqual({ error: 'Code is required' })
    })

    it('should verify OTP and redirect', async () => {
      const formData = new FormData()
      formData.append('code', '123456')

      mockSupabase.auth.mfa.listFactors.mockResolvedValue({
        data: {
          all: [{ id: 'factor1', status: 'verified', factor_type: 'totp' }],
        },
        error: null,
      })
      mockSupabase.auth.mfa.challenge.mockResolvedValue({
        data: { id: 'challenge1' },
        error: null,
      })
      mockSupabase.auth.mfa.verify.mockResolvedValue({ error: null })

      await verifyOtpForLogin(formData)
      expect(redirect).toHaveBeenCalledWith('/dashboard')
    })

    it('should set recovery cookie if next is update-password', async () => {
      const formData = new FormData()
      formData.append('code', '123456')
      formData.append('next', '/update-password')

      mockSupabase.auth.mfa.listFactors.mockResolvedValue({
        data: {
          all: [{ id: 'factor1', status: 'verified', factor_type: 'totp' }],
        },
        error: null,
      })
      mockSupabase.auth.mfa.challenge.mockResolvedValue({
        data: { id: 'challenge1' },
        error: null,
      })
      mockSupabase.auth.mfa.verify.mockResolvedValue({ error: null })

      await verifyOtpForLogin(formData)
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'trackview-recovery-mode',
        'true',
        expect.any(Object)
      )
      expect(redirect).toHaveBeenCalledWith('/update-password')
    })
  })

  describe('handleForgotPassword', () => {
    it('should call resetPasswordForEmail', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })
      const result = await handleForgotPassword('test@example.com')
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalled()
      expect(result).toEqual({
        success: 'Check your email for the reset link!',
      })
    })
  })

  describe('updatePasswordAction', () => {
    it('should update user and delete recovery cookie', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null })
      const result = await updatePasswordAction('newpass')
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpass',
      })
      expect(mockCookieStore.delete).toHaveBeenCalledWith(
        'trackview-recovery-mode'
      )
      expect(result).toEqual({ success: true })
    })
  })
})

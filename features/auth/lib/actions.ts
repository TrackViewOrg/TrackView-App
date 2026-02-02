'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  callbackRoute,
  dashRoute,
  signinRoute,
  updatePasswordRoute,
  verifyEmailRoute,
  verifyMfaRoute,
} from '@/lib/constants'
import { cookies } from 'next/headers'

/**
 * Handles user sign-in with email and password.
 * Checks for MFA enrollment and redirects accordingly.
 *
 * @param email - User's email address.
 * @param password - User's password.
 * @returns Redirects to dashboard or MFA verification page, or returns an error object.
 */
export async function signin(email: string, password: string) {
  const supabase = await createClient()

  if (!email || !password) {
    return redirect(`${signinRoute}?error=Email and password are required`)
  }

  // 1. Attempt Password Sign-in (Establishes AAL1 Session)
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error: error.message }

  // 2. Check if MFA is enabled for this user
  const { data: mfaData, error: mfaError } =
    await supabase.auth.mfa.listFactors()

  if (mfaError) return { error: mfaError.message }

  const hasVerifiedTotp = mfaData.all.some(
    (factor) => factor.status === 'verified' && factor.factor_type === 'totp'
  )

  // 3. Logic Branch
  if (hasVerifiedTotp) {
    // User has MFA -> Redirect to OTP entry page
    return redirect(verifyMfaRoute)
  }

  // No MFA -> Go to Dashboard (AAL1 is sufficient)
  revalidatePath('/', 'layout')
  redirect(dashRoute)
}

/**
 * Initiates Google OAuth login flow.
 * Redirects the user to Google's consent screen.
 */
export const handleGoogleLogin = async () => {
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // FIX: Append `?next=${dashRoute}` to the redirectTo URL
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}${callbackRoute}?next=${dashRoute}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data?.url) {
    redirect(data.url)
  }
}

/**
 * Handles new user registration.
 * Creates a new user account and sends a verification email.
 *
 * @param formData - Object containing email, password, and username.
 * @returns Redirects to email verification page or returns an error object.
 */
export async function handleSignup(formData: {
  email: string
  password: string
  username: string
}) {
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        username: formData.username,
      },
      // FIX: Append `?next=${dashRoute}` so verification link goes straight to dashboard
      emailRedirectTo: `${origin}${callbackRoute}?next=${dashRoute}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // This remains the same: we still need them to go check their inbox first.
  // However, once they click the link, they will bypass the login screen.
  redirect(verifyEmailRoute)
}

/**
 * Signs out the current user and redirects to the sign-in page.
 */
export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect(signinRoute)
}

/**
 * Verifies the Time-based One-Time Password (TOTP) for MFA login.
 *
 * @param formData - FormData containing the 'code' and optionally 'next' URL.
 * @returns Redirects to the destination URL or returns an error object.
 */
export async function verifyOtpForLogin(formData: FormData) {
  const supabase = await createClient()
  const code = formData.get('code') as string

  // 1. CATCH THE BATON: Get the 'next' URL that we passed from the frontend
  // If it's missing, ONLY THEN do we fall back to dashRoute
  const nextUrl = (formData.get('next') as string) || dashRoute

  if (!code) {
    return { error: 'Code is required' }
  }

  const { data: factors, error: factorsError } =
    await supabase.auth.mfa.listFactors()
  if (factorsError) return { error: factorsError.message }

  const totpFactor = factors.all.find(
    (f) => f.status === 'verified' && f.factor_type === 'totp'
  )
  if (!totpFactor) return { error: 'No MFA factor found' }

  // 2. Create Challenge
  const { data: challengeData, error: challengeError } =
    await supabase.auth.mfa.challenge({
      factorId: totpFactor.id,
    })
  if (challengeError) return { error: challengeError.message }

  // 3. Verify Code
  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: totpFactor.id,
    challengeId: challengeData.id,
    code,
  })

  if (verifyError) {
    return { error: 'Invalid code' }
  }

  // 4. FINAL REDIRECT: Go to the URL we preserved (/update-password)
  revalidatePath('/', 'layout')

  // Security check: ensure it starts with / to prevent open redirects
  const finalDestination = nextUrl.startsWith('/') ? nextUrl : dashRoute

  // If we are going to update-password, we need to set the recovery cookie
  if (finalDestination === updatePasswordRoute) {
    const cookieStore = await cookies()
    cookieStore.set('trackview-recovery-mode', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300, // 5 minutes
      path: '/',
    })
  }

  redirect(finalDestination)
}

/**
 * Initiates the password reset flow.
 * Sends a password reset email to the user.
 *
 * @param email - The email address to send the reset link to.
 * @returns Success message or error object.
 */
export const handleForgotPassword = async (email: string) => {
  const supabase = await createClient()

  // We send them to the callback first to establish the session
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${callbackRoute}`

  // 2. Encode the target path so query params (?update_password=true) stick together
  const targetPath = updatePasswordRoute
  const redirectUrl = `${callbackUrl}?next=${encodeURIComponent(targetPath)}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  })

  if (error) return { error: error.message }
  return { success: 'Check your email for the reset link!' }
}

/**
 * Updates the user's password.
 * Should be called after the user has authenticated via a reset link or existing session.
 *
 * @param password - The new password.
 * @returns Success object or error object.
 */
export async function updatePasswordAction(password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) return { error: error.message }

  // Success: Cleanup the recovery cookie so they can't refresh and see the form again
  const cookieStore = await cookies()
  cookieStore.delete('trackview-recovery-mode')

  return { success: true }
}

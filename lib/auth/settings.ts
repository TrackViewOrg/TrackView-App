'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import qrcode from 'qrcode'

const FRIENDLY_NAME = 'Trackview Authenticator'

export interface Factor {
  id: string
  friendly_name?: string
  factor_type: 'totp' | 'phone' | 'webauthn'
  status: 'verified' | 'unverified'
  created_at: string
  updated_at: string
}

/**
 * Updates the user's profile avatar URL in the database.
 *
 * @param avatarUrl - The public URL of the uploaded avatar image.
 * @returns Success object or throws an error.
 */
export async function updateProfileAvatar(avatarUrl: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Profile update failed: ${error.message}`)
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

// --- GET FACTORS ---

/**
 * Retrieves a list of verified TOTP MFA factors for the current user.
 *
 * @returns Object containing an array of factors.
 */
export async function getMFAFactors() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.listFactors()

  if (error || !data) {
    return { factors: [] }
  }

  // Filter only verified TOTP factors
  const factors = (data.all as Factor[]).filter(
    (f) => f.factor_type === 'totp' && f.status === 'verified'
  )

  return { factors }
}

// --- VERIFY EXISTING FACTOR (GATEKEEPER) ---

/**
 * Verifies an existing MFA factor (e.g., before allowing sensitive actions).
 *
 * @param factorId - The ID of the factor to verify.
 * @param code - The TOTP code provided by the user.
 * @returns Success object or error object.
 */
export async function verifyExistingFactor(factorId: string, code: string) {
  const supabase = await createClient()

  // 1. Create Challenge
  const { data: challengeData, error: challengeError } =
    await supabase.auth.mfa.challenge({
      factorId,
    })
  if (challengeError) return { error: challengeError.message }

  // 2. Verify
  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code,
  })

  if (verifyError) return { error: verifyError.message }

  return { success: true }
}

// --- ENROLL NEW DEVICE ---

/**
 * Starts the enrollment process for a new MFA device (TOTP).
 * Generates a QR code for the user to scan.
 *
 * @param deviceName - A friendly name for the device (defaults to 'Trackview Authenticator').
 * @param email - The user's email address (used in the authenticator app label).
 * @returns Object containing factorId, QR code data URL, and secret, or an error object.
 */
export async function enrollMFA(
  deviceName: string = FRIENDLY_NAME,
  email: string | undefined
) {
  const supabase = await createClient()

  // 1. Enroll with Supabase (friendlyName here is for DB only)
  const { data: enrollData, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: deviceName || FRIENDLY_NAME,
  })

  if (error) {
    return { error: error.message }
  }

  // 2. Define your Custom App Name and User Email
  const issuer = 'TrackView'
  const accountName = email // You likely have this from your auth session

  // 3. Construct the Custom URI
  // Format: otpauth://totp/{Issuer}:{AccountName}?secret={Secret}&issuer={Issuer}
  const secret = enrollData.totp.secret
  const customUri = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`

  // 4. Generate QR Code from the CUSTOM URI, not the default one
  const qrCodeData = await qrcode.toDataURL(customUri)

  return {
    factorId: enrollData.id,
    qrCode: qrCodeData,
    secret: secret,
  }
}

// --- VERIFY & ENABLE (NEW ENROLLMENT) ---

/**
 * Completes the MFA enrollment by verifying the first code from the new device.
 *
 * @param factorId - The ID of the pending factor.
 * @param code - The TOTP code from the new device.
 * @returns Success object or error object.
 */
export async function verifyAndEnableMFA(factorId: string, code: string) {
  const supabase = await createClient()

  // 1. Challenge
  const { data: challengeData, error: challengeError } =
    await supabase.auth.mfa.challenge({
      factorId,
    })
  if (challengeError) return { error: challengeError.message }

  // 2. Verify
  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code,
  })
  if (verifyError) return { error: verifyError.message }

  revalidatePath('/', 'layout')
  return { success: true }
}

// --- REMOVE DEVICE ---

/**
 * Unenrolls (removes) an MFA factor.
 *
 * @param factorId - The ID of the factor to remove.
 * @returns Success object or error object.
 */
export async function deleteFactor(factorId: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.mfa.unenroll({
    factorId,
  })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}

// --- EMAIL CHANGE ---

/**
 * Initiates an email change request.
 * Supabase will send a confirmation email to the new address.
 *
 * @param newEmail - The new email address.
 * @returns Success object or error object.
 */
export async function initiateEmailChange(newEmail: string) {
  const supabase = await createClient()

  // 1. Auth Check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // 2. Validate format strictly
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newEmail)) {
    return { error: 'Invalid email format' }
  }

  try {
    // 3. Update User
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    })

    if (error) {
      console.error('Email Update Error:', error.message)
      return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// --- USERNAME UPDATE ---

/**
 * Updates the user's display name (username).
 * Checks for uniqueness before updating.
 *
 * @param newUsername - The new username.
 * @returns Success object or error object.
 */
export async function updateUsername(newUsername: string) {
  const supabase = await createClient()

  // 1. Auth Check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const trimmedName = newUsername.trim()
  if (trimmedName.length === 0) {
    return { error: 'Username cannot be empty' }
  }

  try {
    // 2. Uniqueness Check (Case Insensitive)
    // Use maybeSingle() to avoid error logs when no user is found (which is the happy path here)
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .ilike('display_name', trimmedName)
      .neq('id', user.id)
      .maybeSingle()

    if (existingUser) {
      return { error: 'Username is already taken' }
    }

    // 3. Update Profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: trimmedName })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile Update Error:', updateError)
      return { error: 'Failed to update username' }
    }

    // 4. Revalidate
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Updates the user's profile visibility setting.
 *
 * @param isVisible - Boolean indicating if the profile should be visible publicly.
 * @throws Error if update fails.
 */
export async function updateProfileVisibility(isVisible: boolean) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ profile_visible: isVisible })
    .eq('id', user.id)

  if (error) {
    console.error('Profile Update Error:', error.message)
    throw new Error('Failed to update visibility settings')
  }

  revalidatePath('/settings') // Adjust path to where this setting lives
}

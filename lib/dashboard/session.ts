'use server'

import { createClient } from '@/lib/supabase/server'

async function getAuthenticatedUserId() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: 'User not authenticated' as const }
  }

  return { supabase, userId: user.id }
}

async function ensureOwnedSession(sessionId: string) {
  const auth = await getAuthenticatedUserId()

  if ('error' in auth) {
    return { error: auth.error }
  }

  const { supabase, userId } = auth
  const { data, error } = await supabase
    .from('sessions')
    .select('id, user_id, track_id')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) {
    return { error: 'Session not found' as const }
  }

  return { supabase, userId, session: data }
}

/**
 * Fetches all racing sessions for the currently authenticated user.
 * Includes related data for game, car, and track.
 *
 * @returns Object containing session data or an error message.
 */
export async function getUserSessions() {
  const auth = await getAuthenticatedUserId()

  if ('error' in auth) {
    return { error: auth.error }
  }

  const { supabase, userId } = auth
  const { data, error } = await supabase
    .from('sessions')
    .select(
      `
      *,
      game:games (*),
      car:cars (*),
      track:tracks (*)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sessions:', error)
    return { error: error.message }
  }

  return { data }
}

/**
 * Fetches a single session by ID.
 *
 * @param sessionId - The UUID of the session.
 * @returns Object containing session data or an error message.
 */
export async function getSessionById(sessionId: string) {
  const ownedSession = await ensureOwnedSession(sessionId)

  if ('error' in ownedSession) {
    return { error: ownedSession.error }
  }

  const { supabase, userId } = ownedSession
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * Fetches laps for a specific session.
 *
 * @param sessionId - The UUID of the session.
 * @returns Object containing laps data or an error message.
 */
export async function getSessionLaps(sessionId: string) {
  const ownedSession = await ensureOwnedSession(sessionId)

  if ('error' in ownedSession) {
    return { error: ownedSession.error }
  }

  const { supabase } = ownedSession
  const { data, error } = await supabase
    .from('laps')
    .select('*')
    .eq('session_id', sessionId)
    .order('lap_number', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * Deletes a specific session and its associated telemetry files from storage.
 *
 * @param sessionId - The UUID of the session to delete.
 * @returns Success object or error object.
 */
export async function deleteSession(sessionId: string) {
  const ownedSession = await ensureOwnedSession(sessionId)

  if ('error' in ownedSession) {
    return { error: ownedSession.error }
  }

  const { supabase, userId } = ownedSession

  // 1. Delete from storage
  // The folder structure is assumed to be: {user_id}/{session_id}/...
  const { data: list, error: listError } = await supabase.storage
    .from('telemetry')
    .list(`${userId}/${sessionId}`)

  if (listError) {
    console.error('Error listing files for deletion:', listError)
    // We might want to continue even if listing fails, or return error.
    // For now, let's return error to be safe.
    return { error: listError.message }
  }

  if (list && list.length > 0) {
    const filesToRemove = list.map(
      (item) => `${userId}/${sessionId}/${item.name}`
    )
    const { error: removeError } = await supabase.storage
      .from('telemetry')
      .remove(filesToRemove)

    if (removeError) {
      console.error('Error removing files:', removeError)
      return { error: removeError.message }
    }
  }

  // 2. Delete from database
  const { error: deleteError } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (deleteError) {
    console.error('Error deleting session record:', deleteError)
    return { error: deleteError.message }
  }

  return { success: true }
}

/**
 * Toggles the bookmarked status of a session.
 *
 * @param sessionId - The UUID of the session to toggle.
 * @param bookmarked - The new bookmarked status.
 * @returns Success object or error object.
 */
export async function toggleSessionBookmark(
  sessionId: string,
  bookmarked: boolean
) {
  const ownedSession = await ensureOwnedSession(sessionId)

  if ('error' in ownedSession) {
    return { error: ownedSession.error }
  }

  const { supabase, userId } = ownedSession
  const { error } = await supabase
    .from('sessions')
    .update({ bookmarked })
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error toggling bookmark:', error)
    return { error: error.message }
  }

  return { success: true }
}

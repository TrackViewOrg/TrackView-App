'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUserSessions() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()


  if (!user) {
    return { error: 'User not authenticated' }
  }

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      game:games (*),
      car:cars (*),
      track:tracks (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })


  if (error) {
    console.error('Error fetching sessions:', error)
    return { error: error.message }
  }

  return { data }
}

export async function deleteSession(sessionId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  // 1. Delete from storage
  // The folder structure is assumed to be: {user_id}/{session_id}/...
  const { data: list, error: listError } = await supabase.storage
    .from('telemetry')
    .list(`${user.id}/${sessionId}`)

  if (listError) {
    console.error('Error listing files for deletion:', listError)
    // We might want to continue even if listing fails, or return error.
    // For now, let's return error to be safe.
    return { error: listError.message }
  }

  if (list && list.length > 0) {
    const filesToRemove = list.map((x) => `${user.id}/${sessionId}/${x.name}`)
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
    .eq('user_id', user.id)

  if (deleteError) {
    console.error('Error deleting session record:', deleteError)
    return { error: deleteError.message }
  }

  return { success: true }
}

'use server'

import { createClient } from '@/lib/supabase/server'

export async function getTrackInternalName(sessionId: string) {
  const supabase = await createClient()

  // 1. Get the session to find the track_id
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('track_id')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    console.error('Error fetching session:', sessionError)
    return { error: sessionError?.message || 'Session not found' }
  }

  if (!session.track_id) {
    return { error: 'Session has no track assigned' }
  }

  // 2. Get the track to find the internal_name and sections
  const { data: track, error: trackError } = await supabase
    .from('tracks')
    .select('internal_name, sections')
    .eq('id', session.track_id)
    .single()

  if (trackError || !track) {
    console.error('Error fetching track:', trackError)
    return { error: trackError?.message || 'Track not found' }
  }

  return { internalName: track.internal_name, sections: track.sections }
}

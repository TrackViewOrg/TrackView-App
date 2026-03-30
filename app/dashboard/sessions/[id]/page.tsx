import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { SessionDetails } from '@/features/sessions/components/SessionDetails'
import { getSessionById, getSessionLaps } from '@/lib/dashboard/session'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [
    { data: session, error: sessionError },
    { data: laps, error: lapsError },
  ] = await Promise.all([getSessionById(id), getSessionLaps(id)])

  if (sessionError || !session) {
    notFound()
  }

  if (lapsError) {
    console.error('Error fetching laps:', lapsError)
    redirect('/dashboard/sessions?error=Failed to load sessions')
  }

  return <SessionDetails sessionId={id} laps={laps || []} />
}

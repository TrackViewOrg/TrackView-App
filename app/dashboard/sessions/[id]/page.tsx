import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { SessionDetails } from '@/components/sessions/SessionDetails'
import { getSessionById, getSessionLaps } from '@/lib/dashboard/session'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: session, error: sessionError } = await getSessionById(id)
  if (sessionError || !session) {
    notFound()
  }

  const { data: laps, error: lapsError } = await getSessionLaps(id)

  if (lapsError) {
    console.error('Error fetching laps:', lapsError)
    redirect('/dashboard/sessions?error=Failed to load sessions')
  }

  return <SessionDetails sessionId={id} laps={laps || []} />
}

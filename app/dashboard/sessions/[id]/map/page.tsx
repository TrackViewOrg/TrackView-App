import React from 'react'
import { getSessionLaps } from '@/lib/dashboard/session'
import MapPageClient from './MapPageClient'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: laps, error } = await getSessionLaps(id)

  if (error) {
    return <div>Error loading laps: {error}</div>
  }

  return <MapPageClient sessionId={id} laps={laps || []} />
}

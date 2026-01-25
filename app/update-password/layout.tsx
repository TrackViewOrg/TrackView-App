import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { dashRoute } from '@/lib/constants'
import React from 'react'

export default async function UpdatePasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const recoveryMode = cookieStore.get('trackview-recovery-mode')

  if (!recoveryMode) {
    redirect(dashRoute)
  }

  return <>{children}</>
}

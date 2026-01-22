'use client'
import React from 'react'
import { useSubscriptionModal } from '@/lib/hooks/subscription'

export default function Page() {
  const subscriptionModal = useSubscriptionModal()

  React.useEffect(() => {
    if (window.location.hash === '#subscription') {
      subscriptionModal.open()
    }
  }, [subscriptionModal])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-white">
      Dash
    </div>
  )
}

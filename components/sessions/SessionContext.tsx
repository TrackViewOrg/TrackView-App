'use client'

import React, { createContext, useContext, useState } from 'react'

interface SessionContextType {
  selectedLapId: string | null
  setSelectedLapId: (id: string | null) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({
  children,
  initialSelectedLapId = null,
}: {
  children: React.ReactNode
  initialSelectedLapId?: string | null
}) {
  const [selectedLapId, setSelectedLapId] = useState<string | null>(
    initialSelectedLapId
  )

  return (
    <SessionContext.Provider value={{ selectedLapId, setSelectedLapId }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

'use client'

import React, { createContext, useContext, useState } from 'react'

interface SessionContextType {
  selectedLapId: string | null
  setSelectedLapId: (id: string | null) => void
  referenceLapId: string | null
  setReferenceLapId: (id: string | null) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({
  children,
  initialSelectedLapId = null,
  initialReferenceLapId = null,
}: {
  children: React.ReactNode
  initialSelectedLapId?: string | null
  initialReferenceLapId?: string | null
}) {
  const [selectedLapId, setSelectedLapId] = useState<string | null>(
    initialSelectedLapId
  )
  const [referenceLapId, setReferenceLapId] = useState<string | null>(
    initialReferenceLapId
  )

  return (
    <SessionContext.Provider
      value={{
        selectedLapId,
        setSelectedLapId,
        referenceLapId,
        setReferenceLapId,
      }}
    >
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

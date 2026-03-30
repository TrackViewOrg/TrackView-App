'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'
import { getNextComparisonSelection } from '@/lib/sessions/comparison'

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

  const handleSelectedLapChange = useCallback(
    (id: string | null) => {
      const nextLapId = getNextComparisonSelection(id, referenceLapId)

      if (id !== null && nextLapId === null) {
        return
      }

      setSelectedLapId(nextLapId)
    },
    [referenceLapId]
  )

  const handleReferenceLapChange = useCallback(
    (id: string | null) => {
      const nextLapId = getNextComparisonSelection(id, selectedLapId)

      if (id !== null && nextLapId === null) {
        return
      }

      setReferenceLapId(nextLapId)
    },
    [selectedLapId]
  )

  return (
    <SessionContext.Provider
      value={{
        selectedLapId,
        setSelectedLapId: handleSelectedLapChange,
        referenceLapId,
        setReferenceLapId: handleReferenceLapChange,
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

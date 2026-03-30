'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { useSession } from '@/features/sessions/components/SessionContext'
import { useUser } from '@/components/providers/user-provider'
import { createClient } from '@/lib/supabase/client'
import { Lap } from '@/features/sessions/components/LapTable'
import { TelemetryDataPoint } from '@/types/telemetry'
import {
  findClosestTelemetryPointByNormalizedDistance,
  parseTelemetryPayload,
} from '@/lib/telemetry/normalize'

interface AdvancedViewContextType {
  lapData: TelemetryDataPoint[] | null
  referenceLapData: TelemetryDataPoint[] | null
  isLoading: boolean
  error: string | null
  currentFrameIndex: number
  setCurrentFrameIndex: (index: number) => void
  currentDataPoint: TelemetryDataPoint | null
  currentReferenceDataPoint: TelemetryDataPoint | null
  isPlaying: boolean
  setIsPlaying: (isPlaying: boolean) => void
  hz: number
}

const AdvancedViewContext = createContext<AdvancedViewContextType | undefined>(
  undefined
)

type BrowserSupabaseClient = SupabaseClient

async function fetchLapTelemetry({
  lapId,
  laps,
  sessionId,
  userId,
  supabase,
}: {
  lapId: string
  laps: Lap[]
  sessionId: string
  userId: string
  supabase: BrowserSupabaseClient
}): Promise<TelemetryDataPoint[]> {
  const lap = laps.find((item) => item.id === lapId)

  if (!lap) {
    throw new Error('Lap not found')
  }

  const filePath = `${userId}/${sessionId}/${lap.lap_number}.json`
  const { data, error } = await supabase.storage
    .from('telemetry')
    .download(filePath)

  if (error) {
    throw new Error(`Failed to download telemetry for lap ${lap.lap_number}`)
  }

  const payload = JSON.parse(await data.text()) as unknown
  return parseTelemetryPayload(payload)
}

function calculatePlaybackHz(points: TelemetryDataPoint[] | null): number {
  if (!points || points.length <= 1) {
    return 1
  }

  const endIndex = Math.min(points.length - 1, 50)
  const duration = points[endIndex].time - points[0].time
  const frames = endIndex

  return duration > 0 && frames > 0 ? frames / duration : 10
}

export function AdvancedViewProvider({
  children,
  sessionId,
  laps,
}: {
  children: React.ReactNode
  sessionId: string
  laps: Lap[]
}) {
  const { selectedLapId, referenceLapId } = useSession()
  const { user } = useUser()
  const [lapData, setLapData] = useState<TelemetryDataPoint[] | null>(null)
  const [referenceLapData, setReferenceLapData] = useState<
    TelemetryDataPoint[] | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hz, setHz] = useState(0)

  const animationFrameRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number>(0)

  useEffect(() => {
    let ignore = false

    async function loadData() {
      if (!user) return

      setIsLoading(true)
      setError(null)
      setCurrentFrameIndex(0)
      setIsPlaying(false)
      setHz(0)
      const supabase = createClient()

      try {
        const mainLapPromise: Promise<TelemetryDataPoint[] | null> =
          selectedLapId
            ? fetchLapTelemetry({
                lapId: selectedLapId,
                laps,
                sessionId,
                userId: user.id,
                supabase,
              })
            : Promise.resolve(null)

        const referenceLapPromise: Promise<TelemetryDataPoint[] | null> =
          referenceLapId && referenceLapId !== selectedLapId
            ? fetchLapTelemetry({
                lapId: referenceLapId,
                laps,
                sessionId,
                userId: user.id,
                supabase,
              })
            : mainLapPromise

        const [mainData, referenceData] = await Promise.all([
          mainLapPromise,
          referenceLapPromise,
        ])

        if (ignore) {
          return
        }

        setLapData(mainData)
        setReferenceLapData(referenceLapId ? referenceData : null)
        setHz(calculatePlaybackHz(mainData))
      } catch (err: unknown) {
        console.error('Error fetching telemetry:', err)

        if (ignore) {
          return
        }

        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('An unknown error occurred')
        }
        setLapData(null)
        setReferenceLapData(null)
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      ignore = true
    }
  }, [selectedLapId, referenceLapId, user, sessionId, laps])

  // Playback logic
  useEffect(() => {
    lastFrameTimeRef.current = 0

    if (!isPlaying || !lapData || lapData.length === 0 || hz === 0) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    const interval = 1000 / hz

    const animate = (time: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = time
      }

      const delta = time - lastFrameTimeRef.current

      if (delta >= interval) {
        const framesToAdvance = Math.floor(delta / interval)

        if (framesToAdvance > 0) {
          setCurrentFrameIndex((prev) => {
            const next = prev + framesToAdvance
            if (next >= lapData.length - 1) {
              setIsPlaying(false)
              return lapData.length - 1
            }
            return next
          })
          lastFrameTimeRef.current = time - (delta % interval)
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, lapData, hz])

  const currentDataPoint = useMemo(
    () => (lapData ? (lapData[currentFrameIndex] ?? null) : null),
    [currentFrameIndex, lapData]
  )

  const currentReferenceDataPoint = useMemo(() => {
    if (!referenceLapData || !currentDataPoint) {
      return null
    }

    return findClosestTelemetryPointByNormalizedDistance(
      referenceLapData,
      currentDataPoint.norm_dist
    )
  }, [currentDataPoint, referenceLapData])

  return (
    <AdvancedViewContext.Provider
      value={{
        lapData,
        referenceLapData,
        isLoading,
        error,
        currentFrameIndex,
        setCurrentFrameIndex,
        currentDataPoint,
        currentReferenceDataPoint,
        isPlaying,
        setIsPlaying,
        hz,
      }}
    >
      {children}
    </AdvancedViewContext.Provider>
  )
}

export function useAdvancedView() {
  const context = useContext(AdvancedViewContext)
  if (context === undefined) {
    throw new Error(
      'useAdvancedView must be used within an AdvancedViewProvider'
    )
  }
  return context
}

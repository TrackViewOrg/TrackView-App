'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useSession } from '@/features/sessions/components/SessionContext'
import { useUser } from '@/components/providers/user-provider'
import { createClient } from '@/lib/supabase/client'
import { Lap } from '@/features/sessions/components/LapTable'
import { TelemetryDataPoint } from '@/types/telemetry'

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
  const [referenceLapData, setReferenceLapData] = useState<TelemetryDataPoint[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hz, setHz] = useState(0)

  const animationFrameRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number>(0)

  // Helper to fetch data for a single lap
  const fetchLapTelemetry = async (lapId: string, supabase: any, userId: string): Promise<TelemetryDataPoint[]> => {
      const lap = laps.find((l) => l.id === lapId)
      if (!lap) throw new Error('Lap not found')

      const filePath = `${userId}/${sessionId}/${lap.lap_number}.json`
      const { data, error } = await supabase.storage
          .from('telemetry')
          .download(filePath)

      if (error) throw error

      const text = await data.text()
      const json = JSON.parse(text)
      
      let allPoints: TelemetryDataPoint[] = []

      const convertSoAToAoS = (soa: any): TelemetryDataPoint[] => {
          const length = soa.time?.length || 0
          const points: TelemetryDataPoint[] = []
          for (let i = 0; i < length; i++) {
            points.push({
              time: Number(soa.time?.[i] ?? 0),
              x: Number(soa.x?.[i] ?? 0),
              y: Number(soa.y?.[i] ?? 0),
              speed: Number(soa.speed?.[i] ?? 0),
              throttle: Number(soa.throttle?.[i] ?? 0),
              brake: Number(soa.brake?.[i] ?? 0),
              gear: Number(soa.gear?.[i] ?? 0),
              steer: Number(soa.steer?.[i] ?? 0),
              norm_dist: Number(soa.norm_dist?.[i] ?? 0),
            })
          }
          return points
      }

      if (Array.isArray(json.time)) {
          allPoints = convertSoAToAoS(json)
      } else {
          const keys = Object.keys(json).sort((a, b) => {
            const numA = parseInt(a)
            const numB = parseInt(b)
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB
            return a.localeCompare(b)
          })
          for (const key of keys) {
            const sectionData = json[key]
            if (sectionData && Array.isArray(sectionData.time)) {
              allPoints = allPoints.concat(convertSoAToAoS(sectionData))
            }
          }
      }

      if (allPoints.length > 0) {
          allPoints.sort((a, b) => a.time - b.time)
      }
      
      return allPoints
  }

  useEffect(() => {
    async function loadData() {
      if (!user) return

      setIsLoading(true)
      setError(null)
      // Reset state when laps change
      setCurrentFrameIndex(0)
      setIsPlaying(false)
      setHz(0)
      
      const supabase = createClient()

      try {
        // Fetch Selected Lap
        let mainData: TelemetryDataPoint[] | null = null
        if (selectedLapId) {
            mainData = await fetchLapTelemetry(selectedLapId, supabase, user.id)
        }
        setLapData(mainData)

        // Fetch Reference Lap
        let refData: TelemetryDataPoint[] | null = null
        if (referenceLapId) {
            // If reference is same as selected, just use the same data to save a fetch
            if (referenceLapId === selectedLapId && mainData) {
                refData = mainData
            } else {
                refData = await fetchLapTelemetry(referenceLapId, supabase, user.id)
            }
        }
        setReferenceLapData(refData)

        // Calculate Hz from main data
        if (mainData && mainData.length > 1) {
          const startIndex = 0
          const endIndex = Math.min(mainData.length - 1, 50)
          const startTime = mainData[startIndex].time
          const endTime = mainData[endIndex].time
          const duration = endTime - startTime
          const frames = endIndex - startIndex

          if (duration > 0 && frames > 0) {
            setHz(frames / duration)
          } else {
            setHz(10)
          }
        } else {
            setHz(1)
        }

      } catch (err: unknown) {
        console.error('Error fetching telemetry:', err)
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('An unknown error occurred')
        }
        setLapData(null)
        setReferenceLapData(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
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

  const currentDataPoint = lapData ? lapData[currentFrameIndex] || null : null
  
  // For reference data, we need to find the point at the same distance or time?
  // Usually distance is better for comparison, but time is easier if Hz is same.
  // Let's assume we compare by index for now if Hz is similar, or by time/distance if we want to be fancy.
  // Given the slider is based on index of main lap, let's try to map index.
  // If lengths differ, index mapping is bad.
  // Let's map by Distance (norm_dist) if available, or Time.
  // Since we have norm_dist (0-1), that's perfect for comparison!
  
  let currentReferenceDataPoint: TelemetryDataPoint | null = null
  if (referenceLapData && currentDataPoint) {
      // Find point in reference lap with closest norm_dist
      // This is a simple search, could be optimized
      // Since data is sorted by time, it's likely sorted by distance too.
      // We can use a binary search or just find.
      // For performance, maybe just index if we assume similar sampling.
      // But norm_dist is safer.
      
      // Optimization: Start search from previous index?
      // For now, let's just find closest.
      
      // Actually, finding by index is fastest but inaccurate if laps differ in length/speed.
      // Finding by norm_dist is best.
      
      const targetDist = currentDataPoint.norm_dist
      // Simple linear search for now, or find closest
      // Assuming sorted by dist roughly
      
      // Let's just use a simple find for now.
      // Optimization: We can memoize or use a pointer if performance is bad.
      
      // Let's try to find the index that has the closest norm_dist
      // We can assume the array is large, so maybe just map index proportional to length?
      // refIndex = (currentIndex / mainLength) * refLength
      
      if (referenceLapData.length > 0) {
          const ratio = currentFrameIndex / (lapData!.length - 1)
          const refIndex = Math.min(
              Math.floor(ratio * (referenceLapData.length - 1)), 
              referenceLapData.length - 1
          )
          currentReferenceDataPoint = referenceLapData[refIndex]
      }
  }

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

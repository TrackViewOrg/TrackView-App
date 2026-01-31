'use client'

import React from 'react'
import { formatLapTime } from '@/components/sessions/utils'
import { useSession } from '@/components/sessions/SessionContext'
import { cn } from '@/lib/utils'
import { HourglassIcon, Pin } from 'lucide-react' // Assuming you have lucide-react installed

export interface Lap {
  id: string
  session_id: string
  lap_number: number
  lap_time: number
  telemetry_path: string
  is_valid: boolean
  created_at: string
  sections: Record<string, string>
}

interface LapTableProps {
  laps: Lap[]
}

export function LapTable({ laps }: LapTableProps) {
  const { selectedLapId, setSelectedLapId, referenceLapId } = useSession()

  const referenceLap = laps.find((l) => l.id === referenceLapId)

  // Calculate fastest lap once
  const fastestLap = React.useMemo(() => {
    return laps.reduce((prev, current) => {
      return prev.lap_time < current.lap_time ? prev : current
    }, laps[0])
  }, [laps])

  return (
    <div className="bg-background flex h-full w-170 flex-col border-r">
      {/* Header */}
      <div className="text-muted-foreground bg-muted flex w-full border-b px-5 py-2 text-xs font-medium tracking-wider uppercase select-none">
        <span className="w-16">Lap</span>
        <span className="w-32">Time</span>
        <span className="flex-1 text-right">Delta</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {laps.map((lap) => {
          const isSelected = lap.id === selectedLapId
          const isFastest = lap.id === fastestLap?.id
          const isReference = lap.id === referenceLapId

          let delta = 0
          if (referenceLap) {
            delta = lap.lap_time - referenceLap.lap_time
          }

          return (
            <div
              key={lap.lap_number}
              onClick={() => setSelectedLapId(lap.id)}
              className={cn(
                'group flex w-full cursor-pointer items-center border-b border-l-4 px-4 py-2 text-sm transition-colors duration-200 select-none',
                // Base Borders
                'border-b-border/50 border-l-transparent',

                // 1. SELECTION (Background Focus)
                isSelected
                  ? 'bg-muted border-l-primary'
                  : 'hover:bg-muted/50 text-muted-foreground',

                // 2. REFERENCE (Visual Anchor)
                // If it's reference but NOT selected, give it a subtle tint or border hint
                isReference && !isSelected && 'bg-muted border-l-[#dff976]'
              )}
            >
              {/* Column 1: Lap Number & Status Icons */}
              <div className="flex w-16 items-center gap-2">
                <span
                  className={cn(
                    'font-mono',
                    isSelected ? 'text-foreground' : ''
                  )}
                >
                  {lap.lap_number}
                </span>
                {/* Icons provide clarity without relying on color alone */}
                {isReference && (
                  <Pin size={12} className="fill-lime-500/20 text-lime-500" />
                )}
              </div>

              {/* Column 2: Time & Fastest Indicator */}
              <div className="flex w-32 items-center gap-2">
                <span
                  className={cn(
                    'font-mono',
                    isFastest
                      ? 'text-purple-500'
                      : isSelected
                        ? 'text-foreground'
                        : ''
                  )}
                >
                  {formatLapTime(lap.lap_time)}
                </span>
                {isFastest && (
                  <HourglassIcon size={12} className="text-purple-500" />
                )}
              </div>

              {/* Column 3: Delta */}
              <div className="flex-1 pr-1 text-right">
                <span
                  className={cn(
                    'text-md font-mono',
                    // Only color the delta if it's NOT the reference lap
                    !isReference && delta > 0 && 'text-red-500',
                    !isReference && delta < 0 && 'text-green-500',
                    isReference && 'text-muted-foreground font-medium' // Reference gets its own distinct color
                  )}
                >
                  {referenceLap
                    ? delta === 0
                      ? 'REFERENCE' // Explicitly say REF instead of ---
                      : (delta > 0 ? '+' : '') + delta.toFixed(3)
                    : '-'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import { formatLapTime } from '@/components/sessions/utils'
import { useSession } from '@/components/sessions/SessionContext'
import { cn } from '@/lib/utils'

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
  const { selectedLapId, setSelectedLapId } = useSession()

  const selectedLap = laps.find((l) => l.id === selectedLapId)
  const fastestLap = laps.reduce((prev, current) => {
    return prev.lap_time < current.lap_time ? prev : current
  }, laps[0])

  return (
    <div className={'flex h-full w-full flex-col border-r p-1'}>
      <div
        className={
          'border-border/60 bg-primary-foreground/60 text-muted-foreground/40 flex w-full rounded-t-sm border px-5 py-1 text-sm select-none'
        }
      >
        <span className="w-20">#</span>
        <span className="w-60">Time</span>
        <span className="w-60 pl-0.5">Δ</span>
      </div>
      {laps.map((lap) => {
        const isSelected = lap.id === selectedLapId
        const isFastest = lap.id === fastestLap?.id
        
        let delta = 0
        if (selectedLap) {
          delta = lap.lap_time - selectedLap.lap_time
        }

        return (
          <div
            key={lap.lap_number}
            onClick={() => setSelectedLapId(lap.id)}
            className={cn(
              'border-border/60 bg-primary-foreground/70 text-muted-foreground hover:bg-primary-foreground text-[14px] flex w-full cursor-pointer border-x border-b px-5 py-1.5 transition-all duration-200 select-none',
              isSelected && 'bg-accent/60'
            )}
          >
            <span className="w-20 ">{lap.lap_number}</span>
            <span
              className={cn('w-60 ', isFastest && 'text-purple-500')}
            >
              {formatLapTime(lap.lap_time)}
            </span>
            <span
              className={cn(
                'w-60 pl-0.5 text-muted-foreground/50',
                delta > 0
                  ? 'text-red-500'
                  : delta < 0
                    ? 'text-green-500'
                    : ''
              )}
            >
              {selectedLap
                ? delta === 0
                  ? '---'
                  : (delta > 0 ? '+' : '') + delta.toFixed(3)
                : '-'}
            </span>
          </div>
        )
      })}
      <div
        className={
          'border-border/60 bg-primary-foreground/60 text-muted-foreground/40 flex w-full justify-center rounded-b-sm border border-t-transparent px-5 py-0.5 text-xs select-none'
        }
      >
        <span>{laps.length} Laps Recorded</span>
      </div>
    </div>
  )
}

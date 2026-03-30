'use client'

import React from 'react'
import {
  AdvancedViewProvider,
  useAdvancedView,
} from '@/components/sessions/AdvancedViewContext'
import {
  SessionProvider,
  useSession,
} from '@/features/sessions/components/SessionContext'
import { Lap } from '@/features/sessions/components/LapTable'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Pause, Play } from 'lucide-react'
import ComparisonLapSelector from '@/features/sessions/components/ComparisonLapSelector'
import { SegmentedBar } from '@/components/ui/segmented-bar'
import { motion } from 'framer-motion'
import { TelemetryDataPoint } from '@/types/telemetry'
import { useSearchParams } from 'next/navigation'
import { getInitialComparisonLapIds } from '@/lib/sessions/comparison'

function TopBar({ laps }: { laps: Lap[] }) {
  const { selectedLapId, setSelectedLapId, referenceLapId, setReferenceLapId } =
    useSession()

  return (
    <div className="bg-muted flex w-full justify-between gap-1.5 border-b p-1">
      <SegmentedBar>
        <div>
          <h1 className={'text-muted-foreground select-none'}>Spa</h1>
        </div>
        <div>
          <h1 className={'text-muted-foreground select-none'}>
            Vcr Alpha 2025
          </h1>
        </div>
        <div>
          <h1 className={'text-muted-foreground select-none'}>2 weeks ago</h1>
        </div>
      </SegmentedBar>

      <SegmentedBar>
        <div className="p-0">
          <ComparisonLapSelector
            laps={laps}
            selectedLapId={selectedLapId}
            onSelectLap={setSelectedLapId}
            label="Comp"
            excludedLapId={referenceLapId}
          />
        </div>

        <div className="p-0">
          <ComparisonLapSelector
            laps={laps}
            selectedLapId={referenceLapId}
            onSelectLap={setReferenceLapId}
            label="REF"
            excludedLapId={selectedLapId}
          />
        </div>
      </SegmentedBar>
    </div>
  )
}

function Dash({
  data,
  hz,
  title,
}: {
  data: TelemetryDataPoint
  hz: number
  title: string
}) {
  const animationDuration = hz > 0 ? 1 / hz : 0

  return (
    <div className="flex w-full flex-col gap-2 border-4 border-gray-800 bg-black p-2">
      <div className="border-b border-gray-800 pb-1 text-center font-mono text-xs text-gray-500 uppercase">
        {title}
      </div>

      {/* Top: RPM/Shift Lights Bar */}
      <div className="flex h-6 w-full gap-0.5 bg-gray-900">
        {Array.from({ length: 20 }).map((_, i) => {
          const active = (data.speed / 320) * 20 > i
          let color = 'bg-green-500'
          if (i > 10) color = 'bg-red-500'
          if (i > 16) color = 'bg-blue-500'

          return (
            <div
              key={i}
              className={`flex-1 ${active ? color : 'bg-gray-800'}`}
            />
          )
        })}
      </div>

      <div className="flex h-48 w-full gap-2">
        {/* Left Column: Pedals */}
        <div className="flex w-1/3 flex-col gap-2">
          {/* Throttle */}
          <div className="flex flex-1 flex-col justify-center bg-gray-900 p-2">
            <span className="mb-1 font-mono text-[10px] text-gray-400 uppercase">
              Thr
            </span>
            <div className="relative h-full w-full bg-gray-800">
              <motion.div
                className="absolute top-0 left-0 h-full bg-green-500"
                animate={{ width: `${data.throttle * 100}%` }}
                transition={{ duration: animationDuration, ease: 'linear' }}
              />
            </div>
            <span className="mt-1 text-right font-mono text-lg text-green-500">
              {(data.throttle * 100).toFixed(0)}%
            </span>
          </div>

          {/* Brake */}
          <div className="flex flex-1 flex-col justify-center bg-gray-900 p-2">
            <span className="mb-1 font-mono text-[10px] text-gray-400 uppercase">
              Brk
            </span>
            <div className="relative h-full w-full bg-gray-800">
              <motion.div
                className="absolute top-0 left-0 h-full bg-red-500"
                animate={{ width: `${data.brake * 100}%` }}
                transition={{ duration: animationDuration, ease: 'linear' }}
              />
            </div>
            <span className="mt-1 text-right font-mono text-lg text-red-500">
              {(data.brake * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Center Column: Gear & Speed */}
        <div className="relative flex w-1/3 flex-col items-center justify-center bg-gray-900">
          <span className="absolute top-2 font-mono text-xs text-gray-500">
            GEAR
          </span>
          <div className="font-mono text-8xl leading-none font-bold text-yellow-400">
            {data.gear === 0 ? 'N' : data.gear}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-4xl font-bold text-white">
              {data.speed?.toFixed(0)}
            </span>
            <span className="font-mono text-xs text-gray-400">KM/H</span>
          </div>
        </div>

        {/* Right Column: Steering & Info */}
        <div className="flex w-1/3 flex-col gap-2">
          {/* Steering */}
          <div className="flex flex-1 flex-col justify-center bg-gray-900 p-2">
            <span className="mb-1 font-mono text-[10px] text-gray-400 uppercase">
              Steer
            </span>
            <div className="relative flex h-full w-full items-center justify-center bg-gray-800">
              {/* Circular Steering Wheel */}
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-gray-700">
                {/* Wheel Rim */}
                <motion.div
                  className="absolute h-full w-full rounded-full border-4 border-blue-500"
                  style={{
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent',
                    borderLeftColor: 'transparent',
                  }} // Just a visual style
                  animate={{ rotate: data.steer * 90 }} // Rotate based on steer value (-1 to 1 -> -90 to 90 deg)
                  transition={{ duration: animationDuration, ease: 'linear' }}
                >
                  {/* Top Marker */}
                  <div className="absolute top-0 left-1/2 h-3 w-1 -translate-x-1/2 bg-yellow-400" />
                </motion.div>

                {/* Center Hub */}
                <div className="z-10 h-4 w-4 rounded-full bg-gray-600" />
              </div>
            </div>
            <span className="mt-1 text-right font-mono text-lg text-blue-400">
              {data.steer?.toFixed(2)}
            </span>
          </div>

          {/* Time */}
          <div className="flex flex-1 flex-col justify-center bg-gray-900 p-2">
            <span className="mb-1 font-mono text-[10px] text-gray-400 uppercase">
              Time
            </span>
            <span className="font-mono text-2xl text-white">
              {data.time?.toFixed(3)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TelemetryViewer() {
  const {
    lapData,
    isLoading,
    error,
    currentFrameIndex,
    setCurrentFrameIndex,
    currentDataPoint,
    currentReferenceDataPoint,
    isPlaying,
    setIsPlaying,
    hz,
  } = useAdvancedView()

  if (isLoading) {
    return <div className="p-4">Loading lap data...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">Error loading lap data: {error}</div>
    )
  }

  if (!lapData || lapData.length === 0) {
    return <div className="p-4">Select a lap to view data</div>
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Timeline</h2>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">
              {hz > 0 ? `${hz.toFixed(2)} Hz` : 'Calculating Hz...'}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlay}
              className="h-8 w-8"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Slider
          value={[currentFrameIndex]}
          min={0}
          max={lapData.length - 1}
          step={1}
          onValueChange={(vals) => {
            setCurrentFrameIndex(vals[0])
          }}
          className="w-full"
        />
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>0%</span>
          <span>
            Frame: {currentFrameIndex} / {lapData.length - 1}
          </span>
          <span>100%</span>
        </div>
      </div>

      <div className="flex w-full gap-4 overflow-x-auto">
        {currentDataPoint && (
          <div className="min-w-[400px] flex-1">
            <Dash data={currentDataPoint} hz={hz} title="Main Lap" />
          </div>
        )}

        {currentReferenceDataPoint && (
          <div className="min-w-[400px] flex-1">
            <Dash
              data={currentReferenceDataPoint}
              hz={hz}
              title="Reference Lap"
            />
          </div>
        )}
      </div>

      {/* Data Grid Below - Showing Main Lap Data for now, or maybe Delta? */}
      {currentDataPoint && (
        <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          <DataCard label="X" value={currentDataPoint.x?.toFixed(2)} />
          <DataCard label="Y" value={currentDataPoint.y?.toFixed(2)} />
          <DataCard
            label="Norm Dist"
            value={currentDataPoint.norm_dist?.toFixed(4)}
          />
        </div>
      )}
    </div>
  )
}

function DataCard({
  label,
  value,
  unit,
}: {
  label: string
  value: string | number | undefined
  unit?: string
}) {
  return (
    <div className="bg-muted border-border/50 flex flex-col items-center justify-center gap-1 rounded-md border p-3">
      <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
        {label}
      </span>
      <span className="font-mono text-lg font-bold">
        {value ?? '-'}
        {unit && (
          <span className="text-muted-foreground ml-1 text-sm font-normal">
            {unit}
          </span>
        )}
      </span>
    </div>
  )
}

export default function MapPageClient({
  sessionId,
  laps,
}: {
  sessionId: string
  laps: Lap[]
}) {
  // Try to get initial state from URL search params if available
  const searchParams = useSearchParams()
  const lapIdParam = searchParams.get('lapId')
  const refLapIdParam = searchParams.get('refLapId')

  const {
    selectedLapId: initialSelectedLapId,
    referenceLapId: initialReferenceLapId,
  } = getInitialComparisonLapIds(laps, lapIdParam, refLapIdParam)

  return (
    <SessionProvider
      initialSelectedLapId={initialSelectedLapId}
      initialReferenceLapId={initialReferenceLapId}
    >
      <AdvancedViewProvider sessionId={sessionId} laps={laps}>
        <div className={'flex h-full w-full flex-col'}>
          <TopBar laps={laps} />
          <div className={'flex-1 overflow-hidden'}>
            <TelemetryViewer />
          </div>
        </div>
      </AdvancedViewProvider>
    </SessionProvider>
  )
}

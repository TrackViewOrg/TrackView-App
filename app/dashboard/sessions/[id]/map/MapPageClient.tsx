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

function TopBar({ laps }: { laps: Lap[] }) {
  const { selectedLapId, setSelectedLapId, referenceLapId, setReferenceLapId } = useSession()

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
          />
        </div>

        <div className="p-0">
          <ComparisonLapSelector
            laps={laps}
            selectedLapId={referenceLapId}
            onSelectLap={setReferenceLapId}
            label="REF"
          />
        </div>
      </SegmentedBar>
    </div>
  )
}

function Dash({ data, hz, title }: { data: TelemetryDataPoint, hz: number, title: string }) {
    const animationDuration = hz > 0 ? 1 / hz : 0

    return (
        <div className="flex flex-col w-full bg-black border-4 border-gray-800 p-2 gap-2">
             <div className="text-gray-500 text-xs font-mono uppercase text-center border-b border-gray-800 pb-1">{title}</div>
             
             {/* Top: RPM/Shift Lights Bar */}
             <div className="w-full h-6 bg-gray-900 flex gap-0.5">
                {Array.from({ length: 20 }).map((_, i) => {
                    const active = (data.speed / 320) * 20 > i;
                    let color = 'bg-green-500';
                    if (i > 10) color = 'bg-red-500';
                    if (i > 16) color = 'bg-blue-500';
                    
                    return (
                        <div 
                            key={i} 
                            className={`flex-1 ${active ? color : 'bg-gray-800'}`}
                        />
                    )
                })}
             </div>

             <div className="flex w-full h-48 gap-2">
                {/* Left Column: Pedals */}
                <div className="flex flex-col w-1/3 gap-2">
                    {/* Throttle */}
                    <div className="flex flex-col flex-1 bg-gray-900 p-2 justify-center">
                        <span className="text-gray-400 text-[10px] font-mono uppercase mb-1">Thr</span>
                        <div className="w-full h-full bg-gray-800 relative">
                             <motion.div 
                                className="absolute top-0 left-0 h-full bg-green-500"
                                animate={{ width: `${data.throttle * 100}%` }}
                                transition={{ duration: animationDuration, ease: "linear" }}
                            />
                        </div>
                        <span className="text-green-500 font-mono text-lg mt-1 text-right">
                            {(data.throttle * 100).toFixed(0)}%
                        </span>
                    </div>
                    
                    {/* Brake */}
                    <div className="flex flex-col flex-1 bg-gray-900 p-2 justify-center">
                        <span className="text-gray-400 text-[10px] font-mono uppercase mb-1">Brk</span>
                        <div className="w-full h-full bg-gray-800 relative">
                             <motion.div 
                                className="absolute top-0 left-0 h-full bg-red-500"
                                animate={{ width: `${data.brake * 100}%` }}
                                transition={{ duration: animationDuration, ease: "linear" }}
                            />
                        </div>
                        <span className="text-red-500 font-mono text-lg mt-1 text-right">
                            {(data.brake * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>

                {/* Center Column: Gear & Speed */}
                <div className="flex flex-col w-1/3 bg-gray-900 items-center justify-center relative">
                    <span className="text-gray-500 text-xs font-mono absolute top-2">GEAR</span>
                    <div className="text-8xl font-bold text-yellow-400 font-mono leading-none">
                        {data.gear === 0 ? 'N' : data.gear}
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl font-bold text-white font-mono">
                            {data.speed?.toFixed(0)}
                        </span>
                        <span className="text-gray-400 font-mono text-xs">KM/H</span>
                    </div>
                </div>

                {/* Right Column: Steering & Info */}
                <div className="flex flex-col w-1/3 gap-2">
                     {/* Steering */}
                    <div className="flex flex-col flex-1 bg-gray-900 p-2 justify-center">
                        <span className="text-gray-400 text-[10px] font-mono uppercase mb-1">Steer</span>
                        <div className="w-full h-full bg-gray-800 relative flex justify-center items-center">
                             {/* Circular Steering Wheel */}
                             <div className="w-24 h-24 rounded-full border-4 border-gray-700 relative flex items-center justify-center">
                                 {/* Wheel Rim */}
                                 <motion.div 
                                    className="w-full h-full rounded-full border-4 border-blue-500 absolute"
                                    style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }} // Just a visual style
                                    animate={{ rotate: data.steer * 90 }} // Rotate based on steer value (-1 to 1 -> -90 to 90 deg)
                                    transition={{ duration: animationDuration, ease: "linear" }}
                                 >
                                     {/* Top Marker */}
                                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3 bg-yellow-400" />
                                 </motion.div>
                                 
                                 {/* Center Hub */}
                                 <div className="w-4 h-4 bg-gray-600 rounded-full z-10" />
                             </div>
                        </div>
                        <span className="text-blue-400 font-mono text-lg mt-1 text-right">
                            {data.steer?.toFixed(2)}
                        </span>
                    </div>

                    {/* Time */}
                    <div className="flex flex-col flex-1 bg-gray-900 p-2 justify-center">
                         <span className="text-gray-400 text-[10px] font-mono uppercase mb-1">Time</span>
                         <span className="text-white font-mono text-2xl">
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
    <div className="flex flex-col w-full h-full p-4 gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Timeline</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
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
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>
            Frame: {currentFrameIndex} / {lapData.length - 1}
          </span>
          <span>100%</span>
        </div>
      </div>

      <div className="flex w-full gap-4 overflow-x-auto">
          {currentDataPoint && (
              <div className="flex-1 min-w-[400px]">
                  <Dash data={currentDataPoint} hz={hz} title="Main Lap" />
              </div>
          )}
          
          {currentReferenceDataPoint && (
              <div className="flex-1 min-w-[400px]">
                  <Dash data={currentReferenceDataPoint} hz={hz} title="Reference Lap" />
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
    <div className="bg-muted p-3 rounded-md flex flex-col items-center justify-center gap-1 border border-border/50">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-lg font-bold font-mono">
        {value ?? '-'}
        {unit && (
          <span className="text-sm font-normal text-muted-foreground ml-1">
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

  const initialSelectedLapId = lapIdParam || (laps.length > 0 ? laps[0].id : null)
  const initialReferenceLapId = refLapIdParam || (laps.length > 0 ? laps[0].id : null)

  return (
    <SessionProvider initialSelectedLapId={initialSelectedLapId} initialReferenceLapId={initialReferenceLapId}>
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

'use client'

import React, { useState } from 'react'
import {
  Activity,
  ChevronRight,
  Map as MapIcon,
  Timer,
  TrendingDown,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// --- MOCK DATA ---
// Using 0-100 scale for easy percentage conversion
const TRACK_SECTIONS = [
  { id: 's1', name: 'La Source', x: 25, y: 75, align: 'left' },
  { id: 's2', name: 'Eau Rouge', x: 35, y: 60, align: 'right' },
  { id: 's3', name: 'Les Combes', x: 45, y: 30, align: 'left' },
  { id: 's4', name: 'Rivage', x: 60, y: 20, align: 'right' },
  { id: 's5', name: 'Bruxelles', x: 75, y: 25, align: 'right' },
  { id: 's6', name: 'Pouhon', x: 60, y: 55, align: 'left' },
  { id: 's7', name: 'Fagnes', x: 45, y: 68, align: 'left' },
  { id: 's8', name: 'Bus Stop', x: 20, y: 85, align: 'right' },
]

const LAPS_DATA = Array.from({ length: 15 }).map((_, i) => {
  const baseTime = 104.5
  const variance = Math.random() * 2 - 0.5
  const time = baseTime + variance

  return {
    id: i + 1,
    lap_time: time,
    valid: Math.random() > 0.1,
    sectors: {
      s1: Math.random() * 0.5 - 0.25,
      s2: Math.random() * 0.5 - 0.25,
      s3: Math.random() * 0.5 - 0.25,
      s4: Math.random() * 0.5 - 0.25,
      s5: Math.random() * 0.5 - 0.25,
      s6: Math.random() * 0.5 - 0.25,
      s7: Math.random() * 0.5 - 0.25,
      s8: Math.random() * 0.5 - 0.25,
    },
  }
})

// --- UTILS ---
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(3)
  return `${m}:${s.padStart(6, '0')}`
}

const formatDelta = (val: number) => {
  const sign = val > 0 ? '+' : ''
  return `${sign}${val.toFixed(3)}`
}

// --- COMPONENTS ---

export default function TelemetryPage() {
  const [selectedLapId, setSelectedLapId] = useState<number>(
    LAPS_DATA[LAPS_DATA.length - 1].id
  )
  const [referenceLapId] = useState<number>(
    LAPS_DATA.reduce((prev, curr) =>
      curr.lap_time < prev.lap_time ? curr : prev
    ).id
  )

  const selectedLap = LAPS_DATA.find((l) => l.id === selectedLapId)!
  const referenceLap = LAPS_DATA.find((l) => l.id === referenceLapId)!
  const totalDelta = selectedLap.lap_time - referenceLap.lap_time

  return (
    <div className="bg-background text-foreground flex h-full w-full flex-col overflow-hidden font-sans">
      {/* 1. HEADER */}
      <header className="border-border bg-muted/20 flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="text-primary h-5 w-5" />
            <span className="font-bold tracking-tight">RACE.OS</span>
          </div>
          <div className="bg-border mx-2 h-4 w-[1px]" />
          <div className="text-muted-foreground flex gap-4 font-mono text-xs tracking-widest uppercase">
            <span>Spa-Francorchamps</span>
            <span>•</span>
            <span>Dry / 24°C</span>
            <span>•</span>
            <span className="text-foreground font-bold">Session 4</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary border-primary/20 flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-medium">
            <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
            LIVE DATA
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT */}
      <div className="grid flex-1 grid-cols-12 overflow-hidden">
        {/* SIDEBAR: Lap List (Col 3) */}
        <aside className="border-border bg-muted/10 col-span-3 flex h-full flex-col overflow-hidden border-r">
          <div className="border-border shrink-0 border-b p-4">
            <h2 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
              Lap History
            </h2>
            <div className="text-muted-foreground flex gap-2 px-2 font-mono text-[10px]">
              <span className="w-8">#</span>
              <span className="flex-1">TIME</span>
              <span className="w-16 text-right">DELTA</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {LAPS_DATA.map((lap) => {
              const isSelected = lap.id === selectedLapId
              const isRef = lap.id === referenceLapId
              const delta = lap.lap_time - referenceLap.lap_time

              return (
                <div
                  key={lap.id}
                  onClick={() => setSelectedLapId(lap.id)}
                  className={cn(
                    'group hover:bg-muted/50 flex cursor-pointer items-center gap-2 border-l-2 px-6 py-2.5 font-mono text-sm transition-all',
                    isSelected
                      ? 'bg-muted border-primary text-foreground'
                      : 'text-muted-foreground border-transparent',
                    isRef &&
                      !isSelected &&
                      'border-purple-500/50 bg-purple-500/10'
                  )}
                >
                  <span
                    className={cn('w-6', isRef && 'font-bold text-purple-400')}
                  >
                    {lap.id}
                  </span>
                  <span
                    className={cn(
                      'flex-1',
                      !lap.valid &&
                        'line-through decoration-red-500/50 opacity-50'
                    )}
                  >
                    {formatTime(lap.lap_time)}
                  </span>
                  <span
                    className={cn(
                      'w-16 text-right font-medium',
                      delta > 0 ? 'text-red-500' : 'text-green-500',
                      delta === 0 && 'text-muted-foreground'
                    )}
                  >
                    {delta === 0 ? '-' : formatDelta(delta)}
                  </span>
                  {isRef && (
                    <Trophy className="ml-auto h-3 w-3 text-purple-500" />
                  )}
                </div>
              )
            })}
          </div>
        </aside>

        {/* MAIN STAGE (Col 9) */}
        <main className="relative col-span-9 flex h-full flex-col overflow-hidden">
          {/* Top HUD */}
          <div className="border-border bg-background/50 z-10 grid h-24 shrink-0 grid-cols-3 border-b backdrop-blur-sm">
            <StatBox
              label="Selected Lap Time"
              value={formatTime(selectedLap.lap_time)}
              icon={<Timer className="text-muted-foreground h-4 w-4" />}
            />
            <StatBox
              label="Delta to Reference"
              value={formatDelta(totalDelta)}
              color={totalDelta > 0 ? 'text-red-500' : 'text-green-500'}
              icon={
                totalDelta > 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )
              }
            />
            <StatBox
              label="Theoretical Best"
              value="1:42.100"
              subValue="-0.85s potential"
              icon={<Activity className="h-4 w-4 text-purple-500" />}
            />
          </div>

          {/* CENTER: The Track Map Container */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-neutral-950/50">
            {/* Background Grid */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Map Wrapper: Keeps 1:1 Aspect Ratio relative to the SVG */}
            <div className="relative aspect-square h-full w-full max-w-5xl p-12">
              {/* LAYER 1: SVG Graphics (Lines & Dots) */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 h-full w-full drop-shadow-2xl"
                preserveAspectRatio="none" // We handle aspect via container
              >
                <defs>
                  <filter
                    id="glow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Ghost Path */}
                <path
                  d="M 20 85 L 25 75 C 28 70, 32 65, 35 60 C 40 50, 42 40, 45 30 L 60 20 L 75 25 C 85 30, 80 45, 70 50 L 60 55 C 50 60, 40 70, 30 80 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted/10"
                />

                {/* Active Path */}
                <path
                  d="M 20 85 L 25 75 C 28 70, 32 65, 35 60 C 40 50, 42 40, 45 30 L 60 20 L 75 25 C 85 30, 80 45, 70 50 L 60 55 C 50 60, 40 70, 30 80 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  className="text-foreground"
                  filter="url(#glow)"
                />

                {/* Dots on the SVG Layer */}
                {TRACK_SECTIONS.map((section) => (
                  <g key={section.id}>
                    <circle
                      cx={section.x}
                      cy={section.y}
                      r="0.8"
                      fill="currentColor"
                      className="text-background"
                    />
                    <circle
                      cx={section.x}
                      cy={section.y}
                      r="0.5"
                      fill="currentColor"
                      className="text-foreground animate-pulse"
                    />
                  </g>
                ))}
              </svg>

              {/* LAYER 2: HTML Overlay (The Labels) */}
              {/* This sits ON TOP of the SVG. It uses % positioning so it matches the SVG coordinates. */}
              {TRACK_SECTIONS.map((section) => {
                const delta =
                  selectedLap.sectors[
                    section.id as keyof typeof selectedLap.sectors
                  ] || 0
                const isSlower = delta > 0

                return (
                  <div
                    key={section.id}
                    className="absolute z-20"
                    style={{
                      left: `${section.x}%`,
                      top: `${section.y}%`,
                    }}
                  >
                    {/* Inner wrapper to handle alignment offset */}
                    <div
                      className={cn(
                        'flex w-32 flex-col transition-all duration-300 hover:scale-110',
                        section.align === 'left'
                          ? '-translate-x-[110%] -translate-y-1/2 items-end'
                          : 'translate-x-[10%] -translate-y-1/2 items-start'
                      )}
                    >
                      {/* Connection Line */}
                      <div
                        className={cn(
                          'bg-border absolute top-1/2 h-[1px] w-4',
                          section.align === 'left'
                            ? '-right-4 translate-x-0'
                            : '-left-4 translate-x-0'
                        )}
                      />

                      {/* The Data Card */}
                      <div className="bg-card/90 border-border w-full rounded-sm border p-2 shadow-sm backdrop-blur-md">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                            {section.name}
                          </span>
                          <span
                            className={cn(
                              'font-mono text-xs font-medium',
                              isSlower ? 'text-red-500' : 'text-green-500'
                            )}
                          >
                            {formatDelta(delta)}
                          </span>
                        </div>

                        {/* Visual Bar */}
                        <div className="bg-muted relative mt-1 h-1 w-full overflow-hidden rounded-full">
                          <div className="bg-foreground/20 absolute left-1/2 h-full w-[1px]" />
                          <div
                            className={cn(
                              'absolute top-0 bottom-0 h-full',
                              isSlower
                                ? 'left-1/2 bg-red-500'
                                : 'right-1/2 bg-green-500'
                            )}
                            style={{
                              width: `${Math.min(Math.abs(delta) * 80, 50)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom Panel: Sector Breakdown */}
          <div className="border-border bg-muted/10 shrink-0 border-t p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                Sector Analysis
              </h3>
              <button className="text-primary flex items-center text-xs hover:underline">
                View Telemetry Graph <ChevronRight className="ml-1 h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 lg:grid-cols-8">
              {TRACK_SECTIONS.map((section, idx) => {
                const delta =
                  selectedLap.sectors[
                    section.id as keyof typeof selectedLap.sectors
                  ] || 0
                return (
                  <div
                    key={idx}
                    className="bg-background border-border hover:border-primary/50 flex h-20 cursor-default flex-col justify-between rounded-sm border p-3 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground font-mono text-[10px]">
                        S{idx + 1}
                      </span>
                      <MapIcon className="text-muted-foreground h-3 w-3 opacity-50" />
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-0.5 truncate text-[9px] uppercase">
                        {section.name}
                      </div>
                      <div
                        className={cn(
                          'font-mono text-sm font-bold',
                          delta > 0 ? 'text-red-500' : 'text-green-500'
                        )}
                      >
                        {formatDelta(delta)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// --- SUBCOMPONENTS ---

function StatBox({
  label,
  value,
  subValue,
  icon,
  color,
}: {
  label: string
  value: string
  subValue?: string
  icon: React.ReactNode
  color?: string
}) {
  return (
    <div className="border-border flex flex-col justify-center border-r p-5 last:border-0">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
          {label}
        </span>
      </div>
      <div
        className={cn('font-mono text-3xl font-bold tracking-tighter', color)}
      >
        {value}
      </div>
      {subValue && (
        <div className="text-muted-foreground mt-1 font-mono text-xs">
          {subValue}
        </div>
      )}
    </div>
  )
}

'use client'

import React from 'react'
import { SegmentedBar } from '@/components/ui/segmented-bar'
import { Lap, LapTable } from '@/components/sessions/LapTable'
import {
  SessionProvider,
  useSession,
} from '@/components/sessions/SessionContext'
import ComparisonLapSelector from '@/components/sessions/ComparisonLapSelector'
import { TrackMap } from '@/components/sessions/TrackMap'
import { getInitialComparisonLapIds } from '@/lib/sessions/comparison'

interface SessionDetailsProps {
  sessionId: string
  laps: Lap[]
}

function SessionControls({ laps }: { laps: Lap[] }) {
  const { selectedLapId, setSelectedLapId, referenceLapId, setReferenceLapId } =
    useSession()

  return (
    <div
      className={'bg-muted flex w-full justify-between gap-1.5 border-b p-1'}
    >
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

export function SessionDetails({ sessionId, laps }: SessionDetailsProps) {
  const {
    selectedLapId: initialSelectedLapId,
    referenceLapId: initialReferenceLapId,
  } = getInitialComparisonLapIds(laps, laps[0]?.id ?? null, null)

  return (
    <SessionProvider
      key={sessionId}
      initialSelectedLapId={initialSelectedLapId}
      initialReferenceLapId={initialReferenceLapId}
    >
      <div className="flex h-full w-full flex-col">
        <SessionControls laps={laps} />
        <div className={'flex h-full w-full'}>
          <LapTable laps={laps} />
          <div className={'flex h-full w-full flex-col'}>
            <div className={'h-full w-full border-b'}>
              <TrackMap sessionId={sessionId} laps={laps} />
            </div>
          </div>
        </div>
      </div>
    </SessionProvider>
  )
}

'use client'

import React from 'react'
import { ChevronsUpDownIcon } from 'lucide-react'
import { SegmentedBar } from '@/components/ui/segmented-bar'
import { Button } from '@/components/ui/button'
import { LapTable, Lap } from '@/components/sessions/LapTable'
import { SessionProvider } from '@/components/sessions/SessionContext'

interface SessionDetailsProps {
  sessionId: string
  laps: Lap[]
}

export function SessionDetails({ sessionId, laps }: SessionDetailsProps) {
  return (
    <SessionProvider
      key={sessionId}
      initialSelectedLapId={laps.length > 0 ? laps[0].id : null}
    >
      <div className="flex h-full w-full flex-col">
        <div className={'flex w-full justify-between gap-1.5 border-b p-1'}>
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
            <Button
              size={'xs'}
              className={
                'text-muted-foreground/50 hover:text-muted-foreground gap-2'
              }
            >
              <ChevronsUpDownIcon size={15} />
              <div className={'flex items-center gap-1.5'}>
                <h1>Comp:</h1>
                <h1 className={'text-muted-foreground'}>Lap 01</h1>
              </div>
            </Button>
            <Button
              size={'xs'}
              className={
                'text-muted-foreground/50 hover:text-muted-foreground gap-2'
              }
            >
              <ChevronsUpDownIcon size={15} />
              <div className={'flex items-center gap-1.5'}>
                <h1>REF:</h1>
                <h1 className={'text-muted-foreground'}>Lap 01</h1>
              </div>
            </Button>
          </SegmentedBar>
        </div>
        <div className={'flex h-full w-full'}>
          <LapTable laps={laps} />
          <div className={'h-full w-full'}></div>
        </div>
      </div>
    </SessionProvider>
  )
}

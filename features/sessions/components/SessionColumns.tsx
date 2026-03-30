'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  BookmarkIcon,
  ClockArrowDownIcon,
  CopyIcon,
  Loader2,
  MoreHorizontal,
  TrashIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { CarThumbnail } from '@/components/sessions/CarThumbnail'
import { Session } from '@/types'
import {
  formatLapTime,
  getShortTimeAgo,
} from '@/features/sessions/components/utils'

interface SessionColumnsProps {
  isDeletingId: string | null
  handleBookmarkToggle: (sessionId: string, currentStatus: boolean) => void
  handleCopyId: (id: string) => void
  handleDeleteClick: (sessionId: string) => void
}

export const getColumns = ({
  isDeletingId,
  handleBookmarkToggle,
  handleCopyId,
  handleDeleteClick,
}: SessionColumnsProps): ColumnDef<Session>[] => [
  {
    accessorKey: 'track',
    header: 'Track',
    filterFn: (row, id, value) => {
      const track = row.original.track
      if (!track) return false
      if (Array.isArray(value) && value.length > 0) {
        return value.includes(track.id)
      }
      return true
    },
    cell: ({ row }) => {
      const track = row.original.track
      const trackName = track?.display_name || row.original.track_id
      const trackFlag = track?.track_flag || 'BE'

      return (
        <div className="flex items-center gap-4">
          <div className="bg-muted/20 flex h-6 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-[4px]">
            <span className="text-5xl font-bold">{trackFlag}</span>
          </div>
          <div className="flex flex-col items-start">
            <span className={'font-bold capitalize'}>{trackName}</span>
            <span className={'text-muted-foreground/70 text-xs'}>
              Unknown Configuration
            </span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'car',
    header: 'Car',
    filterFn: (row, id, value) => {
      const car = row.original.car
      if (!car) return false
      if (Array.isArray(value) && value.length > 0) {
        return value.includes(car.id)
      }
      return true
    },
    cell: ({ row }) => {
      const car = row.original.car
      const carName = car?.display_name || row.original.car_id
      const carImage = car?.car_image

      return (
        <div className="flex items-center gap-4">
          {carImage && (
            <CarThumbnail src={carImage} alt={`${carName} thumbnail`} />
          )}
          <div className={'flex flex-col'}>
            <span>{carName}</span>
            <span className={'text-muted-foreground/70 text-xs'}>
              Unknown Setup
            </span>
          </div>
        </div>
      )
    },
  },

  {
    accessorKey: 'best_lap_time',
    header: 'Timing',
    cell: ({ row }) => {
      return (
        <HoverCard openDelay={200}>
          <HoverCardTrigger asChild>
            <div className="flex flex-col items-start">
              <span>{formatLapTime(row.original.best_lap_time)}</span>
              <span
                className={'flex items-center gap-0.5 text-xs text-green-500'}
              >
                <span>0.000</span>
                <ClockArrowDownIcon height={12} />
              </span>
            </div>
          </HoverCardTrigger>
          <HoverCardContent
            align={'start'}
            className="bg-muted border-border/40 w-80 rounded-sm border !p-3"
          >
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">
                The lap time shown is the best lap from the session. lap.
              </p>
              <p className="text-muted-foreground text-xs">
                The time difference indicates the gap to your theoretical best
                lap.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      )
    },
  },
  {
    id: 'Standings',
    header: 'Standing',
    cell: ({ row }) => {
      return (
        <HoverCard openDelay={200}>
          <HoverCardTrigger asChild>
            <div className="flex flex-col items-start">
              <span className={'flex'}>
                {/* DO NOT DELETE THIS SAVE FOR FUTURE USE*/}
                {/*<span className={'text-foreground'}>N</span>*/}
                <span className={'text-muted-foreground'}>N/A</span>
              </span>
              <span className={'text-muted-foreground/70 text-xs'}>
                {row.original.total_laps} Laps
              </span>
            </div>
          </HoverCardTrigger>

          <HoverCardContent
            align={'start'}
            className="bg-muted border-border/40 w-80 rounded-sm border !p-3"
          >
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">
                The standings number (X/XX) indicates your position in the
                session.
              </p>
              <p className="text-muted-foreground text-xs">
                The laps number indicates the total recorded laps in this
                session.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: () => <div className="text-right">Date</div>, // Added "Date" header text for clarity
    cell: ({ row }) => {
      const rawValue = row.getValue('created_at') as string
      if (!rawValue)
        return (
          <div className="text-muted-foreground text-right text-sm">N/A</div>
        )

      // Standardize to ISO format for the constructor
      const date = new Date(rawValue.replace(' ', 'T'))

      if (isNaN(date.getTime())) {
        return (
          <div className="text-muted-foreground text-right text-sm">
            Invalid Date
          </div>
        )
      }

      const formatted = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(date)

      return (
        <div className="flex flex-col items-end text-right">
          <span className="font-medium">{getShortTimeAgo(formatted)}</span>
          <span className="text-muted-foreground/70 text-xs">{formatted}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'bookmarked',
    header: '',
    filterFn: (row, id, value) => {
      if (value === true) {
        return row.original.bookmarked === true
      }
      return true
    },
    cell: () => {
      // This column is hidden but used for filtering
      return null
    },
    enableHiding: true,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      if (isDeletingId === row.original.id) {
        return (
          <div className="flex justify-end pr-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )
      }
      return (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation()
              handleBookmarkToggle(row.original.id, row.original.bookmarked)
            }}
          >
            <BookmarkIcon
              className={`h-4 w-4 ${row.original.bookmarked ? 'fill-current' : ''}`}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="rounded-sm p-0.5">
              <DropdownMenuItem asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group hover:bg-destructive/10 hover:text-foreground focus:text-foreground w-full justify-start gap-2 rounded-[3px] transition-colors focus:bg-red-500/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyId(row.original.id)
                  }}
                >
                  <CopyIcon className="group-hover:text-foreground group-focus:text-foreground h-4 w-4 transition-colors" />
                  <span>Copy ID</span>
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group hover:bg-destructive/10 hover:text-destructive focus:text-destructive-foreground w-full justify-start gap-2 rounded-[3px] transition-colors focus:bg-red-500/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(row.original.id)
                  }}
                >
                  <TrashIcon className="group-hover:text-destructive group-focus:text-destructive-foreground h-4 w-4 transition-colors" />
                  <span>Delete</span>
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

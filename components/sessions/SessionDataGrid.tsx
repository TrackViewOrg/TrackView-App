'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import {
  ArrowDownUpIcon,
  BookmarkIcon,
  ClockArrowDownIcon,
  CopyIcon,
  FilterIcon,
  ListFilter,
  Loader2,
  MoreHorizontal,
  TrashIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { deleteSession, getUserSessions } from '@/lib/dashboard/session'
import { Session } from '@/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const getShortTimeAgo = (dateInput: string) => {
  if (!dateInput) return 'n/a'

  const recordDate = new Date(dateInput.replace(' ', 'T'))
  const now = new Date()
  const seconds = Math.floor((now.getTime() - recordDate.getTime()) / 1000)

  // Handle invalid dates or future dates immediately
  if (isNaN(seconds) || seconds < 0) return 'Now'

  // NEW: Quick check for under a minute
  if (seconds < 60) return 'Now'

  const units = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'w', seconds: 604800 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
  ]

  for (const unit of units) {
    const interval = Math.floor(seconds / unit.seconds)
    if (interval >= 1) {
      return `${interval}${unit.label} Ago`
    }
  }

  return '0s'
}
export const formatLapTime = (seconds: number) => {
  if (!seconds) return '00:00.000'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

export default function SessionDataGrid() {
  const [sessions, setSessions] = useState<Session[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await getUserSessions()
      if (error) {
        setError(error)
      } else if (data) {
        setSessions(data)
      }
    }
    void fetchSessions()
  }, [])

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!sessionToDelete) return

    const idToDelete = sessionToDelete
    setDeleteDialogOpen(false)
    setSessionToDelete(null)
    setIsDeletingId(idToDelete)

    const { error } = await deleteSession(idToDelete)
    if (error) {
      console.error('Failed to delete session:', error)
      toast.error('Failed to delete session')
      setIsDeletingId(null)
    } else {
      // Remove from local state
      setSessions((prev) =>
        prev ? prev.filter((s) => s.id !== idToDelete) : null
      )
      toast.success('Session deleted successfully')
      setIsDeletingId(null)
    }
  }

  const handleCopyId = (id: string) => {
    navigator.clipboard
      .writeText(id)
      .then(() => toast.success('ID copied to clipboard'))
      .catch(() => toast.error('Failed to copy ID'))
  }

  const uniqueCars = React.useMemo(() => {
    if (!sessions) return []
    const cars = new Map()
    sessions.forEach((session) => {
      if (session.car) {
        cars.set(session.car.id, session.car)
      }
    })
    return Array.from(cars.values())
  }, [sessions])

  const uniqueTracks = React.useMemo(() => {
    if (!sessions) return []
    const tracks = new Map()
    sessions.forEach((session) => {
      if (session.track) {
        tracks.set(session.track.id, session.track)
      }
    })
    return Array.from(tracks.values())
  }, [sessions])

  const columns: ColumnDef<Session>[] = [
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
            <div className="bg-muted/20 flex h-6.5 w-8.5 flex-shrink-0 items-center justify-center overflow-hidden rounded-[4px]">
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
              <div
                className={'w-16 flex-shrink-0 overflow-hidden rounded-[4px]'}
              >
                <img
                  src={carImage}
                  alt={'Car'}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
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
          <div className="flex flex-col items-start">
            <span>{formatLapTime(row.original.best_lap_time)}</span>
            <span
              className={'flex items-center gap-0.5 text-xs text-green-500'}
            >
              <span>{row.original.gap_to_pb}</span>
              <ClockArrowDownIcon height={12} />
            </span>
          </div>
        )
      },
    },
    {
      id: 'Standings',
      header: 'Standing',
      cell: ({ row }) => {
        return (
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
            <span className="text-muted-foreground/70 text-xs">
              {formatted}
            </span>
          </div>
        )
      },
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
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <BookmarkIcon className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: sessions || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  const isSortedBy = (id: string, desc: boolean) => {
    return sorting.some((s) => s.id === id && s.desc === desc)
  }

  const toggleSort = (id: string, desc: boolean) => {
    setSorting((current) => {
      if (isSortedBy(id, desc)) {
        return []
      }
      return [{ id, desc }]
    })
  }

  const resetAll = () => {
    setSorting([])
    table.resetColumnFilters()
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-start">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="border-border/40 h-8 gap-2 border"
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>Filters</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="bg-muted border-border/50 !text-foreground/80 !text-md m-0 gap-0 rounded-sm px-0.5 font-light"
          >
            <DropdownMenuLabel
              className={
                '!text-muted-foreground flex items-center gap-2 text-xs'
              }
            >
              <ArrowDownUpIcon size={14} />
              <h1>Sort By</h1>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={isSortedBy('created_at', true)}
              onCheckedChange={() => toggleSort('created_at', true)}
            >
              Date (Newest)
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={isSortedBy('created_at', false)}
              onCheckedChange={() => toggleSort('created_at', false)}
            >
              Date (Oldest)
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={isSortedBy('best_lap_time', false)}
              onCheckedChange={() => toggleSort('best_lap_time', false)}
            >
              Best Lap (Fastest)
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={isSortedBy('best_lap_time', true)}
              onCheckedChange={() => toggleSort('best_lap_time', true)}
            >
              Best Lap (Slowest)
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel
              className={
                '!text-muted-foreground flex items-center gap-2 text-xs'
              }
            >
              <FilterIcon size={14} />
              <h1>Filter By</h1>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Car</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-muted border-border/50 m-0 gap-0 rounded-sm px-1">
                {uniqueCars.map((car) => {
                  const isSelected = (
                    table.getColumn('car')?.getFilterValue() as string[]
                  )?.includes(car.id)
                  return (
                    <DropdownMenuCheckboxItem
                      key={car.id}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const current =
                          (table
                            .getColumn('car')
                            ?.getFilterValue() as string[]) || []
                        const newFilter = checked
                          ? [...current, car.id]
                          : current.filter((id) => id !== car.id)
                        table
                          .getColumn('car')
                          ?.setFilterValue(
                            newFilter.length ? newFilter : undefined
                          )
                      }}
                    >
                      {car.display_name}
                    </DropdownMenuCheckboxItem>
                  )
                })}
                {uniqueCars.length === 0 && (
                  <div className="text-muted-foreground p-2 text-sm">
                    No cars available
                  </div>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Track</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-muted border-border/50 m-0 gap-0 rounded-sm px-0.5">
                {uniqueTracks.map((track) => {
                  const isSelected = (
                    table.getColumn('track')?.getFilterValue() as string[]
                  )?.includes(track.id)
                  return (
                    <DropdownMenuCheckboxItem
                      key={track.id}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const current =
                          (table
                            .getColumn('track')
                            ?.getFilterValue() as string[]) || []
                        const newFilter = checked
                          ? [...current, track.id]
                          : current.filter((id) => id !== track.id)
                        table
                          .getColumn('track')
                          ?.setFilterValue(
                            newFilter.length ? newFilter : undefined
                          )
                      }}
                    >
                      {track.display_name}
                    </DropdownMenuCheckboxItem>
                  )
                })}
                {uniqueTracks.length === 0 && (
                  <div className="text-muted-foreground p-2 text-sm">
                    No tracks available
                  </div>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={resetAll}
              disabled={sorting.length === 0 && columnFilters.length === 0}
            >
              Reset All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className={`${sessions && 'border-border/50 border'} rounded-xs`}>
        {sessions ? (
          <Table>
            <TableHeader className={'bg-muted/50 hover:bg-muted/50'}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className={'hover:bg-transparent'}
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() =>
                      isDeletingId !== row.original.id &&
                      router.push(`${pathname}/${row.original.id}`)
                    }
                    className={`hover:bg-muted/20 hover:text-foreground text-muted-foreground cursor-pointer transition-all duration-200 ${
                      isDeletingId === row.original.id
                        ? 'bg-muted/10 pointer-events-none opacity-50'
                        : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-muted-foreground h-24 text-center"
                  >
                    You Dont Have Any Sessions Yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-4/7" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              session and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-sm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

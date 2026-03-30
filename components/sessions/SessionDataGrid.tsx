'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  deleteSession,
  getUserSessions,
  toggleSessionBookmark,
} from '@/lib/dashboard/session'
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
import { getColumns } from './SessionColumns'
import { SessionToolbar } from './SessionToolbar'
import { SessionTable } from './SessionTable'

export default function SessionDataGrid() {
  const [sessions, setSessions] = useState<Session[] | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const handleBookmarkToggle = async (
    sessionId: string,
    currentStatus: boolean
  ) => {
    const newStatus = !currentStatus

    // Optimistic update
    setSessions((prev) =>
      prev
        ? prev.map((s) =>
            s.id === sessionId ? { ...s, bookmarked: newStatus } : s
          )
        : null
    )

    const { error } = await toggleSessionBookmark(sessionId, newStatus)
    if (error) {
      console.error('Failed to toggle bookmark:', error)
      toast.error('Failed to update bookmark')
      // Revert on error
      setSessions((prev) =>
        prev
          ? prev.map((s) =>
              s.id === sessionId ? { ...s, bookmarked: currentStatus } : s
            )
          : null
      )
    }
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

  const columns = React.useMemo(
    () =>
      getColumns({
        isDeletingId,
        handleBookmarkToggle,
        handleCopyId,
        handleDeleteClick,
      }),
    [isDeletingId]
  )

  // TanStack Table exposes mutable helpers that React Compiler intentionally skips.
  // This keeps the integration explicit without changing table behavior.
  // eslint-disable-next-line react-hooks/incompatible-library
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
      columnVisibility: {
        ...columnVisibility,
        bookmarked: false, // Hide the bookmarked column by default
      },
    },
  })

  const isSortedBy = (id: string, desc: boolean) => {
    return sorting.some((s) => s.id === id && s.desc === desc)
  }

  const toggleSort = (id: string, desc: boolean) => {
    setSorting(() => {
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
      <SessionToolbar
        table={table}
        sorting={sorting}
        columnFilters={columnFilters}
        uniqueTracks={uniqueTracks}
        uniqueCars={uniqueCars}
        isSortedBy={isSortedBy}
        toggleSort={toggleSort}
        resetAll={resetAll}
      />

      <SessionTable
        table={table}
        sessions={sessions}
        isDeletingId={isDeletingId}
        columnsLength={columns.length}
      />

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

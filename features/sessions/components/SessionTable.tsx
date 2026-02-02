'use client'

import * as React from 'react'
import { flexRender, Table } from '@tanstack/react-table'
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Session } from '@/types'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SessionTableProps {
  table: Table<Session>
  sessions: Session[] | null
  isDeletingId: string | null
  columnsLength: number
}

export function SessionTable({
  table,
  sessions,
  isDeletingId,
  columnsLength,
}: SessionTableProps) {
  const router = useRouter()

  return (
    <div className="bg-muted/30 rounded-md border">
      <UITable>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
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
                data-state={row.getIsSelected() && 'selected'}
                className={cn(
                  'cursor-pointer transition-colors',
                  isDeletingId === row.original.id && 'opacity-50'
                )}
                onClick={() => router.push(`/dashboard/sessions/${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnsLength} className="h-24 text-center">
                {sessions === null ? 'Loading sessions...' : 'No results.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </UITable>
    </div>
  )
}

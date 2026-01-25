'use client'

import * as React from 'react'
import { flexRender, Table as ReactTable } from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Session } from '@/types'
import { usePathname, useRouter } from 'next/navigation'

interface SessionTableProps {
  table: ReactTable<Session>
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
  const pathname = usePathname()

  return (
    <div className={`${sessions && 'border-border/50 border'} rounded-xs`}>
      {sessions ? (
        <Table>
          <TableHeader className={'bg-muted/50 hover:bg-muted/50'}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={'hover:bg-transparent'}>
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
                      ? 'bg-muted/10 pointer-events-none opacity-20'
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
                  colSpan={columnsLength}
                  className="text-muted-foreground h-24 text-center"
                >
                  No Sessions Found
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
  )
}

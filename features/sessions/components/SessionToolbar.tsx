'use client'

import * as React from 'react'
import { ColumnFiltersState, SortingState, Table } from '@tanstack/react-table'
import {
  ArrowDownUpIcon,
  BookmarkIcon,
  FilterIcon,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NamedOption, Session } from '@/types'

interface SessionToolbarProps {
  table: Table<Session>
  sorting: SortingState
  columnFilters: ColumnFiltersState
  uniqueTracks: NamedOption[]
  uniqueCars: NamedOption[]
  isSortedBy: (id: string, desc: boolean) => boolean
  toggleSort: (id: string, desc: boolean) => void
  resetAll: () => void
}

export function SessionToolbar({
  table,
  sorting,
  columnFilters,
  uniqueTracks,
  uniqueCars,
  isSortedBy,
  toggleSort,
  resetAll,
}: SessionToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-2 border-dashed"
          >
            <ArrowDownUpIcon className="h-3.5 w-3.5" />
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="bg-muted border-border/30 w-48 rounded-sm border p-0.5"
        >
          <DropdownMenuLabel className={'text-muted-foreground !text-xs'}>
            Sort by
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
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={isSortedBy('best_lap_time', false)}
            onCheckedChange={() => toggleSort('best_lap_time', false)}
          >
            Lap Time (Fastest)
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={isSortedBy('best_lap_time', true)}
            onCheckedChange={() => toggleSort('best_lap_time', true)}
          >
            Lap Time (Slowest)
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-2 border-dashed"
          >
            <FilterIcon className="h-3.5 w-3.5" />
            Track
            {(table.getColumn('track')?.getFilterValue() as string[])?.length >
              0 && (
              <span className="bg-muted rounded-inner ml-1 px-1 text-[10px] font-normal">
                {
                  (table.getColumn('track')?.getFilterValue() as string[])
                    ?.length
                }
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="bg-muted border-border/30 w-48 rounded-sm border p-0.5"
        >
          <DropdownMenuLabel className={'text-muted-foreground !text-xs'}>
            Filter by Track
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {uniqueTracks.length > 0 ? (
            uniqueTracks.map((track) => {
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
                      ?.setFilterValue(newFilter.length ? newFilter : undefined)
                  }}
                >
                  {track.display_name}
                </DropdownMenuCheckboxItem>
              )
            })
          ) : (
            <div className="text-muted-foreground p-2 text-sm">
              No tracks available
            </div>
          )}
          {(table.getColumn('track')?.getFilterValue() as string[])?.length >
            0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  table.getColumn('track')?.setFilterValue(undefined)
                }
                className="justify-center text-center"
              >
                Clear filters
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-2 border-dashed"
          >
            <FilterIcon className="h-3.5 w-3.5" />
            Car
            {(table.getColumn('car')?.getFilterValue() as string[])?.length >
              0 && (
              <span className="bg-muted rounded-inner ml-1 px-1 text-[10px] font-normal">
                {(table.getColumn('car')?.getFilterValue() as string[])?.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="bg-muted border-border/30 w-48 rounded-sm border p-0.5"
        >
          <DropdownMenuLabel className={'text-muted-foreground !text-xs'}>
            Filter by Car
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {uniqueCars.length > 0 ? (
            uniqueCars.map((car) => {
              const isSelected = (
                table.getColumn('car')?.getFilterValue() as string[]
              )?.includes(car.id)
              return (
                <DropdownMenuCheckboxItem
                  key={car.id}
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    const current =
                      (table.getColumn('car')?.getFilterValue() as string[]) ||
                      []
                    const newFilter = checked
                      ? [...current, car.id]
                      : current.filter((id) => id !== car.id)
                    table
                      .getColumn('car')
                      ?.setFilterValue(newFilter.length ? newFilter : undefined)
                  }}
                >
                  {car.display_name}
                </DropdownMenuCheckboxItem>
              )
            })
          ) : (
            <div className="text-muted-foreground p-2 text-sm">
              No cars available
            </div>
          )}
          {(table.getColumn('car')?.getFilterValue() as string[])?.length >
            0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  table.getColumn('car')?.setFilterValue(undefined)
                }
                className="justify-center text-center"
              >
                Clear filters
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant={
          table.getColumn('bookmarked')?.getFilterValue() === true
            ? 'accent'
            : 'default'
        }
        size="sm"
        className="border-border/0 transiotion-all h-8 gap-2 border-1 duration-200"
        onClick={() => {
          const current =
            table.getColumn('bookmarked')?.getFilterValue() === true
          table
            .getColumn('bookmarked')
            ?.setFilterValue(current ? undefined : true)
        }}
      >
        <BookmarkIcon
          className={`h-4 w-4 ${table.getColumn('bookmarked')?.getFilterValue() === true ? 'fill-current' : ''}`}
        />
        Bookmarked
      </Button>

      {(sorting.length > 0 || columnFilters.length > 0) && (
        <Button
          variant="ghost"
          onClick={resetAll}
          className="flex h-8 !gap-2 !px-2"
        >
          <RotateCcw className="ml-2 h-4 w-2" />
          <h1>Reset</h1>
        </Button>
      )}
    </div>
  )
}

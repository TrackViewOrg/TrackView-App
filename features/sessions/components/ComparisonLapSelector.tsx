import React, { useState } from 'react'
import { Check, ChevronsUpDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Lap } from '@/features/sessions/components/LapTable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getSelectableComparisonLaps } from '@/lib/sessions/comparison'

interface ComparisonLapSelectorProps {
  laps: Lap[]
  selectedLapId: string | null
  onSelectLap: (lapId: string) => void
  label: string
  excludedLapId?: string | null
  className?: string
}

function ComparisonLapSelector({
  laps,
  selectedLapId,
  onSelectLap,
  label,
  excludedLapId = null,
  className,
}: ComparisonLapSelectorProps) {
  const [open, setOpen] = useState(false)
  const availableLaps = getSelectableComparisonLaps(laps, excludedLapId)
  const selectedLap = availableLaps.find((lap) => lap.id === selectedLapId)
  const isDisabled = availableLaps.length === 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          size={'xs'}
          role="combobox"
          aria-expanded={open}
          disabled={isDisabled}
          className={cn(
            'text-muted-foreground/50 hover:text-muted-foreground h-auto w-auto gap-1 rounded-none border-none bg-transparent !px-1 py-1 !pr-3',
            className
          )}
        >
          <ChevronsUpDownIcon size={15} />
          <div className={'flex items-center gap-1.5'}>
            <span className="text-xs uppercase">{label}:</span>
            <span className={'text-muted-foreground text-xs uppercase'}>
              {selectedLap
                ? `Lap_${selectedLap.lap_number}`
                : isDisabled
                  ? 'Unavailable'
                  : 'Select'}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-muted border-border/40 m-0 w-45 rounded-sm border !p-0"
        align="end"
      >
        <Command>
          <CommandList className="max-h-full overflow-hidden">
            <CommandEmpty>No comparison lap available.</CommandEmpty>
            <CommandGroup className={'overflow-hidden p-0.5'}>
              <ScrollArea className={'h-60'}>
                {availableLaps.map((lap) => (
                  <CommandItem
                    key={lap.id}
                    value={`Lap ${lap.lap_number}`}
                    onSelect={() => {
                      onSelectLap(lap.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedLapId === lap.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    Lap {lap.lap_number}
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default ComparisonLapSelector

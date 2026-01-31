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
import { Lap } from '@/components/sessions/LapTable'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ComparisonLapSelectorProps {
  laps: Lap[]
  selectedLapId: string | null
  onSelectLap: (lapId: string) => void
  label: string
  className?: string
}

function ComparisonLapSelector({
  laps,
  selectedLapId,
  onSelectLap,
  label,
  className,
}: ComparisonLapSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectedLap = laps.find((l) => l.id === selectedLapId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          size={'xs'}
          role="combobox"
          aria-expanded={open}
          className={cn(
            'text-muted-foreground/50 hover:text-muted-foreground h-auto w-auto gap-1 rounded-none border-none bg-transparent !px-1 py-1 !pr-3',
            className
          )}
        >
          <ChevronsUpDownIcon size={15} />
          <div className={'flex items-center gap-1.5'}>
            <span className="text-xs uppercase">{label}:</span>
            <span className={'text-muted-foreground text-xs uppercase'}>
              {selectedLap ? `Lap_${selectedLap.lap_number}` : 'Select'}
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
            <CommandEmpty>No lap found.</CommandEmpty>
            <CommandGroup className={'overflow-hidden p-0.5'}>
              <ScrollArea className={'h-60'}>
                {laps.map((lap) => (
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

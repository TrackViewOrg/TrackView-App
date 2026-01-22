'use client'

import * as React from 'react'
import { useTransition } from 'react'
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
import { Check, ChevronsUpDown, EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react'
import { updateProfileVisibility } from '@/lib/auth/settings' // Update path to your action

interface ProfileVisibilitySelectorProps {
    initialVisibility: boolean
}

const statuses = [
    {
        value: true,
        label: 'Visible',
        icon: EyeIcon,
    },
    {
        value: false,
        label: 'Hidden',
        icon: EyeOffIcon,
    },
]

export function ProfileVisibilitySelector({ initialVisibility }: ProfileVisibilitySelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [isVisible, setIsVisible] = React.useState(initialVisibility)
    const [isPending, startTransition] = useTransition()

    const selectedStatus = statuses.find((status) => status.value === isVisible) || statuses[1]

    const handleSelect = (value: boolean) => {
        if (value === isVisible) {
            setOpen(false)
            return
        }

        setOpen(false)
        setIsVisible(value) // Optimistic update

        startTransition(async () => {
            try {
                await updateProfileVisibility(value)
            } catch (error) {
                setIsVisible(!value) // Revert on error
                console.error('Failed to update visibility', error)
            }
        })
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button size="sm" variant="default" className="rounded-[3px] border-border/20 border px-4"                     role="combobox"
                        aria-expanded={open}
                        disabled={isPending}>
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <selectedStatus.icon className="mr-2 h-4 w-4 opacity-70" />
                    )}
                    {selectedStatus.label}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-0 rounded-sm border-border/10" align="end">
                <Command className={"p-0 bg-muted"}>
                    <CommandList className={"p-0.5 bg-muted"}>
                        <CommandGroup className={"p-0 bg-muted"}>
                            {statuses.map((status) => (
                                <CommandItem
                                    key={status.label}
                                    value={status.label}
                                    onSelect={() => handleSelect(status.value)}
                                    className={"flex items-center"}
                                >
                                    <status.icon
                                        className={cn(
                                            "h-4 w-4 text-muted-foreground",
                                            status.value === isVisible ? "text-primary" : ""
                                        )}
                                    />
                                    <span>{status.label}</span>
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            isVisible === status.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
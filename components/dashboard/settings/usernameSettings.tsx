"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUser } from "@/components/providers/user-provider"
import { ActionButton } from "@/components/dashboard/settings/ActionButton"
import {updateUsername} from "@/lib/auth/settings";

export default function UsernameSettings() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [value, setValue] = useState("")

    const { profile } = useUser()

    const isValid = value.trim().length > 0 && value !== profile?.display_name

    const handleUpdate = async () => {
        if (!isValid) return

        setLoading(true)
        setError(null)

        try {
            const result = await updateUsername(value)

            if (result.error) {
                setError(result.error)
                return
            }

            // Success
            setOpen(false)
            setValue("")
        } catch (err) {
            setError("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && isValid) {
            handleUpdate()
        }
    }

    // Reset state when dialog opens/closes
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            setValue("")
            setError(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <ActionButton label="Change Username" />
            </DialogTrigger>

            <DialogContent className="font-archivo sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Username</DialogTitle>
                    <DialogDescription>
                        Enter your new display name. This must be unique.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-1 w-full py-2">
                    {error && (
                        <span className="text-xs text-red-500 font-medium ml-1">
                            {error}
                        </span>
                    )}
                    <Input
                        type="text"
                        placeholder={profile?.display_name || "Enter new username"}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value)
                            if (error) setError(null) // Clear error on type
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                </div>

                <DialogFooter>
                    <div className="flex gap-2 items-center w-full justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="accent"
                            onClick={handleUpdate}
                            disabled={!isValid || loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
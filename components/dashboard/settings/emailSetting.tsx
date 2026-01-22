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
import {CheckCircle2, AlertCircle, Mail} from "lucide-react"
import {initiateEmailChange} from "@/lib/auth/settings";

export default function EmailSettings() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [value, setValue] = useState("")

    const { user } = useUser()

    const isValid = value.trim().length > 0 && value !== user?.email && value.includes("@")

    const handleUpdate = async () => {
        if (!isValid) return
        setLoading(true)
        setError(null)

        try {
            const result = await initiateEmailChange(value)
            if (result.error) {
                setError(result.error)
            } else {
                setSuccess(true)
            }
        } catch (err) {
            setError("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    // Reset state after dialog closes (delayed to allow animation to finish)
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            setTimeout(() => {
                setValue("")
                setError(null)
                setSuccess(false)
                setLoading(false)
            }, 300)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <ActionButton label="Change Email" />
            </DialogTrigger>

            <DialogContent className="font-archivo sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {success ? "Verification Required" : "Update Email Address"}</DialogTitle>
                    <DialogDescription>
                        {success ? "" : "Enter your new email address below."}
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3 text-center">
                        <div className="h-12 w-12 rounded-sm bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-medium">Check your email</h4>
                            <p className="text-sm text-muted-foreground max-w-[300px] mx-auto">
                                We sent a Confirmation link to <br/>
                                <span className="font-semibold text-foreground">{value}</span>.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 w-full py-2">
                        {error && (
                            <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium ml-1">
                                <AlertCircle className="h-3 w-3" />
                                <span>{error}</span>
                            </div>
                        )}
                        <Input
                            type="email"
                            placeholder={user?.email || "new@example.com"}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value)
                                if (error) setError(null)
                            }}
                            disabled={loading}
                            className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                    </div>
                )}

                <DialogFooter>
                    {success ? (
                        <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
                    ) : (
                        <div className="flex gap-2 items-center w-full justify-end">
                            <Button variant="secondary" onClick={() => setOpen(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} disabled={!isValid || loading} variant={"accent"}>
                                {loading ? "Sending..." : "Update Email"}
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
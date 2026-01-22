"use client"

import React from 'react'
import {LogOut} from "lucide-react"
import {DropdownMenuItem} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {signout} from "@/lib/auth/actions"

export default function SignoutMenuItem() {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem
                    // Prevent the dropdown from closing immediately so the dialog can open
                    onSelect={(e) => e.preventDefault()}
                    className="group rounded-[3px] focus:bg-destructive/10 focus:text-destructive cursor-pointer text-xs text-muted-foreground transition-colors group-focus:text-destructive"
                >
                    <LogOut
                        size={14}
                        className="text-muted-foreground transition-colors group-focus:text-destructive"
                    />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </AlertDialogTrigger>

            <AlertDialogContent className={"font-archivo"}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Don't worry, your data is synced to the cloud. You can pick up right where you left off the next
                        time you sign in.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <form action={signout}>
                        <AlertDialogAction
                            type="submit"
                            className="bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-sm"
                        >
                            Sign out
                        </AlertDialogAction>
                    </form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
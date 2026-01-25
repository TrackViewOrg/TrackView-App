'use client'

import React, { useState } from 'react'
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
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DeleteAccount() {
  const [confirmInput, setConfirmInput] = useState('')
  const isDeleteDisabled = confirmInput.toUpperCase() !== 'DELETE ACCOUNT'

  return (
    <AlertDialog onOpenChange={() => setConfirmInput('')}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          className="border-border/20 w-full rounded-[3px] border"
        >
          Delete Account
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="font-archivo">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is irreversible. It will permanently delete your
            account, your subscription, and all recorded session data from our
            servers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label
            htmlFor="confirm-account-delete"
            className="text-muted-foreground text-sm"
          >
            Type{' '}
            <span className="text-foreground font-bold">Delete Account</span> to
            confirm.
          </Label>
          <Input
            id="confirm-account-delete"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="Delete Account"
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form>
            <AlertDialogAction
              type="submit"
              disabled={isDeleteDisabled}
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-sm"
            >
              Delete Account
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

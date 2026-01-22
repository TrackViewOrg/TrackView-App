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

export default function DeleteSessions() {
  const [confirmInput, setConfirmInput] = useState('')
  const isDeleteDisabled = confirmInput.toUpperCase() !== 'DELETE SESSIONS'

  return (
    <AlertDialog onOpenChange={() => setConfirmInput('')}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          className="border-border/20 rounded-[3px] border"
        >
          Delete Sessions
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="font-archivo">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All your sessions will be permanently
            deleted and you will not be able to recover them.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label
            htmlFor="confirm-delete"
            className="text-muted-foreground text-sm"
          >
            Type{' '}
            <span className="text-foreground font-bold">Delete Sessions</span>{' '}
            to confirm.
          </Label>
          <Input
            id="confirm-delete"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="Delete Sessions"
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
              Delete Sessions
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

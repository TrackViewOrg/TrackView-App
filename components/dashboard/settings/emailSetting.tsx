'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUser } from '@/components/providers/user-provider'
import { ActionButton } from '@/components/dashboard/settings/ActionButton'
import { AlertCircle, Mail } from 'lucide-react'
import { initiateEmailChange } from '@/lib/auth/settings'

export default function EmailSettings() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [value, setValue] = useState('')

  const { user } = useUser()

  const isValid =
    value.trim().length > 0 && value !== user?.email && value.includes('@')

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
      console.error('Email update error:', err)
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  // Reset state after dialog closes (delayed to allow animation to finish)
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setTimeout(() => {
        setValue('')
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
            {success ? 'Verification Required' : 'Update Email Address'}
          </DialogTitle>
          <DialogDescription>
            {success ? '' : 'Enter your new email address below.'}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-blue-100 dark:bg-blue-900/30">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Check your email</h4>
              <p className="text-muted-foreground mx-auto max-w-[300px] text-sm">
                We sent a Confirmation link to <br />
                <span className="text-foreground font-semibold">{value}</span>.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2 py-2">
            {error && (
              <div className="ml-1 flex items-center gap-1.5 text-xs font-medium text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>{error}</span>
              </div>
            )}
            <Input
              type="email"
              placeholder={user?.email || 'new@example.com'}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                if (error) setError(null)
              }}
              disabled={loading}
              className={
                error ? 'border-red-500 focus-visible:ring-red-500' : ''
              }
            />
          </div>
        )}

        <DialogFooter>
          {success ? (
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          ) : (
            <div className="flex w-full items-center justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={!isValid || loading}
                variant={'accent'}
              >
                {loading ? 'Sending...' : 'Update Email'}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

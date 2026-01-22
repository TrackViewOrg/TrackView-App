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
import { Button } from '@/components/ui/button'
import { ActionButton } from '@/components/dashboard/settings/ActionButton'
import { toast } from 'sonner'
import { handleForgotPassword } from '@/lib/auth/actions'
import { useUser } from '@/components/providers/user-provider' // Standard import for this syntax in Shadcn

export default function PasswordSettings() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useUser()

  const handleSendLink = async () => {
    setLoading(true)

    try {
      const result = await handleForgotPassword(user?.email || '')

      if (result.error) {
        toast.error(result.error)
      } else {
        setOpen(false)
        toast.success('Password Reset Link Sent To Email')
      }
    } catch (err) {
      console.error('Password reset error:', err)
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionButton label="Change Password" />
      </DialogTrigger>

      <DialogContent className="font-archivo sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            For security, we will send a password reset link to your registered
            email address.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <div className="flex w-full items-center justify-end gap-2 pt-5">
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handleSendLink}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

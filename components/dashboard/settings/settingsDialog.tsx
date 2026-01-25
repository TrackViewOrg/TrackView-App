// components/dashboard/settings/settings-dialog.tsx
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type SettingAction =
  | 'username'
  | 'email'
  | 'password'
  | 'delete_sessions'
  | null

interface SettingsDialogProps {
  type: SettingAction
  isOpen: boolean
  onClose: () => void
  currentValue?: string
}

export function SettingsDialog({
  type,
  isOpen,
  onClose,
  currentValue,
}: SettingsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')

  const handleUpdate = async () => {
    setLoading(true)
    // TODO: Implement update logic or remove this component if unused
    console.log('Updating', type, 'to', value)
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="capitalize">
            Update {type?.replace('_', ' ')}
          </DialogTitle>
          <DialogDescription>Enter your new {type} below.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            type={type === 'password' ? 'password' : 'text'}
            placeholder={currentValue || 'Type here...'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

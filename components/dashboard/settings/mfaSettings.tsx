'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
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
import {
  ArrowRight,
  Check,
  Copy,
  Loader2,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
} from 'lucide-react'
import {
  deleteFactor,
  enrollMFA,
  type Factor,
  getMFAFactors,
  verifyAndEnableMFA,
  verifyExistingFactor,
} from '@/lib/auth/settings'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUser } from '@/components/providers/user-provider'
import { toast } from 'sonner'

type ViewState = 'loading' | 'list' | 'enroll' | 'verify'

type PendingAction =
  | { type: 'add' }
  | { type: 'delete'; factorId: string }
  | null

export default function MfaSettings() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<ViewState>('loading')

  const { user } = useUser()

  // Data State
  const [factors, setFactors] = useState<Factor[]>([])

  // Action State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  // Enroll/Verify State
  const [newDeviceName, setNewDeviceName] = useState('')
  const [enrollStep, setEnrollStep] = useState<'name' | 'qr'>('name')
  const [enrollData, setEnrollData] = useState<{
    factorId: string
    qrCode: string
    secret: string
  } | null>(null)
  const [code, setCode] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  // --- RESET LOGIC ---
  const resetFlow = useCallback(() => {
    setNewDeviceName('')
    setEnrollStep('name')
    setEnrollData(null)
    setCode('')
    setError(null)
    setOpen(false)
    setPendingAction(null)
  }, [])

  // --- DATA FETCHING ---
  const loadFactors = useCallback(async () => {
    // Only show full loading view if dialog is open, otherwise just set loading state
    if (open) setView('loading')
    setLoading(true)

    try {
      const { factors } = await getMFAFactors()
      setFactors(factors)
      // Determine view based on result
      setView(factors.length > 0 ? 'list' : 'enroll')
    } catch (e) {
      console.error('MFA Load Error', e)
      setView('enroll')
    } finally {
      setLoading(false)
    }
  }, [open])

  // --- INITIAL LOAD ---
  // Fix: Load data immediately on mount so the button label is correct
  useEffect(() => {
    loadFactors()
  }, [loadFactors])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setTimeout(resetFlow, 200)
    } else {
      // Refresh data when opening to ensure freshness
      loadFactors()
    }
  }

  // --- GATEKEEPER LOGIC ---
  const initiateSensitiveAction = (action: PendingAction) => {
    if (factors.length === 0) {
      if (action?.type === 'add') setView('enroll')
      return
    }
    setPendingAction(action)
    setCode('')
    setError(null)
    setView('verify')
  }

  const handleGatekeeperVerify = async () => {
    if (code.length !== 6 || factors.length === 0) return
    setLoading(true)
    setError(null)

    try {
      const primaryFactorId = factors[0].id
      const res = await verifyExistingFactor(primaryFactorId, code)

      if (res.error) {
        setError('Invalid code')
      } else {
        if (pendingAction?.type === 'add') {
          resetFlow()
          setView('enroll')
        } else if (pendingAction?.type === 'delete') {
          await handleDelete(pendingAction.factorId)
        }
      }
    } catch (err) {
      console.error('MFA verification error:', err)
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  // --- ACTIONS ---
  const handleGenerateQR = async () => {
    if (!newDeviceName.trim()) return

    setLoading(true)
    setError(null)
    try {
      const res = await enrollMFA(newDeviceName.trim(), user?.email)

      if (res.error) {
        setError(res.error)
      } else if (res.qrCode && res.factorId && res.secret) {
        setEnrollData({
          factorId: res.factorId,
          qrCode: res.qrCode,
          secret: res.secret,
        })
        setEnrollStep('qr')
      }
    } catch (err) {
      console.error('MFA enrollment error:', err)
      setError('Failed to start enrollment')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEnroll = async () => {
    if (!enrollData || code.length !== 6) return
    setLoading(true)

    try {
      const res = await verifyAndEnableMFA(enrollData.factorId, code)
      if (res.error) {
        setError('Invalid code. Please try again.')
      } else {
        await loadFactors()
        resetFlow()
        toast.success('MFA Device Added Successfully !')
      }
    } catch (err) {
      console.error('MFA verify enroll error:', err)
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (factorId: string) => {
    setLoading(true)
    try {
      const res = await deleteFactor(factorId)
      if (res.error) {
        setError(res.error)
      } else {
        await loadFactors()
        setPendingAction(null)
      }
    } catch (err) {
      console.error('MFA delete error:', err)
      setError('Failed to delete device')
    } finally {
      setLoading(false)
    }
  }

  const handleCopySecret = () => {
    if (!enrollData?.secret) return
    navigator.clipboard.writeText(enrollData.secret)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // --- VIEWS ---
  const renderList = () => (
    <div className="space-y-4 py-2">
      <div className="space-y-3">
        {factors.map((factor) => (
          <div
            key={factor.id}
            className="bg-input/15 text-card-foreground flex items-center justify-between rounded-sm border p-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm">
                <Smartphone className="text-muted-foreground h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm leading-none font-medium">
                  {factor.friendly_name || 'Authenticator Device'}
                </span>
                <span className="text-muted-foreground mt-1 text-xs">
                  Added {format(new Date(factor.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
              onClick={() =>
                initiateSensitiveAction({ type: 'delete', factorId: factor.id })
              }
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        className="h-11 w-full gap-2 border border-dashed"
        onClick={() => initiateSensitiveAction({ type: 'add' })}
      >
        <Plus className="h-4 w-4" />
        Add New Device
      </Button>
    </div>
  )

  const renderVerification = () => (
    <div className="space-y-6 py-2">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-accent/20 flex h-12 w-12 items-center justify-center rounded-sm">
          <ShieldCheck className="text-accent-foreground h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Security Check</h4>
          <p className="text-muted-foreground max-w-[280px] text-xs">
            Please enter the code from your{' '}
            <strong>{factors[0]?.friendly_name || 'primary device'}</strong> to
            continue.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={code} onChange={setCode}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      {error && (
        <p className="rounded-sm bg-red-50 p-2 text-center text-sm font-medium text-red-500 dark:bg-red-900/10">
          {error}
        </p>
      )}
    </div>
  )

  const renderEnrollment = () => (
    <div className="space-y-6 py-2">
      <div className="space-y-2">
        <Label>Device Name</Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Personal iPhone"
            value={newDeviceName}
            onChange={(e) => setNewDeviceName(e.target.value)}
            disabled={enrollStep === 'qr' || loading}
            className="flex-1"
          />
          {enrollStep === 'name' && (
            <Button
              onClick={handleGenerateQR}
              disabled={!newDeviceName.trim() || loading}
              className="shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {enrollStep === 'qr' && (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-sm bg-white p-1 shadow-sm">
              {enrollData?.qrCode ? (
                <Image
                  src={enrollData.qrCode}
                  alt="QR"
                  width={160}
                  height={160}
                />
              ) : (
                <div className="flex h-[160px] w-[160px] items-center justify-center">
                  <Loader2 className="text-muted-foreground animate-spin" />
                </div>
              )}
            </div>

            <div className="flex w-full flex-col items-center">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Can&#39;t Scan the code ?
              </span>
              <button
                onClick={handleCopySecret}
                className="bg-background hover:bg-muted group flex items-center gap-2 rounded-sm px-3 py-1.5 font-mono text-xs transition-all"
              >
                <span className="max-w-[200px] truncate">
                  {enrollData?.secret}
                </span>
                {isCopied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="text-muted-foreground group-hover:text-foreground h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          <div className="flex w-full flex-col items-center space-y-2 text-center">
            <Label>Enter 6-digit code from app</Label>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {error && (
            <p className="rounded-sm bg-red-50 p-2 text-center text-sm font-medium text-red-500 dark:bg-red-900/10">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )

  // --- MAIN RENDER ---
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <ActionButton
          label={factors.length > 0 ? 'Manage Devices' : 'Setup MFA'}
          disabled={loading && !open} // Disable while initializing on mount
        />
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>
            {view === 'loading' && 'Loading...'}
            {view === 'list' && 'Security Devices'}
            {view === 'enroll' && 'Add New Device'}
            {view === 'verify' && 'Verify Identity'}
          </DialogTitle>
          <DialogDescription>
            {view === 'loading' && 'Checking security status...'}
            {view === 'list' &&
              'Manage the authenticator devices linked to your account.'}
            {view === 'enroll' &&
              'Name your device, then scan the QR code to finish setup.'}
            {view === 'verify' &&
              'For security, verify your identity before making changes.'}
          </DialogDescription>
        </DialogHeader>

        {view === 'loading' ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {view === 'list' && renderList()}
            {view === 'enroll' && renderEnrollment()}
            {view === 'verify' && renderVerification()}
          </>
        )}

        <DialogFooter className="mt-2">
          {(view === 'enroll' || view === 'verify') && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  resetFlow()
                  setView(factors.length > 0 ? 'list' : 'enroll')
                }}
              >
                Cancel
              </Button>

              {/* Verify View Button */}
              {view === 'verify' && (
                <Button
                  onClick={handleGatekeeperVerify}
                  variant={'accent'}
                  disabled={loading || code.length < 6}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Confirm'
                  )}
                </Button>
              )}

              {/* Enroll View Button */}
              {view === 'enroll' && enrollStep === 'qr' && (
                <Button
                  onClick={handleVerifyEnroll}
                  disabled={loading || code.length < 6}
                  variant={'accent'}
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </Button>
              )}
            </>
          )}

          {view === 'list' && (
            <Button className="w-full sm:w-auto" onClick={() => setOpen(false)}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

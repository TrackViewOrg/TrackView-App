'use client'

import React, { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation' // 1. Import this
import { ArrowLeft, CircleQuestionMark, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { AuthLayout, HIGHLIGHT } from '@/components/auth/auth-components'
import { signout, verifyOtpForLogin } from '@/lib/auth/actions'
import { SupportDialog } from '@/components/dashboard/SupportDialog'
import { dashRoute } from '@/lib/constants'

export default function VerifyMfaPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // 2. Hook to read the URL parameters
  const searchParams = useSearchParams()
  // 3. Get the 'next' param (e.g., "/update-password") or default to dashboard
  const nextPath = searchParams.get('next') || dashRoute

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (code.length < 6) {
      setError('Please enter the full 6-digit code.')
      return
    }

    const formData = new FormData()
    formData.set('code', code)

    // 4. CRITICAL FIX: Pass the 'next' path to the server action
    formData.set('next', nextPath)

    startTransition(async () => {
      const result = await verifyOtpForLogin(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <AuthLayout
      quoteOverride={{
        id: 99,
        text: [
          'Head down, we are ',
          <span key="highlight" className={HIGHLIGHT}>
            checking
          </span>,
        ],
      }}
      tipOverride={
        'Hold position at the pit exit. We need to verify the transponder signal before releasing you onto the track.'
      }
      formPosition={'left'}
    >
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Two-Factor Authentication
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter the 6-digit code from your authenticator app.
        </p>
      </header>

      <div className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center space-y-6"
        >
          <div className="flex w-full justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-16 w-18.5 text-3xl data-[active=true]:border-[#dff976] data-[active=true]:ring-[#dff976]/60"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <div className="text-destructive bg-destructive/10 w-full rounded-md p-3 text-center text-sm font-medium">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="accent"
            className="h-11 w-full text-base"
            disabled={isPending || code.length < 6}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Verify Access'
            )}
          </Button>
        </form>

        <footer className="text-muted-foreground flex items-center justify-between text-center text-sm">
          <Button
            variant="link"
            type="button"
            className="group text-muted-foreground hover:text-foreground px-0 hover:bg-transparent"
            onClick={() => signout()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Login
          </Button>
          <SupportDialog>
            <Button
              variant="link"
              type="button"
              className="group text-muted-foreground hover:text-foreground px-0 hover:bg-transparent"
            >
              <CircleQuestionMark className="mr-2 h-4 w-4" />
              Request Support
            </Button>
          </SupportDialog>
        </footer>
      </div>
    </AuthLayout>
  )
}

'use client'

import React, { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, CircleQuestionMark, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AuthLayout,
  HIGHLIGHT,
  AuthErrorDisplay,
  AuthHeader,
  AuthFooterRow,
  AuthLinkButton,
} from '@/components/auth/auth-components'
import { AuthMfaInput } from '@/components/auth/auth-mfa-input'
import { signout, verifyOtpForLogin } from '@/lib/auth/actions'
import { SupportDialog } from '@/components/dashboard/SupportDialog'
import { dashRoute } from '@/lib/constants'

export default function VerifyMfaPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || dashRoute

  async function handleVerify(submittedCode?: string) {
    const codeToVerify = submittedCode || code

    if (codeToVerify.length < 6) {
      setError('Please enter the full 6-digit code.')
      return
    }

    setError(null)

    const formData = new FormData()
    formData.set('code', codeToVerify)
    formData.set('next', nextPath)

    startTransition(async () => {
      const result = await verifyOtpForLogin(formData)
      if (result?.error) {
        setError(result.error)
        setCode('') // Clear code on error so user can retry
      }
    })
  }

  // Auto-submit when 6th digit is entered
  const handleComplete = (completedCode: string) => {
    handleVerify(completedCode)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleVerify()
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
      <AuthHeader
        title="Two-Factor Authentication"
        subtitle="Enter the 6-digit code from your authenticator app."
      />

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthMfaInput
            value={code}
            onChange={setCode}
            onComplete={handleComplete}
            disabled={isPending}
            error={!!error}
          />

          <AuthErrorDisplay message={error || undefined} />

          <Button
            type="submit"
            variant="accent"
            className="h-11 w-full text-base"
            disabled={isPending || code.length < 6}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Access'
            )}
          </Button>
        </form>

        <AuthFooterRow>
          <AuthLinkButton onClick={() => signout()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Login
          </AuthLinkButton>
          <SupportDialog>
            <AuthLinkButton>
              <CircleQuestionMark className="mr-2 h-4 w-4" />
              Request Support
            </AuthLinkButton>
          </SupportDialog>
        </AuthFooterRow>
      </div>
    </AuthLayout>
  )
}

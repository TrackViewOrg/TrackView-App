'use client'

import React from 'react'
import Link from 'next/link'
import {
  AuthLayout,
  HIGHLIGHT,
  AuthLegalFooter,
  AuthLinkButton,
} from '@/components/auth/auth-components'
import { signinRoute } from '@/lib/constants'
import { ArrowLeft, Mail } from 'lucide-react'

export default function RegistrationSuccessPage() {
  return (
    <AuthLayout
      quoteOverride={{
        id: 100,
        text: [
          'The setup is complete. ',
          <span key="q1" className={HIGHLIGHT}>
            Time to hit the track
          </span>,
        ],
      }}
      tipOverride="Engine started. Waiting for the green flag. Check your inbox to confirm your email and unlock full access."
      formPosition="left"
    >
      <div className="space-y-8">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#dff976]/10 text-[#dff976]">
            <Mail className="h-10 w-10" />
          </div>
        </div>

        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Verify your email
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            We&apos;ve sent a verification link to your inbox. Please confirm
            your email address to unlock full access to the Trackview dashboard.
          </p>
        </div>

        <div className="border-border/50 bg-muted/20 space-y-2 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">
            <strong className="text-foreground">Didn&apos;t receive it?</strong>{' '}
            Check your spam folder or wait a few minutes.
          </p>
        </div>

        <div className="flex justify-center">
          <AuthLinkButton asChild>
            <Link href={signinRoute}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </AuthLinkButton>
        </div>

        <AuthLegalFooter className="pt-4" />
      </div>
    </AuthLayout>
  )
}

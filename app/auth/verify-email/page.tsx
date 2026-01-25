'use client'

import React, { useEffect, useState } from 'react'
import { ArrowLeft, CircleQuestionMark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ShootingStars from '@/components/StarBackground'
import { cn } from '@/lib/utils'
import Logo from '@/components/LogoAnimated'
import { SupportDialog } from '@/components/dashboard/SupportDialog'
import { signout } from '@/lib/auth/actions'

// --- CONTENT CONSTANTS ---

const HIGHLIGHT = 'text-[#dff976] italic'

const QUOTES = [
  {
    text: [
      'The setup is complete. ',
      <span key="q1" className={HIGHLIGHT}>
        Time to hit the track
      </span>,
    ],
  },
  {
    text: [
      'Engine started. ',
      <span key="q2" className={HIGHLIGHT}>
        Waiting for green flag
      </span>,
    ],
  },
]

// --- COMPONENT ---

export default function RegistrationSuccessPage() {
  const [mounted, setMounted] = useState(false)
  const [quote, setQuote] = useState<(typeof QUOTES)[0] | null>(null)

  useEffect(() => {
    // eslint-disable-next-line
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
    setMounted(true)
  }, [])

  return (
    <main className="font-archivo bg-background text-foreground relative flex h-screen w-full items-center justify-center overflow-hidden selection:text-black">
      {/* 1. Background Elements */}
      <ShootingStars />

      {/* Logo positioned absolute top-left or centered depending on your preference (kept default absolute) */}
      <Logo />

      {/* 2. Main Centered Content */}
      <div
        className={cn(
          'z-10 flex max-w-3xl flex-col items-center justify-center px-6 text-center transition-all duration-1000 ease-out',
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}
      >
        {/* Big Impact Quote */}
        <blockquote className="mb-12 font-serif text-6xl leading-tight font-light tracking-tight select-none md:text-8xl">
          {quote?.text.map((part, i) => (
            <React.Fragment key={i}>{part}</React.Fragment>
          ))}
        </blockquote>

        {/* Instruction Block */}
        <div className="animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards flex flex-col items-center gap-6 delay-300 duration-700">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-bold tracking-tight text-white/90">
              Verify your email
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed font-light">
              We&apos;ve sent a verification link to your inbox. Please confirm
              your email address to unlock full access to the Trackview
              dashboard.
            </p>
          </div>

          {/* Simple Back Action */}
          <footer className="text-muted-foreground flex w-full items-center justify-between pt-6 text-center text-sm">
            <Button
              variant="link"
              type="button"
              className="group text-muted-foreground hover:text-foreground px-0 hover:bg-transparent"
              onClick={() => signout()}
            >
              <ArrowLeft />
              Return to Login
            </Button>
            <SupportDialog>
              <Button
                variant="link"
                type="button"
                className="group text-muted-foreground hover:text-foreground px-0 hover:bg-transparent"
              >
                <CircleQuestionMark />
                Request Support
              </Button>
            </SupportDialog>
          </footer>
        </div>
      </div>
    </main>
  )
}

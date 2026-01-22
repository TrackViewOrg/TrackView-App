'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CircleQuestionMark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ShootingStars from '@/components/StarBackground'
import { cn } from '@/lib/utils'
import Logo from '@/components/LogoAnimated'
import { SupportDialog } from '@/components/dashboard/SupportDialog'

// --- CONTENT CONSTANTS ---

const HIGHLIGHT = 'text-[#dff976] italic'

const ERROR_QUOTES = [
  {
    text: [
      'Black and white flag shown. ',
      <span key="q1" className={HIGHLIGHT}>
        Track limits exceeded.
      </span>,
    ],
  },
  {
    text: [
      "You've missed the apex. ",
      <span key="q2" className={HIGHLIGHT}>
        You are off the track.
      </span>,
    ],
  },
]

// --- COMPONENT ---

export default function NotFoundPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [quote, setQuote] = useState<(typeof ERROR_QUOTES)[0] | null>(null)

  useEffect(() => {
    // eslint-disable-next-line
    setQuote(ERROR_QUOTES[Math.floor(Math.random() * ERROR_QUOTES.length)])
    setMounted(true)
  }, [])

  return (
    <main className="font-archivo bg-background text-foreground relative flex h-screen w-full items-center justify-center overflow-hidden selection:text-black">
      {/* 1. Background Elements */}
      <ShootingStars />
      <Logo />

      {/* 2. Main Centered Content */}
      <div
        className={cn(
          'z-10 flex max-w-4xl flex-col items-center justify-center px-6 text-center transition-all duration-1000 ease-out',
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}
      >
        {/* 404 Indicator */}
        <div className="border-border/40 bg-muted mb-6 flex items-center gap-2 rounded-sm border px-3 py-1 font-serif text-xl tracking-widest text-red-400 uppercase">
          <span>404</span>
        </div>

        {/* Big Impact Quote */}
        <blockquote className="text-foreground mb-5 max-w-5/6 font-serif text-5xl leading-tight font-light tracking-tight select-none md:text-7xl">
          {quote?.text.map((part, i) => (
            <React.Fragment key={i}>{part}</React.Fragment>
          ))}
        </blockquote>

        {/* Instruction Block */}
        <div className="animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards flex flex-col items-center gap-4 delay-300 duration-700">
          <div className="max-w-md space-y-2">
            <p className="text-muted-foreground text-base leading-relaxed font-light">
              The requested URL does not exist on this server. <br />
              Let&apos;s get you back to the racing line.
            </p>
          </div>

          {/* Navigation Actions */}
          <footer className="flex w-full items-center justify-center gap-8 pt-6 text-sm">
            <Button
              variant="link"
              type="button"
              className="group text-muted-foreground px-0 transition-colors hover:text-[#dff976]"
              onClick={() => router.back()}
            >
              <ArrowLeft />
              Return to Previous Page
            </Button>

            <SupportDialog>
              <Button
                variant="link"
                type="button"
                className="group text-muted-foreground hover:text-foreground px-0"
              >
                <CircleQuestionMark />
                Report Bug
              </Button>
            </SupportDialog>
          </footer>
        </div>
      </div>
    </main>
  )
}

'use client'

import React, { useState, useEffect, useMemo, JSX } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Control, FieldValues, Path } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import ShootingStars from '@/components/StarBackground'
import { cn } from '@/lib/utils'
import Logo from '@/components/LogoAnimated'

// --- TYPES ---

interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
}

interface PasswordFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  forgotPasswordLink?: React.ReactNode
}

export interface Catchphrase {
  id: number
  text: (string | JSX.Element)[]
}

// --- DATA CONSTANTS ---

export const HIGHLIGHT = 'text-[#dff976] italic'

const CATCHPHRASES: Catchphrase[] = [
  {
    id: 1,
    text: [
      'Stop ',
      <span key="c1-1" className={HIGHLIGHT}>
        guessing
      </span>,
      ' your mistakes and start ',
      <span key="c1-2" className={HIGHLIGHT}>
        fixing them
      </span>,
    ],
  },
  {
    id: 2,
    text: [
      <span key="c2-1" className={HIGHLIGHT}>
        Bridge the gap
      </span>,
      ' between your intuition and reality',
    ],
  },
  {
    id: 3,
    text: [
      'Unlock the ',
      <span key="c3-1" className={HIGHLIGHT}>
        hidden pace
      </span>,
      ' that average drivers miss',
    ],
  },
  {
    id: 4,
    text: [
      'Turn a single fast lap into ',
      <span key="c4-1" className={HIGHLIGHT}>
        consistent, dominant pace
      </span>,
    ],
  },
  {
    id: 5,
    text: [
      'See the invisible mistakes ',
      <span key="c5-1" className={HIGHLIGHT}>
        costing you vital time
      </span>,
    ],
  },
  {
    id: 6,
    text: [
      'Master your inputs, optimize your lines, ',
      <span key="c6-1" className={HIGHLIGHT}>
        redefine your limits
      </span>,
    ],
  },
  {
    id: 7,
    text: [
      'The data tells a story, ',
      <span key="c7-1" className={HIGHLIGHT}>
        learn to read it
      </span>,
    ],
  },
  {
    id: 8,
    text: [
      'Transform raw inputs into ',
      <span key="c8-1" className={HIGHLIGHT}>
        championship defining
      </span>,
      ' excellence',
    ],
  },
]

const RACING_TIPS = [
  'Analysis cuts braking errors by 35% in 5 sessions. Stop guessing, use our tools to unlock your potential.',
  'Coasting costs 1.5s per lap on average. Stop hesitating, let our data prove exactly where to stay on the gas.',
  '80% of amateur time loss is at corner entry. Stop chasing top speed, use our tools to fix your transition today.',
  'The 5°C optimal tire window yields 0.4s free pace. Stop burning grip, use our stats to master your aggression.',
  'Short-shifting prevents 90% of traction loss events. Stop fighting the wheel, use our analysis to perfect your exits.',
  'Pros deviate less than 2% from the racing line. Stop the randomness, drive with intent.',
]

// --- UTILS ---

export const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0
  let score = 0
  if (password.length > 6) score += 1
  if (password.length > 10) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

// --- COMPONENTS ---

interface AuthLayoutProps {
  children: React.ReactNode
  formPosition?: 'left' | 'right'
  quoteOverride?: string | Catchphrase
  tipOverride?: string
}

export function AuthLayout({
  children,
  formPosition = 'right',
  quoteOverride,
  tipOverride,
}: AuthLayoutProps) {
  const layoutDirection =
    formPosition === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'
  const borderClass = formPosition === 'left' ? 'border-r' : 'border-l'

  // Lazy initialization ensures random values are set once on component creation
  // and stay consistent through the component's lifecycle.
  const [randomValues] = useState(() => ({
    headline: CATCHPHRASES[Math.floor(Math.random() * CATCHPHRASES.length)],
    tip: RACING_TIPS[Math.floor(Math.random() * RACING_TIPS.length)],
  }))

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Using requestAnimationFrame moves the state update outside the synchronous render loop
    // satisfying strict "no-cascading-renders" ESLint rules.
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const content = useMemo(() => {
    const headline = quoteOverride
      ? typeof quoteOverride === 'string'
        ? { id: 999, text: [quoteOverride] }
        : quoteOverride
      : randomValues.headline

    const tip = tipOverride || randomValues.tip
    return { headline, tip }
  }, [quoteOverride, tipOverride, randomValues])

  return (
    <main
      className={cn(
        'font-archivo relative flex h-full w-full items-center justify-center overflow-hidden',
        layoutDirection
      )}
    >
      <ShootingStars />
      <Logo />

      <section className="z-10 hidden h-full w-5/7 flex-col justify-center px-24 md:flex">
        <div
          className={cn(
            'text-foreground max-w-3xl space-y-6 transition-opacity duration-700 select-none',
            mounted
              ? 'animate-in fade-in slide-in-from-left-4 opacity-100'
              : 'opacity-0'
          )}
        >
          <blockquote className="font-serif text-8xl font-light">
            {content.headline.text.map((part, i) => (
              <React.Fragment key={i}>{part}</React.Fragment>
            ))}
          </blockquote>
          <div className="border-primary/10 space-y-2 border-l-2 pl-3">
            <p className="text-md text-muted-foreground max-w-lg font-light">
              {content.tip}
            </p>
          </div>
        </div>
      </section>

      <section
        className={cn(
          'bg-background/80 z-10 flex h-full w-full flex-col justify-center px-8 py-12 backdrop-blur-sm md:w-2/5 md:px-20',
          borderClass
        )}
      >
        <div className="mx-auto w-full max-w-md">{children}</div>
      </section>
    </main>
  )
}

export function FormInputField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
}: BaseFieldProps<T> & { type?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              className="h-11"
              placeholder={placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function PasswordWithStrength<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
}: BaseFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const strength = calculatePasswordStrength(field.value || '')
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  {...field}
                  className="h-11"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={placeholder}
                />
              </FormControl>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="mt-2 flex h-1 w-full gap-1">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={cn(
                    'h-full flex-1 rounded-full transition-colors duration-300',
                    step <= strength
                      ? strength <= 2
                        ? 'bg-destructive'
                        : strength <= 4
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      : 'bg-muted'
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export function FormPasswordField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  forgotPasswordLink,
}: PasswordFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>{label}</FormLabel>
            {forgotPasswordLink}
          </div>
          <div className="relative">
            <FormControl>
              <Input
                {...field}
                className="h-11"
                type={showPassword ? 'text' : 'password'}
                placeholder={placeholder}
              />
            </FormControl>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function GoogleButton({
  children,
  onClickAction,
}: {
  children: React.ReactNode
  onClickAction?: () => void
}) {
  return (
    <Button
      variant="secondary"
      className="flex h-11 w-full gap-3"
      type="button"
      onClick={onClickAction}
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {children}
    </Button>
  )
}

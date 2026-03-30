'use client'

import { useEffect, useRef } from 'react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { cn } from '@/lib/utils'

interface AuthMfaInputProps {
  value: string
  onChange: (value: string) => void
  onComplete?: (code: string) => void
  disabled?: boolean
  error?: boolean
  className?: string
}

const AUTH_MFA_SLOT_CLASS =
  'h-12 w-10 text-xl sm:h-14 sm:w-12 sm:text-2xl md:h-16 md:w-14 md:text-3xl data-[active=true]:border-[#dff976] data-[active=true]:ring-[#dff976]/60'

export function AuthMfaInput({
  value,
  onChange,
  onComplete,
  disabled,
  error,
  className,
}: AuthMfaInputProps) {
  const hasCalledComplete = useRef(false)

  useEffect(() => {
    if (value.length === 6 && onComplete && !hasCalledComplete.current) {
      hasCalledComplete.current = true
      const timer = setTimeout(() => {
        onComplete(value)
      }, 100)
      return () => clearTimeout(timer)
    }

    if (value.length < 6) {
      hasCalledComplete.current = false
    }
  }, [value, onComplete])

  return (
    <div className={cn('flex w-full justify-center', className)}>
      <InputOTP
        maxLength={6}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        <InputOTPGroup className="gap-2 sm:gap-3">
          {[...Array(6)].map((_, index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className={cn(AUTH_MFA_SLOT_CLASS, error && 'border-destructive')}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  )
}

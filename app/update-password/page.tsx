'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { CircleQuestionMark, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  AuthLayout,
  FormPasswordField,
  HIGHLIGHT,
  PasswordWithStrength,
} from '@/components/auth/auth-components'
import { SupportDialog } from '@/components/dashboard/SupportDialog'
import { updatePasswordAction } from '@/lib/auth/actions'
import { toast } from 'sonner'
import { dashRoute } from '@/lib/constants'

// 1. Strict Password Validation Schema
const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password cannot exceed 72 characters')
      .regex(/[A-Z]/, 'Must contain one uppercase letter')
      .regex(/[a-z]/, 'Must contain one lowercase letter')
      .regex(/[0-9]/, 'Must contain one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>

export default function UpdatePasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (values: UpdatePasswordValues) => {
    setIsLoading(true)

    // Call server action to update the authenticated user's password
    const result = await updatePasswordAction(values.password)

    if (result?.error) {
      form.setError('root', { message: result.error })
      setIsLoading(false)
    } else {
      setIsLoading(false)
      toast.success('Password Changed Successfully !')
      router.push(dashRoute)
    }
  }
  // 3. Form View
  return (
    <AuthLayout
      quoteOverride={{
        id: 99,
        text: [
          "Don't let a lockout ",
          <span key="fp3-1" className={HIGHLIGHT}>
            cost you the lap
          </span>,
        ],
      }}
      tipOverride={
        "Choose a password that can handle the pressure, and we'll clear you for the next session."
      }
    >
      <header className="font-archivo mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Set new password
        </h1>
        <p className="text-muted-foreground text-sm">
          Please create a new password for your account.
        </p>
      </header>

      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {form.formState.errors.root && (
              <div className="text-destructive bg-destructive/10 rounded-md p-3 text-sm font-medium">
                {form.formState.errors.root.message}
              </div>
            )}

            <PasswordWithStrength
              control={form.control}
              name="password"
              label="New Password"
              placeholder="Min. 8 characters"
            />

            <FormPasswordField
              control={form.control}
              name="confirmPassword"
              label="Confirm New Password"
              placeholder="Repeat new password"
            />

            <Button
              type="submit"
              variant={'accent'}
              className="h-11 w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </Form>

        <footer
          className={
            'text-muted-foreground flex items-center justify-center text-center text-sm'
          }
        >
          <SupportDialog>
            <Button
              variant="link"
              className="group text-muted-foreground hover:text-foreground hover:bg-transparent"
            >
              <CircleQuestionMark />
              Request Support
            </Button>
          </SupportDialog>
        </footer>
      </div>
    </AuthLayout>
  )
}

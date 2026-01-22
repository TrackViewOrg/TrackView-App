'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  AuthLayout,
  FormInputField,
  FormPasswordField,
  PasswordWithStrength,
  GoogleButton,
} from '@/components/auth/auth-components'
import Link from 'next/link'
import { handleGoogleLogin, handleSignup } from '@/lib/auth/actions'
import { SupportDialog } from '@/components/dashboard/SupportDialog'
import { CircleQuestionMark } from 'lucide-react'
import { signinRoute } from '@/lib/constants'
import { toast } from 'sonner'

// 1. Schema reduced to essential inputs
const signUpSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
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

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true)

    const derivedUsername = values.email.split('@')[0]

    const result = await handleSignup({
      email: values.email,
      password: values.password,
      username: derivedUsername,
    })

    if (result?.error) {
      form.setError('root', { message: result.error })
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success('Account created! Check your email to verify.')
    }
  }

  return (
    <AuthLayout>
      <header className="font-archivo mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your details to get started
        </p>
      </header>

      <div className="space-y-6">
        <GoogleButton onClickAction={handleGoogleLogin}>
          Sign up with Google
        </GoogleButton>

        <div className="relative flex items-center gap-4">
          <div className="bg-border h-px flex-grow" />
          <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase select-none">
            OR
          </span>
          <div className="bg-border h-px flex-grow" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInputField
              control={form.control}
              name="email"
              label="Email"
              placeholder="me@example.com"
            />

            <PasswordWithStrength
              control={form.control}
              name="password"
              label="Password"
              placeholder="Min. 8 characters with numbers"
            />

            <FormPasswordField
              control={form.control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Repeat password"
            />

            <Button
              type="submit"
              variant={'accent'}
              className="h-11 w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </Form>

        <footer
          className={
            'text-muted-foreground flex items-center justify-between text-center text-sm'
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
          <span className="">
            Already have an account?{' '}
            <Link
              href={signinRoute}
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </span>
        </footer>
      </div>
    </AuthLayout>
  )
}

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CircleQuestionMark, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  AuthLayout,
  FormInputField,
  FormPasswordField,
  GoogleButton,
} from '@/components/auth/auth-components'
import { handleGoogleLogin, signin } from '@/lib/auth/actions'
import { SupportDialog } from '@/components/dashboard/SupportDialog'
import {
  forgotPasswordRoute,
  privacyRoute,
  signupRoute,
  termsRoute,
} from '@/lib/constants'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Invalid Password'),
})

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true)

    // 1. Call the action and capture the returned object
    const result = await signin(values.email, values.password)

    // 2. Check if the result exists and has an error string
    if (result?.error) {
      form.setError('root', {
        // result.error is already the string message here
        message: result.error,
      })
      setIsLoading(false)
    }
    // If no error, the server action handles the redirect internally
  }

  return (
    <AuthLayout>
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground text-sm">
          Please login to your account
        </p>
      </header>

      <footer className="space-y-6">
        <GoogleButton onClickAction={handleGoogleLogin}>
          Continue with Google
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
            {form.formState.errors.root && (
              <div className="text-destructive bg-destructive/10 rounded-md p-3 text-sm font-medium">
                {form.formState.errors.root.message}
              </div>
            )}

            <FormInputField
              control={form.control}
              name="email"
              label="Email"
              placeholder="me@example.com"
            />

            <FormPasswordField
              control={form.control}
              name="password"
              label="Password"
              placeholder="••••••••"
              forgotPasswordLink={
                <Link
                  href={forgotPasswordRoute}
                  className="text-muted-foreground text-xs hover:underline"
                >
                  Forgot Password?
                </Link>
              }
            />

            <Button
              type="submit"
              variant={'accent'}
              className="h-11 w-full text-base"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </Form>

        <footer
          className={
            'text-muted-foreground flex w-full items-center justify-between !px-0 text-center text-sm'
          }
        >
          <SupportDialog>
            <Button
              variant="link"
              className="group text-muted-foreground hover:text-foreground !m-0 !p-0 hover:bg-transparent"
            >
              <CircleQuestionMark />
              Request Support
            </Button>
          </SupportDialog>
          <span className="">
            Don&apos;t have an account?{' '}
            <Link
              href={signupRoute}
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </span>
        </footer>
        <footer
          className={
            'text-muted-foreground/50 flex w-full items-center justify-between !px-0 text-center text-xs'
          }
        >
          <span className="">
            <Link href={termsRoute} className="">
              Terms Of Service
            </Link>
          </span>
          <span className="">
            <Link href={privacyRoute} className="">
              Privacy Policy
            </Link>
          </span>
        </footer>
      </footer>
    </AuthLayout>
  )
}

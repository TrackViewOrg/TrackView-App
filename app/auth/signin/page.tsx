'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CircleQuestionMark } from 'lucide-react'
import { Form } from '@/components/ui/form'
import {
  AuthLayout,
  FormInputField,
  FormPasswordField,
  GoogleButton,
  OAuthDivider,
  AuthErrorDisplay,
  AuthSubmitButton,
  AuthLegalFooter,
  AuthHeader,
  AuthFooterRow,
  AuthCompactLinkButton,
} from '@/components/auth/auth-components'
import { handleGoogleLogin, signin } from '@/lib/auth/actions'
import { SupportDialog } from '@/components/dashboard/SupportDialog'
import { forgotPasswordRoute, signupRoute } from '@/lib/constants'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Invalid Password'),
})

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true)

    const result = await signin(values.email, values.password)

    if (result?.error) {
      form.setError('root', {
        message: result.error,
      })
      setIsLoading(false)
    }
    // If no error, the server action handles the redirect internally
  }

  const focusPassword = () => {
    // Focus the password field when Enter is pressed on email
    const passwordInput = formRef.current?.querySelector<HTMLInputElement>(
      'input[type="password"]'
    )
    passwordInput?.focus()
  }

  const submitForm = () => {
    formRef.current?.requestSubmit()
  }

  return (
    <AuthLayout>
      <AuthHeader
        title="Welcome Back"
        subtitle="Please login to your account"
      />

      <div className="space-y-6">
        <GoogleButton onClickAction={handleGoogleLogin}>
          Continue with Google
        </GoogleButton>

        <OAuthDivider />

        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <AuthErrorDisplay message={form.formState.errors.root?.message} />

            <FormInputField
              control={form.control}
              name="email"
              label="Email"
              placeholder="me@example.com"
              onEnterKey={focusPassword}
            />

            <FormPasswordField
              control={form.control}
              name="password"
              label="Password"
              placeholder="••••••••"
              onEnterKey={submitForm}
              forgotPasswordLink={
                <Link
                  href={forgotPasswordRoute}
                  className="text-muted-foreground text-xs hover:underline"
                >
                  Forgot Password?
                </Link>
              }
            />

            <AuthSubmitButton isLoading={isLoading}>Sign In</AuthSubmitButton>
          </form>
        </Form>

        <AuthFooterRow className="w-full">
          <SupportDialog>
            <AuthCompactLinkButton>
              <CircleQuestionMark />
              Request Support
            </AuthCompactLinkButton>
          </SupportDialog>
          <span>
            Don&apos;t have an account?{' '}
            <Link
              href={signupRoute}
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </span>
        </AuthFooterRow>

        <AuthLegalFooter />
      </div>
    </AuthLayout>
  )
}

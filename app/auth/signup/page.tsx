'use client'

import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { CircleQuestionMark } from 'lucide-react'
import { toast } from 'sonner'

import { Form } from '@/components/ui/form'
import {
  AuthLayout,
  FormInputField,
  FormPasswordField,
  GoogleButton,
  PasswordWithStrength,
  OAuthDivider,
  AuthSubmitButton,
  AuthLegalFooter,
  AuthHeader,
  AuthErrorDisplay,
  AuthFooterRow,
  AuthCompactLinkButton,
} from '@/components/auth/auth-components'
import { handleGoogleLogin, handleSignup } from '@/lib/auth/actions'
import { SupportDialog } from '@/components/dashboard/SupportDialog'
import { signinRoute } from '@/lib/constants'

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
  const formRef = useRef<HTMLFormElement>(null)

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

  const focusField = (selector: string) => {
    const input = formRef.current?.querySelector<HTMLInputElement>(selector)
    input?.focus()
  }

  const submitForm = () => {
    formRef.current?.requestSubmit()
  }

  return (
    <AuthLayout>
      <AuthHeader
        title="Create an account"
        subtitle="Enter your details to get started"
      />

      <div className="space-y-6">
        <GoogleButton onClickAction={handleGoogleLogin}>
          Sign up with Google
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
              onEnterKey={() => focusField('input[name="password"]')}
            />

            <PasswordWithStrength
              control={form.control}
              name="password"
              label="Password"
              placeholder="Min. 8 characters with numbers"
              onEnterKey={() => focusField('input[name="confirmPassword"]')}
            />

            <FormPasswordField
              control={form.control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Repeat password"
              onEnterKey={submitForm}
            />

            <AuthSubmitButton
              isLoading={isLoading}
              loadingText="Creating account..."
            >
              Create Account
            </AuthSubmitButton>
          </form>
        </Form>

        <AuthFooterRow>
          <SupportDialog>
            <AuthCompactLinkButton>
              <CircleQuestionMark />
              Request Support
            </AuthCompactLinkButton>
          </SupportDialog>
          <span>
            Already have an account?{' '}
            <Link
              href={signinRoute}
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </span>
        </AuthFooterRow>

        <AuthLegalFooter />
      </div>
    </AuthLayout>
  )
}

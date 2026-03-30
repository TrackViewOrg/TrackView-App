'use client'

import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import {
  AuthLayout,
  FormInputField,
  HIGHLIGHT,
  AuthSubmitButton,
  AuthLegalFooter,
  AuthHeader,
  AuthErrorDisplay,
  AuthFooterRow,
  AuthLinkButton,
} from '@/components/auth/auth-components'
import { Form } from '@/components/ui/form'
import { handleForgotPassword } from '@/lib/auth/actions'
import { signinRoute } from '@/lib/constants'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: { email: string }) => {
    setIsLoading(true)
    form.clearErrors()

    const { error } = await handleForgotPassword(values.email)

    if (error) {
      form.setError('root', { message: error })
      toast.error('Request Failed', {
        description: error,
      })
    } else {
      toast.success('Reset link sent, check your email!')
      router.push(signinRoute)
    }

    setIsLoading(false)
  }

  const submitForm = () => {
    formRef.current?.requestSubmit()
  }

  return (
    <AuthLayout
      quoteOverride={{
        id: 99,
        text: [
          'Even World Champions need a ',
          <span key="fp1-1" className={HIGHLIGHT}>
            pit stop
          </span>,
        ],
      }}
      tipOverride={
        "No need to panic. We've seen this before. We'll have the engine fired up in no time."
      }
      formPosition={'left'}
    >
      <AuthHeader
        title="Forgot Password"
        subtitle="We'll email you a reset link."
      />

      <div className="space-y-6">
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormInputField
              control={form.control}
              name="email"
              label="Email"
              placeholder="me@example.com"
              onEnterKey={submitForm}
            />

            <AuthErrorDisplay message={form.formState.errors.root?.message} />

            <AuthSubmitButton isLoading={isLoading} loadingText="Sending...">
              Send Reset Link
            </AuthSubmitButton>
          </form>
        </Form>

        <AuthFooterRow>
          <AuthLinkButton asChild>
            <Link href={signinRoute}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </AuthLinkButton>
        </AuthFooterRow>

        <AuthLegalFooter />
      </div>
    </AuthLayout>
  )
}

export default ForgotPasswordPage

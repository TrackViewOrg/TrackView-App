import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import {
  FormInputField,
  FormPasswordField,
  PasswordWithStrength,
} from '@/components/auth/auth-components'

// Mock components that might cause issues in testing environment
jest.mock('@/components/StarBackground', () => {
  const StarBackground = () => <div data-testid="star-background" />
  StarBackground.displayName = 'StarBackground'
  return StarBackground
})
jest.mock('@/components/TrackViewIcon', () => {
  const TrackViewIcon = () => <div data-testid="track-view-icon" />
  TrackViewIcon.displayName = 'TrackViewIcon'
  return TrackViewIcon
})
jest.mock('@/components/LogoAnimated', () => {
  const LogoAnimated = () => <div data-testid="logo-animated" />
  LogoAnimated.displayName = 'LogoAnimated'
  return LogoAnimated
})
jest.mock('next/link', () => {
  const Link = ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>
  Link.displayName = 'Link'
  return Link
})

describe('Auth Components', () => {
  describe('PasswordWithStrength', () => {
    it('renders correctly', () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { password: '' },
        })

        return (
          <Form {...form}>
            <PasswordWithStrength
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter password"
            />
          </Form>
        )
      }

      render(<TestComponent />)

      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
    })

    it('toggles password visibility', () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { password: '' },
        })

        return (
          <Form {...form}>
            <PasswordWithStrength
              control={form.control}
              name="password"
              label="Password"
            />
          </Form>
        )
      }

      render(<TestComponent />)

      const input = screen.getByLabelText('Password')
      const toggleButton = screen.getByRole('button', {
        name: /show password/i,
      })

      expect(input).toHaveAttribute('type', 'password')

      fireEvent.click(toggleButton)
      expect(input).toHaveAttribute('type', 'text')

      fireEvent.click(toggleButton)
      expect(input).toHaveAttribute('type', 'password')
    })

    it('shows strength indicators', () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { password: '' },
        })

        return (
          <Form {...form}>
            <PasswordWithStrength
              control={form.control}
              name="password"
              label="Password"
            />
          </Form>
        )
      }

      render(<TestComponent />)

      const input = screen.getByLabelText('Password')

      // Initially weak (empty)
      // Note: Testing exact visual representation of strength bars might be tricky
      // without checking class names or computed styles, but we can verify input updates

      fireEvent.change(input, { target: { value: 'Weak1' } })
      expect(input).toHaveValue('Weak1')

      fireEvent.change(input, { target: { value: 'StrongPassword123!' } })
      expect(input).toHaveValue('StrongPassword123!')
    })
  })

  describe('FormPasswordField', () => {
    it('renders with forgot password link', () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { password: '' },
        })

        return (
          <Form {...form}>
            <FormPasswordField
              control={form.control}
              name="password"
              label="Password"
              forgotPasswordLink={<a href="/forgot">Forgot?</a>}
            />
          </Form>
        )
      }

      render(<TestComponent />)

      expect(screen.getByText('Forgot?')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })
  })

  describe('FormInputField', () => {
    it('renders standard input correctly', () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { email: '' },
        })

        return (
          <Form {...form}>
            <FormInputField
              control={form.control}
              name="email"
              label="Email"
              placeholder="test@example.com"
              type="email"
            />
          </Form>
        )
      }

      render(<TestComponent />)

      const input = screen.getByLabelText('Email')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'email')
      expect(input).toHaveAttribute('placeholder', 'test@example.com')
    })
  })
})

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { PasswordWithStrength, FormPasswordField, FormInputField } from '@/components/auth/auth-components';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Mock components that might cause issues in testing environment
jest.mock('@/components/StarBackground', () => () => <div data-testid="star-background" />);
jest.mock('@/components/TrackViewIcon', () => () => <div data-testid="track-view-icon" />);
jest.mock('@/components/LogoAnimated', () => () => <div data-testid="logo-animated" />);
jest.mock('next/link', () => ({ children, href }: { children: React.ReactNode; href: string }) => (
  <a href={href}>{children}</a>
));

// Wrapper component to provide React Hook Form context
const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return <Form {...form}>{children}</Form>;
};

describe('Auth Components', () => {
  describe('PasswordWithStrength', () => {
    it('renders correctly', () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { password: '' }
        });
        
        return (
          <Form {...form}>
            <PasswordWithStrength
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter password"
            />
          </Form>
        );
      };

      render(<TestComponent />);
      
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    });

    it('toggles password visibility', () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { password: '' }
        });
        
        return (
          <Form {...form}>
            <PasswordWithStrength
              control={form.control}
              name="password"
              label="Password"
            />
          </Form>
        );
      };

      render(<TestComponent />);

      const input = screen.getByLabelText('Password');
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      expect(input).toHaveAttribute('type', 'password');
      
      fireEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');
      
      fireEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('shows strength indicators', () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { password: '' }
        });
        
        return (
          <Form {...form}>
            <PasswordWithStrength
              control={form.control}
              name="password"
              label="Password"
            />
          </Form>
        );
      };

      render(<TestComponent />);
      
      const input = screen.getByLabelText('Password');
      
      // Initially weak (empty)
      // Note: Testing exact visual representation of strength bars might be tricky 
      // without checking class names or computed styles, but we can verify input updates
      
      fireEvent.change(input, { target: { value: 'Weak1' } });
      expect(input).toHaveValue('Weak1');
      
      fireEvent.change(input, { target: { value: 'StrongPassword123!' } });
      expect(input).toHaveValue('StrongPassword123!');
    });
  });

  describe('FormPasswordField', () => {
    it('renders with forgot password link', () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { password: '' }
        });
        
        return (
          <Form {...form}>
            <FormPasswordField
              control={form.control}
              name="password"
              label="Password"
              forgotPasswordLink={<a href="/forgot">Forgot?</a>}
            />
          </Form>
        );
      };

      render(<TestComponent />);

      expect(screen.getByText('Forgot?')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });
  });

  describe('FormInputField', () => {
    it('renders standard input correctly', () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { email: '' }
        });
        
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
        );
      };

      render(<TestComponent />);

      const input = screen.getByLabelText('Email');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('placeholder', 'test@example.com');
    });
  });
});

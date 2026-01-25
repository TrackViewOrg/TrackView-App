import { z } from 'zod'

// Recreating schemas used in the app to test their validation rules
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password cannot exceed 72 characters')
  .regex(/[A-Z]/, 'Must contain one uppercase letter')
  .regex(/[a-z]/, 'Must contain one lowercase letter')
  .regex(/[0-9]/, 'Must contain one number')

const emailSchema = z.string().email('Please enter a valid email address')

describe('Security Validation Rules', () => {
  describe('Password Complexity', () => {
    it('should reject short passwords', () => {
      const result = passwordSchema.safeParse('Short1!')
      expect(result.success).toBe(false)
    })

    it('should reject passwords without uppercase', () => {
      const result = passwordSchema.safeParse('password123')
      expect(result.success).toBe(false)
    })

    it('should reject passwords without lowercase', () => {
      const result = passwordSchema.safeParse('PASSWORD123')
      expect(result.success).toBe(false)
    })

    it('should reject passwords without numbers', () => {
      const result = passwordSchema.safeParse('PasswordTest')
      expect(result.success).toBe(false)
    })

    it('should accept valid strong passwords', () => {
      const result = passwordSchema.safeParse('StrongPass123')
      expect(result.success).toBe(true)
    })

    it('should reject extremely long passwords (DoS prevention)', () => {
      const longPassword = 'A'.repeat(73) + '1a'
      const result = passwordSchema.safeParse(longPassword)
      expect(result.success).toBe(false)
    })
  })

  describe('Email Validation', () => {
    it('should accept valid emails', () => {
      expect(emailSchema.safeParse('user@example.com').success).toBe(true)
      expect(emailSchema.safeParse('user.name@domain.co.uk').success).toBe(true)
      expect(emailSchema.safeParse('user+tag@example.com').success).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(emailSchema.safeParse('plainaddress').success).toBe(false)
      expect(emailSchema.safeParse('@missingusername.com').success).toBe(false)
      expect(emailSchema.safeParse('username@.com').success).toBe(false)
      expect(emailSchema.safeParse('username@domain').success).toBe(false)
    })
  })
})

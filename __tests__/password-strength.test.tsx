import React from 'react'
import { calculatePasswordStrength } from '@/components/auth/auth-components'

// Mock components that might cause issues in testing environment
jest.mock('@/components/StarBackground', () => {
  const StarBackground = () => <div>StarBackground</div>
  StarBackground.displayName = 'StarBackground'
  return StarBackground
})
jest.mock('@/components/TrackViewIcon', () => {
  const TrackViewIcon = () => <div>TrackViewIcon</div>
  TrackViewIcon.displayName = 'TrackViewIcon'
  return TrackViewIcon
})
jest.mock('@/components/LogoAnimated', () => {
  const LogoAnimated = () => <div>LogoAnimated</div>
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

describe('calculatePasswordStrength', () => {
  it('should return 0 for empty password', () => {
    expect(calculatePasswordStrength('')).toBe(0)
  })

  it('should calculate score correctly based on criteria', () => {
    // Base score is 0

    // Length > 6 (+1)
    expect(calculatePasswordStrength('abcdefg')).toBe(1)

    // Length > 10 (+1, cumulative with >6 so +2 total if only length matters, but regexes fail)
    // Let's test specific combinations

    // Just length > 6
    expect(calculatePasswordStrength('abcdefg')).toBe(1)

    // Length > 10
    expect(calculatePasswordStrength('abcdefghijk')).toBe(2)

    // Uppercase (+1)
    expect(calculatePasswordStrength('A')).toBe(1)

    // Number (+1)
    expect(calculatePasswordStrength('1')).toBe(1)

    // Special char (+1)
    expect(calculatePasswordStrength('!')).toBe(1)

    // Combined: Length > 6 + Uppercase
    expect(calculatePasswordStrength('Abcdefg')).toBe(2)

    // Combined: Length > 10 + Uppercase + Number
    expect(calculatePasswordStrength('Abcdefghijk1')).toBe(4)

    // Max score: Length > 10 + Uppercase + Number + Special
    expect(calculatePasswordStrength('Abcdefghijk1!')).toBe(5)
  })
})

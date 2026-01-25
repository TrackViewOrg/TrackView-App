import {
  authRoute,
  callbackRoute,
  carsRoute,
  dashRoute,
  forgotPasswordRoute,
  homeRoute,
  leaderboardRoute,
  sessionsRoute,
  settingsAccountRoute,
  settingsDataRoute,
  settingsSecurityRoute,
  settingsSubscriptionRoute,
  signinRoute,
  signupRoute,
  statisticsRoute,
  tracksRoute,
  updatePasswordRoute,
  verifyEmailRoute,
  verifyMfaRoute,
} from '@/lib/constants'

describe('Application Constants', () => {
  it('should have correct route paths', () => {
    expect(homeRoute).toBe('/')
    expect(signinRoute).toBe('/auth/signin')
    expect(signupRoute).toBe('/auth/signup')
    expect(authRoute).toBe('/auth')
    expect(dashRoute).toBe('/dashboard')
    expect(forgotPasswordRoute).toBe('/auth/forgot')
    expect(verifyMfaRoute).toBe('/auth/verify-mfa')
    expect(updatePasswordRoute).toBe('/update-password')
    expect(verifyEmailRoute).toBe('/auth/verify-email')
    expect(callbackRoute).toBe('/auth/callback')

    // Dashboard sub-routes
    expect(settingsAccountRoute).toBe('/dashboard/account')
    expect(settingsSecurityRoute).toBe('/dashboard/security')
    expect(settingsDataRoute).toBe('/dashboard/data')
    expect(settingsSubscriptionRoute).toBe('/dashboard/subscription')
    expect(sessionsRoute).toBe('/dashboard/sessions')
    expect(statisticsRoute).toBe('/dashboard/stats')
    expect(leaderboardRoute).toBe('/dashboard/leaderboard')

    // Other main routes
    expect(tracksRoute).toBe('/tracks')
    expect(carsRoute).toBe('/cars')
  })

  it('should not have duplicate route paths', () => {
    const allRoutes = [
      homeRoute,
      signinRoute,
      signupRoute,
      authRoute,
      dashRoute,
      forgotPasswordRoute,
      verifyMfaRoute,
      updatePasswordRoute,
      verifyEmailRoute,
      callbackRoute,
      settingsAccountRoute,
      settingsSecurityRoute,
      settingsDataRoute,
      settingsSubscriptionRoute,
      sessionsRoute,
      statisticsRoute,
      leaderboardRoute,
      tracksRoute,
      carsRoute,
    ]

    const uniqueRoutes = new Set(allRoutes)
    expect(uniqueRoutes.size).toBe(allRoutes.length)
  })
})

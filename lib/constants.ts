/**
 * Application route constants.
 * These constants define the paths used for navigation within the application.
 * Using constants helps prevent typos and makes refactoring routes easier.
 */

// Public routes
export const homeRoute = '/'

// Authentication routes
export const privacyRoute = '/legal/privacy'
export const termsRoute = '/legal/terms'
export const signinRoute = '/auth/signin'
export const signupRoute = '/auth/signup'
export const authRoute = '/auth'
export const forgotPasswordRoute = '/auth/forgot'
export const verifyMfaRoute = '/auth/verify-mfa'
export const verifyEmailRoute = '/auth/verify-email'
export const callbackRoute = '/auth/callback'
export const updatePasswordRoute = '/update-password'

// Dashboard routes
export const dashRoute = '/dashboard'
export const sessionsRoute = '/dashboard/sessions'
export const statisticsRoute = '/dashboard/stats'
export const leaderboardRoute = '/dashboard/leaderboard'

// Settings routes
export const settingsAccountRoute = '/dashboard/account'
export const settingsSecurityRoute = '/dashboard/security'
export const settingsDataRoute = '/dashboard/data'
export const settingsSubscriptionRoute = '/dashboard/subscription'

// Other feature routes
export const tracksRoute = '/tracks'
export const carsRoute = '/cars'

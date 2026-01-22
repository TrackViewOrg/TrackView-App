import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dashRoute, signinRoute, updatePasswordRoute, verifyMfaRoute } from '@/lib/constants'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? dashRoute

    if (code) {
        const supabase = await createClient()

        // Exchange code for session - This logs the user in
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const safeNext = next.startsWith('/') ? next : dashRoute

            // Create the redirect response immediately
            const response = NextResponse.redirect(`${origin}${safeNext}`)

            // IF it's a password reset flow
            if (safeNext === updatePasswordRoute) {
                response.cookies.set('trackview-recovery-mode', 'true', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 300, // 5 minutes
                    path: '/',
                })
            }

            // Handle MFA check while preserving the 'next' destination
            const { data: mfaData } = await supabase.auth.mfa.listFactors()
            const hasVerifiedTotp = mfaData?.all.some(
                (factor) => factor.status === 'verified' && factor.factor_type === 'totp'
            )

            if (hasVerifiedTotp) {
                const mfaResponse = NextResponse.redirect(
                    `${origin}${verifyMfaRoute}?next=${encodeURIComponent(safeNext)}`
                )

                // Ensure cookie is passed along if we are in recovery mode
                if (safeNext === updatePasswordRoute) {
                    mfaResponse.cookies.set('trackview-recovery-mode', 'true', {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 300, // 5 minutes
                        path: '/',
                    })
                }

                return mfaResponse
            }

            return response
        }
    }

    return NextResponse.redirect(`${origin}${signinRoute}?error=Authentication failed`)
}
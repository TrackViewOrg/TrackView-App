import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { authRoute, dashRoute, signinRoute } from "@/lib/constants";

// Centralized Route Configuration
const ROUTES = {
    signin: signinRoute,
    dashboard: dashRoute,
    authRoot: authRoute,
    callback: '/auth/callback', // Explicitly define callback
    verifyMfa: '/auth/verify-mfa',
    root: '/'
}

export default async function middleware(request: NextRequest) {
    // 1. Initialize Response
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // 2. Fetch User
    // We strictly need to know if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // 3. Define Route Types
    const isSigninPage = path === ROUTES.signin
    const isAuthRootPage = path.startsWith(ROUTES.authRoot)
    const isVerifyPage = path === ROUTES.verifyMfa
    const isCallbackPage = path.startsWith(ROUTES.callback) // Handle /auth/callback?code=...

    // Whitelist: Pages accessible without login
    // Note: Callback must be public to allow the code exchange
    const isPublicAuthPage = isSigninPage || (isAuthRootPage && !isVerifyPage)

    // ----------------------------------------------------------------
    // LOGIC GATE
    // ----------------------------------------------------------------

    // CASE 1: USER IS NOT LOGGED IN
    if (!user) {
        // Allow access to Signin, Signup, and critically, the Callback page
        if (isPublicAuthPage) {
            return response
        }

        // Redirect all protected traffic to Signin
        return navigate(request, ROUTES.signin, response)
    }

    // CASE 2: USER IS LOGGED IN

    // Check MFA Status
    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    const isMfaPending = mfaData && mfaData.nextLevel === 'aal2' && mfaData.currentLevel === 'aal1'

    // Sub-Case 2A: MFA is Pending
    if (isMfaPending) {
        if (!isVerifyPage) {
            return navigate(request, ROUTES.verifyMfa, response)
        }
        return response
    }

    // Sub-Case 2B: Fully Authenticated

    // CRITICAL FIX: Do NOT redirect /auth/callback even if logged in.
    // The callback route handler might need to run to refresh tokens,
    // link identities, or handle server-side logic before the dashboard logic takes over.
    if (isCallbackPage) {
        return response
    }

    // Block access to Signin/Signup pages if already logged in -> Send to Dashboard
    if (isPublicAuthPage || path === ROUTES.root) {
        return navigate(request, ROUTES.dashboard, response)
    }

    // Allow access to Dashboard and protected routes
    return response
}

/**
 * Helper to handle redirects while preserving cookies.
 */
function navigate(request: NextRequest, targetPath: string, originalResponse: NextResponse) {
    // Prevent infinite redirects to the same page
    if (request.nextUrl.pathname === targetPath) {
        return originalResponse
    }

    const url = request.nextUrl.clone()
    url.pathname = targetPath
    url.search = '' // Clear query params (like ?code=...) on redirect

    const newResponse = NextResponse.redirect(url)

    // Copy cookies from the Supabase client response to the redirect response
    originalResponse.cookies.getAll().forEach((cookie) => {
        newResponse.cookies.set(cookie)
    })

    return newResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { signinRoute } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check for a session first to avoid errors (optional but recommended)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    await supabase.auth.signOut()
  }

  // Clear Next.js Router Cache
  revalidatePath('/', 'layout')

  // Redirect to the sign-in page
  return NextResponse.redirect(new URL(signinRoute, request.url), {
    status: 302,
  })
}

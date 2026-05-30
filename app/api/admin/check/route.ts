// app/api/admin/check/route.ts — replace existing

import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  const cookieStore = cookies()
  const sessionClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )

  const { data: { user }, error: userError } = await sessionClient.auth.getUser()
  if (userError || !user) return NextResponse.json({ isAdmin: false, debug: 'no session' })

  const { data, error } = await adminDb()
    .from('profiles')
    .select('is_admin, is_unlimited, plan, words_limit, words_used')
    .eq('id', user.id)
    .limit(1)

  if (error) return NextResponse.json({ isAdmin: false, debug: 'db error', error: error.message })
  const profile = Array.isArray(data) ? data[0] : data
  if (!profile) return NextResponse.json({ isAdmin: false, debug: 'no profile', userId: user.id })

  return NextResponse.json({
    isAdmin:     profile.is_admin     ?? false,
    isUnlimited: profile.is_unlimited ?? false,
    plan:        profile.plan         ?? 'free',
    wordsLimit:  profile.words_limit  ?? 5000,
    wordsUsed:   profile.words_used   ?? 0,
    debug:       'ok',
  })
}

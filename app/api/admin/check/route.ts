// app/api/admin/check/route.ts
import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(s: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
            try { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          },
        },
      }
    )

    const { data: { user } } = await sessionClient.auth.getUser()
    if (!user) return NextResponse.json({ isAdmin: false, debug: 'no session' })

    // Use maybeSingle to handle 0 or 1 rows safely
    const { data, error } = await adminDb()
      .from('profiles')
      .select('is_admin, is_unlimited, plan, words_limit, words_used')
      .eq('id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return NextResponse.json({ isAdmin: false, debug: 'db error', error: error.message })
    if (!data)  return NextResponse.json({ isAdmin: false, debug: 'no profile', userId: user.id })

    return NextResponse.json({
      isAdmin:     data.is_admin     ?? false,
      isUnlimited: data.is_unlimited ?? false,
      plan:        data.plan         ?? 'free',
      wordsLimit:  data.words_limit  ?? 5000,
      wordsUsed:   data.words_used   ?? 0,
      debug:       'ok',
    })
  } catch (e: unknown) {
    return NextResponse.json({ isAdmin: false, debug: 'exception', error: String(e) })
  }
}

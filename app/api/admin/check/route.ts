// app/api/admin/check/route.ts
// Restored to original working version — only fix is data?.[0] instead of .single()

import { NextResponse } from 'next/server'
import { createServiceClient, createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return NextResponse.json({ isAdmin: false, debug: 'no session' })

  const service = createServiceClient()
  const { data, error } = await service
    .from('profiles')
    .select('is_admin, is_unlimited, plan, words_limit, words_used')
    .eq('id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) return NextResponse.json({ isAdmin: false, debug: 'db error', error: error.message })

  const profile = data?.[0]
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

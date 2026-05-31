// app/api/stats/route.ts
// Public endpoint — no auth needed, returns live platform stats

import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const revalidate = 60 // cache for 60s

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  try {
    const db = adminDb()

    // Total humanized words
    const { data: wordsData } = await db
      .from('ai_scans')
      .select('word_count')
      .eq('tool', 'humanizer')

    const totalWords = (wordsData ?? []).reduce((s, r) => s + (r.word_count ?? 0), 0)

    // Total users
    const { count: userCount } = await db
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Total scans
    const { count: scanCount } = await db
      .from('ai_scans')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      wordsHumanized: totalWords,
      totalUsers:     userCount ?? 0,
      totalScans:     scanCount ?? 0,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
    })
  } catch {
    return NextResponse.json({ wordsHumanized: 0, totalUsers: 0, totalScans: 0 })
  }
}

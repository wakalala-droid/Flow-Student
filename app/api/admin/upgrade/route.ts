// app/api/admin/users/route.ts  — replace your existing file

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

async function checkAdmin() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const service = createServiceClient()
    const { data } = await service
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    return data?.is_admin ? user : null
  } catch {
    return null
  }
}

// GET /api/admin/users?search=john&plan=free&limit=500
export async function GET(req: NextRequest) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const plan   = searchParams.get('plan')   ?? ''
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '500'), 1000)

  const service = createServiceClient()

  let query = service
    .from('profiles')
    .select('id, email, full_name, avatar_url, plan, words_used, words_limit, scans_used, scans_limit, is_admin, is_unlimited, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  // Server-side plan filter
  if (plan && plan !== 'all') {
    query = query.eq('plan', plan)
  }

  // Server-side search (email OR name)
  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function PATCH(req: NextRequest) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { userId, updates } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const PLAN_LIMITS: Record<string, { words: number; scans: number }> = {
    free:    { words: 5_000,   scans: 10  },
    student: { words: 20_000,  scans: 50  },
    pro:     { words: 50_000,  scans: 200 },
    team:    { words: 200_000, scans: 1_000 },
  }

  const extra: Record<string, unknown> = {}
  if (updates.plan && PLAN_LIMITS[updates.plan]) {
    extra.words_limit = PLAN_LIMITS[updates.plan].words
    extra.scans_limit = PLAN_LIMITS[updates.plan].scans
  }
  if (updates.is_unlimited) {
    extra.words_limit = 999_999_999
    extra.scans_limit = 999_999_999
  }

  const service = createServiceClient()
  const { error } = await service
    .from('profiles')
    .update({ ...updates, ...extra, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const service = createServiceClient()
  const { error } = await service.from('profiles').delete().eq('id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

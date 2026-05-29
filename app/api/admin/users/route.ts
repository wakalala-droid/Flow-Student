// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeAnonClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) => { try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
      },
    }
  )
}

// Service client uses SERVICE_ROLE_KEY — bypasses RLS when policies allow it
function makeServiceClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) => { try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

async function requireAdmin() {
  const anon = makeAnonClient()
  const { data: { user } } = await anon.auth.getUser()
  if (!user) return null

  // Use service client to check admin — bypasses RLS
  const service = makeServiceClient()
  const { data } = await service
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return data?.is_admin ? user : null
}

const PLAN_LIMITS: Record<string, { words: number; scans: number }> = {
  free:    { words: 5_000,    scans: 10    },
  student: { words: 20_000,   scans: 50    },
  pro:     { words: 50_000,   scans: 200   },
  team:    { words: 200_000,  scans: 1_000 },
}

// ── GET /api/admin/users ──────────────────────────────────────────────────────
// Returns every user with their scans attached
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const plan   = searchParams.get('plan')   ?? ''

  const service = makeServiceClient()

  // Fetch all profiles (service role bypasses RLS)
  let profileQuery = service
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (plan && plan !== 'all') {
    profileQuery = profileQuery.eq('plan', plan)
  }
  if (search) {
    profileQuery = profileQuery.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  const { data: profiles, error: profileError } = await profileQuery

  if (profileError) {
    console.error('[admin/users] profiles error:', profileError)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json([])
  }

  // Fetch all scans for these users in one query
  const userIds = profiles.map(p => p.id)

  const { data: scans, error: scansError } = await service
    .from('ai_scans')
    .select('id, user_id, tool, word_count, created_at')
    .in('user_id', userIds)
    .order('created_at', { ascending: false })
    .limit(2000)

  if (scansError) {
    console.error('[admin/users] scans error:', scansError)
  }

  // Fetch all transactions for these users
  const { data: transactions } = await service
    .from('payment_transactions')
    .select('id, user_id, amount, currency, plan, status, network, mobile_number, created_at')
    .in('user_id', userIds)
    .order('created_at', { ascending: false })

  // Attach scans + transactions to each profile
  const scansMap    = (scans        ?? []).reduce((acc, s) => { (acc[s.user_id] ??= []).push(s);  return acc }, {} as Record<string, typeof scans>)
  const txMap       = (transactions ?? []).reduce((acc, t) => { (acc[t.user_id] ??= []).push(t);  return acc }, {} as Record<string, typeof transactions>)

  const enriched = profiles.map(p => ({
    ...p,
    scans:        scansMap[p.id]    ?? [],
    transactions: txMap[p.id]       ?? [],
    total_scans:  (scansMap[p.id]   ?? []).length,
    total_spent:  (txMap[p.id]      ?? []).filter((t: { status: string }) => t.status === 'success').reduce((s: number, t: { amount: number }) => s + Number(t.amount), 0),
  }))

  return NextResponse.json(enriched)
}

// ── PATCH /api/admin/users ────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { userId, updates } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const extra: Record<string, unknown> = {}
  if (updates.plan && PLAN_LIMITS[updates.plan]) {
    extra.words_limit = PLAN_LIMITS[updates.plan].words
    extra.scans_limit = PLAN_LIMITS[updates.plan].scans
  }
  if (updates.is_unlimited === true) {
    extra.words_limit = 999_999_999
    extra.scans_limit = 999_999_999
  }

  const service = makeServiceClient()
  const { error } = await service
    .from('profiles')
    .update({ ...updates, ...extra, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// ── DELETE /api/admin/users ───────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const service = makeServiceClient()
  const { error } = await service.from('profiles').delete().eq('id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

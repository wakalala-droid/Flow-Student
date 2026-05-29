// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function anonClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) => {
          try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )
}

async function requireAdmin() {
  const anon = anonClient()
  const { data: { user } } = await anon.auth.getUser()
  if (!user) return null
  const { data } = await adminClient().from('profiles').select('is_admin').eq('id', user.id).single()
  return data?.is_admin ? user : null
}

const PLAN_LIMITS: Record<string, { words: number; scans: number }> = {
  free:    { words: 5_000,   scans: 10    },
  student: { words: 20_000,  scans: 50    },
  pro:     { words: 50_000,  scans: 200   },
  team:    { words: 200_000, scans: 1_000 },
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const db = adminClient()

  // Step 1: Pull ALL users from auth.users using the admin API
  // This ALWAYS works regardless of RLS — it's the master list
  const { data: authData, error: authError } = await db.auth.admin.listUsers({ perPage: 1000 })
  if (authError) {
    console.error('[admin] auth.admin.listUsers error:', authError)
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  const authUsers = authData?.users ?? []
  if (authUsers.length === 0) return NextResponse.json([])

  const userIds = authUsers.map(u => u.id)

  // Step 2: Pull profiles for all those user IDs
  const { data: profiles, error: profileError } = await db
    .from('profiles')
    .select('*')
    .in('id', userIds)

  if (profileError) {
    console.error('[admin] profiles error:', profileError)
    // Don't fail — build from auth users alone
  }

  // Step 3: Pull scans + transactions
  const { data: scans } = await db
    .from('ai_scans')
    .select('id, user_id, tool, word_count, created_at')
    .in('user_id', userIds)
    .order('created_at', { ascending: false })
    .limit(5000)

  const { data: transactions } = await db
    .from('payment_transactions')
    .select('id, user_id, amount, currency, plan, status, network, mobile_number, created_at')
    .in('user_id', userIds)
    .order('created_at', { ascending: false })

  type Profile = Record<string, unknown>
  type Scan    = { id: string; user_id: string; tool: string; word_count: number; created_at: string }
  type Tx      = { id: string; user_id: string; amount: number; status: string; currency: string; plan: string; network: string; mobile_number: string; created_at: string }

  const profileMap = ((profiles ?? []) as Profile[]).reduce((acc, p) => {
    acc[p.id as string] = p; return acc
  }, {} as Record<string, Profile>)

  const scansMap = ((scans ?? []) as Scan[]).reduce((acc, s) => {
    (acc[s.user_id] ??= []).push(s); return acc
  }, {} as Record<string, Scan[]>)

  const txMap = ((transactions ?? []) as Tx[]).reduce((acc, t) => {
    (acc[t.user_id] ??= []).push(t); return acc
  }, {} as Record<string, Tx[]>)

  // Step 4: Merge auth users + profiles — auth is the source of truth
  const enriched = authUsers.map(authUser => {
    const profile = profileMap[authUser.id] ?? {}
    const userScans = scansMap[authUser.id] ?? []
    const userTxns  = txMap[authUser.id]    ?? []
    return {
      id:           authUser.id,
      email:        authUser.email ?? ((profile as Record<string, unknown>).email as string) ?? '',
      full_name:    (profile.full_name as string) ?? authUser.user_metadata?.full_name ?? null,
      avatar_url:   (profile.avatar_url as string) ?? authUser.user_metadata?.avatar_url ?? null,
      plan:         (profile.plan as string) ?? 'free',
      words_used:   (profile.words_used as number) ?? 0,
      words_limit:  (profile.words_limit as number) ?? 5000,
      scans_used:   (profile.scans_used as number) ?? 0,
      scans_limit:  (profile.scans_limit as number) ?? 10,
      is_admin:     (profile.is_admin as boolean) ?? false,
      is_unlimited: (profile.is_unlimited as boolean) ?? false,
      created_at:   authUser.created_at,
      scans:        userScans,
      transactions: userTxns,
      total_scans:  userScans.length,
      total_spent:  userTxns.filter(t => t.status === 'success').reduce((s, t) => s + Number(t.amount), 0),
    }
  })

  // Sort newest first
  enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return NextResponse.json(enriched)
}

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

  const { error } = await adminClient()
    .from('profiles')
    .update({ ...updates, ...extra, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const { error } = await adminClient().from('profiles').delete().eq('id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

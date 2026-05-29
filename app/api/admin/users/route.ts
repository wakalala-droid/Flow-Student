// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Pure supabase-js admin client — zero RLS, no cookies needed for data queries
function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Session client — reads cookies exactly like your existing server.ts
function sessionClient() {
  const cookieStore = cookies()
  return createServerClient(
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
}

async function requireAdmin(): Promise<string | null> {
  // Step 1: get session user via cookie (same as your working middleware)
  const { data: { user } } = await sessionClient().auth.getUser()
  if (!user) return null

  // Step 2: check is_admin via adminDb (bypasses RLS completely)
  const { data, error } = await adminDb()
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (error || !data?.is_admin) return null
  return user.id
}

const PLAN_LIMITS: Record<string, { words: number; scans: number }> = {
  free:    { words: 5_000,   scans: 10    },
  student: { words: 20_000,  scans: 50    },
  pro:     { words: 50_000,  scans: 200   },
  team:    { words: 200_000, scans: 1_000 },
}

export async function GET() {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'User not allowed' }, { status: 403 })

  const db = adminDb()

  // auth.admin.listUsers — reads auth.users directly, zero RLS
  const { data: authData, error: authError } = await db.auth.admin.listUsers({ perPage: 1000 })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  const authUsers = authData?.users ?? []
  if (!authUsers.length) return NextResponse.json([])

  const ids = authUsers.map(u => u.id)

  const [profilesRes, scansRes, txRes] = await Promise.all([
    db.from('profiles').select('*').in('id', ids),
    db.from('ai_scans').select('id,user_id,tool,word_count,created_at').in('user_id', ids).order('created_at', { ascending: false }).limit(5000),
    db.from('payment_transactions').select('id,user_id,amount,currency,plan,status,network,mobile_number,created_at').in('user_id', ids),
  ])

  type P  = Record<string, unknown>
  type S  = { id: string; user_id: string; tool: string; word_count: number; created_at: string }
  type Tx = { id: string; user_id: string; amount: number; status: string; currency: string; plan: string; network: string; mobile_number: string; created_at: string }

  const pMap = ((profilesRes.data ?? []) as P[]).reduce((a, p) => { a[p.id as string] = p; return a }, {} as Record<string, P>)
  const sMap = ((scansRes.data   ?? []) as S[]).reduce((a, s) => { (a[s.user_id] ??= []).push(s); return a }, {} as Record<string, S[]>)
  const tMap = ((txRes.data      ?? []) as Tx[]).reduce((a, t) => { (a[t.user_id] ??= []).push(t); return a }, {} as Record<string, Tx[]>)

  const result = authUsers.map(au => {
    const p  = (pMap[au.id] ?? {}) as P
    const s  = sMap[au.id] ?? []
    const tx = tMap[au.id] ?? []
    return {
      id:           au.id,
      email:        au.email ?? String(p.email ?? ''),
      full_name:    String(p.full_name   ?? (au.user_metadata?.full_name  ?? '')),
      avatar_url:   String(p.avatar_url  ?? (au.user_metadata?.avatar_url ?? '')),
      plan:         String(p.plan        ?? 'free'),
      words_used:   Number(p.words_used  ?? 0),
      words_limit:  Number(p.words_limit ?? 5000),
      scans_used:   Number(p.scans_used  ?? 0),
      scans_limit:  Number(p.scans_limit ?? 10),
      is_admin:     Boolean(p.is_admin     ?? false),
      is_unlimited: Boolean(p.is_unlimited ?? false),
      created_at:   au.created_at,
      scans:        s,
      transactions: tx,
      total_scans:  s.length,
      total_spent:  tx.filter(t => t.status === 'success').reduce((sum, t) => sum + Number(t.amount), 0),
    }
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return NextResponse.json(result)
}

export async function PATCH(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'User not allowed' }, { status: 403 })

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

  const { error } = await adminDb()
    .from('profiles')
    .update({ ...updates, ...extra, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'User not allowed' }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const { error } = await adminDb().from('profiles').delete().eq('id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

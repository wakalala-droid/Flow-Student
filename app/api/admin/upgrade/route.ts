// app/api/admin/upgrade/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient, createServiceClient } from '@/lib/supabase/server'

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const PLAN_LIMITS: Record<string, { words: number; scans: number }> = {
  free:    { words: 5_000,   scans: 10    },
  student: { words: 20_000,  scans: 50    },
  pro:     { words: 50_000,  scans: 200   },
  team:    { words: 200_000, scans: 1_000 },
}

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
      .limit(1)
    return data?.[0]?.is_admin === true ? user : null
  } catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const body = await req.json()
    const { userId, plan, billingCycle = 'monthly' } = body

    if (!userId || !plan) {
      return NextResponse.json({ error: 'userId and plan are required' }, { status: 400 })
    }

    if (!PLAN_LIMITS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const limits = PLAN_LIMITS[plan]
    const db = adminDb()

    // Update profile
    const { error: profileError } = await db
      .from('profiles')
      .update({
        plan,
        words_limit:  limits.words,
        scans_limit:  limits.scans,
        updated_at:   new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Upsert subscription
    const periodEnd = new Date()
    billingCycle === 'yearly'
      ? periodEnd.setFullYear(periodEnd.getFullYear() + 1)
      : periodEnd.setMonth(periodEnd.getMonth() + 1)

    await db.from('subscriptions').upsert(
      {
        user_id:              userId,
        plan,
        status:               'active',
        payment_method:       'manual',
        amount:               0,
        currency:             'ZMW',
        billing_cycle:        billingCycle,
        current_period_start: new Date().toISOString(),
        current_period_end:   periodEnd.toISOString(),
        flutterwave_tx_ref:   `MANUAL-${admin.id}-${Date.now()}`,
        updated_at:           new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    return NextResponse.json({ ok: true, plan, limits })
  } catch (e: unknown) {
    console.error('[admin/upgrade] error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 }
    )
  }
}

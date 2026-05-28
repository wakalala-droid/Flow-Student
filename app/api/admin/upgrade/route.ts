// app/api/admin/upgrade/route.ts
// Place this file at: app/api/admin/upgrade/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const PLAN_LIMITS: Record<string, { words: number; scans: number }> = {
  free:    { words: 5_000,   scans: 10 },
  student: { words: 20_000,  scans: 50 },
  pro:     { words: 50_000,  scans: 200 },
  team:    { words: 200_000, scans: 1_000 },
}

async function checkAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return data?.is_admin ? user : null
}

// POST /api/admin/upgrade
// Body: { userId, plan, billingCycle?, note? }
export async function POST(req: NextRequest) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { userId, plan, billingCycle = 'monthly', note = 'Manual upgrade by admin' } = await req.json()

  if (!userId || !plan) {
    return NextResponse.json({ error: 'userId and plan are required' }, { status: 400 })
  }

  if (!PLAN_LIMITS[plan]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const service = createServiceClient()
  const limits  = PLAN_LIMITS[plan]

  // 1. Upgrade the user's profile
  const { error: profileError } = await service
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

  // 2. Create / upsert a subscription record so billing page reflects the change
  const periodEnd = new Date()
  billingCycle === 'yearly'
    ? periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    : periodEnd.setMonth(periodEnd.getMonth() + 1)

  const { error: subError } = await service
    .from('subscriptions')
    .upsert(
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

  if (subError) {
    // Non-fatal — profile was already upgraded
    console.warn('Subscription upsert warning:', subError.message)
  }

  return NextResponse.json({
    ok:    true,
    plan,
    limits,
    note,
    upgraded_by: admin.id,
    upgraded_at: new Date().toISOString(),
  })
}

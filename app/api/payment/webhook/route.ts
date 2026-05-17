import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyByTxRef } from '@/lib/payment/flutterwave'
import { PLANS, type PlanKey } from '@/lib/payment/flutterwave'

// Flutterwave sends webhook on payment completion
// Set this URL in Flutterwave Dashboard → Settings → Webhooks:
// https://your-app.vercel.app/api/payment/webhook

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Flutterwave webhook payload
    const txRef = body?.data?.tx_ref
    const eventType = body?.event

    if (!txRef || eventType !== 'charge.completed') {
      return NextResponse.json({ status: 'ignored' })
    }

    const serviceClient = createServiceClient()

    // Check we haven't already processed this
    const { data: existing } = await serviceClient
      .from('payment_transactions')
      .select('status, user_id, plan, billing_cycle')
      .eq('tx_ref', txRef)
      .single()

    if (!existing) return NextResponse.json({ status: 'not_found' })
    if (existing.status === 'success') return NextResponse.json({ status: 'already_processed' })

    // Verify with Flutterwave API
    const verification = await verifyByTxRef(txRef)

    if (verification.status !== 'success') {
      await serviceClient
        .from('payment_transactions')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('tx_ref', txRef)
      return NextResponse.json({ status: 'verification_failed' })
    }

    const planData = PLANS[existing.plan as PlanKey]
    const periodEnd = new Date()
    existing.billing_cycle === 'yearly'
      ? periodEnd.setFullYear(periodEnd.getFullYear() + 1)
      : periodEnd.setMonth(periodEnd.getMonth() + 1)

    // Update transaction to success
    await serviceClient
      .from('payment_transactions')
      .update({ status: 'success', updated_at: new Date().toISOString() })
      .eq('tx_ref', txRef)

    // Upsert subscription
    await serviceClient.from('subscriptions').upsert({
      user_id: existing.user_id,
      plan: existing.plan,
      status: 'active',
      payment_method: 'mobile_money',
      amount: verification.amount,
      currency: verification.currency,
      billing_cycle: existing.billing_cycle,
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
      flutterwave_tx_ref: txRef,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    // Upgrade user profile limits
    await serviceClient
      .from('profiles')
      .update({
        plan: existing.plan,
        words_limit: planData?.wordsLimit ?? 5000,
        scans_limit: planData?.scansLimit ?? 10,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.user_id)

    return NextResponse.json({ status: 'ok' })
  } catch (e) {
    console.error('Webhook error:', e)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

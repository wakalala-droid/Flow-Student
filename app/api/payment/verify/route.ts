import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyByTxRef } from '@/lib/payment/flutterwave'
import { PLANS, type PlanKey } from '@/lib/payment/flutterwave'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const txRef = searchParams.get('tx_ref')
  const status = searchParams.get('status')

  if (!txRef) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?error=missing_ref`)
  }

  try {
    const serviceClient = createServiceClient()

    // Get our stored transaction
    const { data: tx } = await serviceClient
      .from('payment_transactions')
      .select('*')
      .eq('tx_ref', txRef)
      .single()

    if (!tx) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?error=not_found`)
    }

    // Verify with Flutterwave
    const verification = await verifyByTxRef(txRef)

    if (verification.status === 'success') {
      const planData = PLANS[tx.plan as PlanKey]

      // Update transaction
      await serviceClient.from('payment_transactions')
        .update({ status: 'success', updated_at: new Date().toISOString() })
        .eq('tx_ref', txRef)

      // Create/update subscription
      const periodEnd = new Date()
      if (tx.billing_cycle === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1)
      }

      await serviceClient.from('subscriptions').upsert({
        user_id: tx.user_id,
        plan: tx.plan,
        status: 'active',
        payment_method: 'mobile_money',
        amount: tx.amount,
        currency: 'ZMW',
        billing_cycle: tx.billing_cycle,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
        flutterwave_tx_ref: txRef,
        mobile_number: tx.mobile_number,
        network: tx.network,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      // Upgrade user profile
      await serviceClient.from('profiles')
        .update({
          plan: tx.plan,
          words_limit: planData?.wordsLimit ?? 5000,
          scans_limit: planData?.scansLimit ?? 10,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tx.user_id)

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true&plan=${tx.plan}`
      )
    }

    // Failed
    await serviceClient.from('payment_transactions')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('tx_ref', txRef)

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?error=payment_failed`
    )
  } catch (e) {
    console.error('Verify error:', e)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?error=server_error`
    )
  }
}

// POST version for webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const txRef = body?.data?.tx_ref
    if (!txRef) return NextResponse.json({ status: 'ignored' })

    // Reuse GET logic by redirecting internally
    const serviceClient = createServiceClient()
    const verification = await verifyByTxRef(txRef)

    if (verification.status === 'success') {
      const { data: tx } = await serviceClient
        .from('payment_transactions').select('*').eq('tx_ref', txRef).single()
      if (tx) {
        const planData = PLANS[tx.plan as PlanKey]
        const periodEnd = new Date()
        tx.billing_cycle === 'yearly'
          ? periodEnd.setFullYear(periodEnd.getFullYear() + 1)
          : periodEnd.setMonth(periodEnd.getMonth() + 1)

        await serviceClient.from('payment_transactions')
          .update({ status: 'success' }).eq('tx_ref', txRef)
        await serviceClient.from('profiles')
          .update({ plan: tx.plan, words_limit: planData?.wordsLimit, scans_limit: planData?.scansLimit })
          .eq('id', tx.user_id)
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (e) {
    console.error('Webhook error:', e)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

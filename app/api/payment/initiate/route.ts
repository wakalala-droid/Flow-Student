import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { initiateFlutterwavePayment, generateTxRef, PLANS, type PlanKey, type MobileNetwork } from '@/lib/payment/flutterwave'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan, billingCycle = 'monthly', phoneNumber, network, fullName } = await req.json()

    if (!plan || !phoneNumber || !network || !fullName) {
      return NextResponse.json({ error: 'Missing required fields: plan, phoneNumber, network, fullName' }, { status: 400 })
    }

    const planData = PLANS[plan as PlanKey]
    if (!planData) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const amount = billingCycle === 'yearly' ? planData.yearly : planData.monthly
    const txRef = generateTxRef()

    // Save pending transaction
    const serviceClient = createServiceClient()
    await serviceClient.from('payment_transactions').insert({
      user_id: user.id,
      tx_ref: txRef,
      amount,
      currency: 'ZMW',
      mobile_number: phoneNumber,
      network: network as MobileNetwork,
      plan,
      billing_cycle: billingCycle,
      status: 'pending',
    })

    const result = await initiateFlutterwavePayment({
      amount,
      currency: 'ZMW',
      email: user.email!,
      phoneNumber,
      network: network as MobileNetwork,
      fullName,
      txRef,
      plan,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/verify?tx_ref=${txRef}`,
    })

    if (result.status === 'error') {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      txRef,
      paymentLink: result.data,
      amount,
      currency: 'ZMW',
      plan,
      network,
      message: `A payment request of ZMW ${amount} has been sent to ${phoneNumber}. Please check your phone and enter your PIN to confirm.`,
    })
  } catch (e) {
    console.error('Payment initiate error:', e)
    return NextResponse.json({ error: 'Payment initiation failed. Please try again.' }, { status: 500 })
  }
}

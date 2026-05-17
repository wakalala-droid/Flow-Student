// Flutterwave Mobile Money Integration
// Supports: MTN Zambia, Airtel Zambia, Zamtel
// Sign up free at dashboard.flutterwave.com

import { nanoid } from 'nanoid'

export type MobileNetwork = 'MTN' | 'AIRTEL' | 'ZAMTEL'

export interface MobileMoneyPayload {
  amount: number
  currency: 'ZMW'
  email: string
  phoneNumber: string
  network: MobileNetwork
  fullName: string
  txRef: string
  plan: string
  redirectUrl: string
}

export interface FlutterwaveResponse {
  status: 'success' | 'error'
  message: string
  data?: {
    id: number
    tx_ref: string
    flw_ref: string
    status: string
    amount: number
    currency: string
    payment_type: string
    meta?: Record<string, string>
  }
}

export interface VerifyResponse {
  status: 'success' | 'failed' | 'pending'
  txRef: string
  amount: number
  currency: string
  customerEmail: string
}

// Zambia pricing in ZMW (Zambian Kwacha)
export const PLANS = {
  student: {
    name: 'Student',
    monthly: 49,      // ZMW ~≈ $2.50 USD
    yearly: 490,      // ZMW (2 months free)
    currency: 'ZMW',
    wordsLimit: 20000,
    scansLimit: 50,
    features: [
      '20,000 words/month',
      'All 10 AI tools',
      'Grammar fixer',
      'Plagiarism check (5/day)',
      'Priority support',
    ],
  },
  pro: {
    name: 'Pro',
    monthly: 99,      // ZMW ~≈ $5 USD
    yearly: 990,
    currency: 'ZMW',
    wordsLimit: 50000,
    scansLimit: 200,
    features: [
      '50,000 words/month',
      'All tools unlimited',
      'Plagiarism check (20/day)',
      'Document uploads (PDF/DOCX)',
      'Export reports',
      'API access',
    ],
  },
  team: {
    name: 'Team',
    monthly: 249,
    yearly: 2490,
    currency: 'ZMW',
    wordsLimit: 200000,
    scansLimit: 1000,
    features: [
      '200,000 words/month',
      '5 team members',
      'Unlimited plagiarism checks',
      'Admin dashboard',
      'Priority API',
      'Custom integrations',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS

export function generateTxRef(): string {
  return `FS-${Date.now()}-${nanoid(8).toUpperCase()}`
}

// Initiate mobile money payment via Flutterwave
export async function initiateFlutterwavePayment(payload: MobileMoneyPayload): Promise<FlutterwaveResponse> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY

  if (!secretKey) {
    throw new Error('Flutterwave secret key not configured')
  }

  // Map network to Flutterwave's network codes for Zambia
  const networkMap: Record<MobileNetwork, string> = {
    MTN: 'MTN',
    AIRTEL: 'AIRTEL',
    ZAMTEL: 'ZAMTEL',
  }

  const requestBody = {
    tx_ref: payload.txRef,
    amount: payload.amount,
    currency: payload.currency,
    payment_options: 'mobilemoney',
    redirect_url: payload.redirectUrl,
    customer: {
      email: payload.email,
      phone_number: payload.phoneNumber,
      name: payload.fullName,
    },
    customizations: {
      title: 'Flow-Student',
      description: `${payload.plan} Plan Subscription`,
      logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    },
    payment_plan: null,
    meta: {
      plan: payload.plan,
      network: networkMap[payload.network],
    },
  }

  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secretKey}`,
    },
    body: JSON.stringify(requestBody),
  })

  const data = await response.json()

  if (data.status === 'success') {
    return { status: 'success', message: data.message, data: data.data }
  }

  return { status: 'error', message: data.message || 'Payment initiation failed' }
}

// Direct mobile money charge (USSD-based, no redirect needed)
export async function chargeDirectMobileMoney(payload: MobileMoneyPayload): Promise<FlutterwaveResponse> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY

  const requestBody = {
    tx_ref: payload.txRef,
    amount: payload.amount,
    currency: payload.currency,
    email: payload.email,
    phone_number: payload.phoneNumber,
    fullname: payload.fullName,
    network: payload.network,
    client_ip: '127.0.0.1',
    device_fingerprint: payload.txRef,
    meta: { plan: payload.plan },
  }

  const response = await fetch('https://api.flutterwave.com/v3/charges?type=mobile_money_zambia', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secretKey}`,
    },
    body: JSON.stringify(requestBody),
  })

  return response.json()
}

// Verify transaction status
export async function verifyTransaction(transactionId: string): Promise<VerifyResponse> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY

  const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()

  if (data.status === 'success' && data.data?.status === 'successful') {
    return {
      status: 'success',
      txRef: data.data.tx_ref,
      amount: data.data.amount,
      currency: data.data.currency,
      customerEmail: data.data.customer?.email,
    }
  }

  return {
    status: data.data?.status === 'pending' ? 'pending' : 'failed',
    txRef: data.data?.tx_ref || '',
    amount: 0,
    currency: 'ZMW',
    customerEmail: '',
  }
}

// Verify via tx_ref (for webhook verification)
export async function verifyByTxRef(txRef: string): Promise<VerifyResponse> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY

  const response = await fetch(`https://api.flutterwave.com/v3/transactions?tx_ref=${txRef}`, {
    headers: { 'Authorization': `Bearer ${secretKey}` },
  })

  const data = await response.json()
  const tx = data.data?.[0]

  if (tx?.status === 'successful') {
    return { status: 'success', txRef: tx.tx_ref, amount: tx.amount, currency: tx.currency, customerEmail: tx.customer?.email }
  }

  return { status: tx?.status === 'pending' ? 'pending' : 'failed', txRef, amount: 0, currency: 'ZMW', customerEmail: '' }
}

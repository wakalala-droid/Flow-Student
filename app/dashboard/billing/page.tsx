'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PLANS } from '@/lib/payment/flutterwave'
import type { Profile } from '@/types'
import { formatZMW } from '@/lib/utils'

type Network = 'MTN' | 'AIRTEL' | 'ZAMTEL'
type PlanKey = 'student' | 'pro' | 'team'
type BillingCycle = 'monthly' | 'yearly'

export default function BillingPage() {
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('student')
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [phone, setPhone] = useState('')
  const [network, setNetwork] = useState<Network>('MTN')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'plans' | 'checkout' | 'pending'>('plans')
  const [txRef, setTxRef] = useState('')

  const success = searchParams.get('success')
  const payError = searchParams.get('error')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => {
            setProfile(data)
            setFullName(data?.full_name || '')
          })
      }
    })
  }, [])

  async function handlePay() {
    if (!phone || !fullName) { setError('Please fill in all fields'); return }
    if (phone.length < 9) { setError('Enter a valid Zambian mobile number'); return }
    setLoading(true); setError('')

    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, billingCycle: cycle, phoneNumber: phone, network, fullName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTxRef(data.txRef)
      setStep('pending')
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function checkStatus() {
    setLoading(true)
    try {
      const res = await fetch(`/api/payment/verify?tx_ref=${txRef}`)
      window.location.href = `/dashboard/billing?checking=1`
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-semibold text-[#e8e8f0] mb-2">Payment Successful!</h2>
          <p className="text-sm text-[#7a7a9a] mb-6">Your plan has been upgraded. Enjoy all your new features!</p>
          <a href="/dashboard/humanizer" className="btn-primary w-full justify-center py-2.5">Start Writing →</a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-[#e8e8f0] tracking-tight">Billing & Plans</h1>
          <p className="text-sm text-[#7a7a9a] mt-1">Pay with MTN Mobile Money, Airtel Money, or Zamtel Kwacha</p>
        </div>

        {payError && (
          <div className="px-4 py-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
            ⚠ Payment failed: {payError.replace(/_/g, ' ')}. Please try again.
          </div>
        )}

        {/* Current plan */}
        {profile && (
          <div className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#6c63ff]/20 flex items-center justify-center text-xl">📋</div>
            <div>
              <p className="text-xs text-[#7a7a9a]">Current Plan</p>
              <p className="text-sm font-semibold text-[#e8e8f0] capitalize">{profile.plan} Plan</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-[#7a7a9a]">Words used</p>
              <p className="text-sm font-semibold text-[#e8e8f0]">{profile.words_used.toLocaleString()} / {profile.words_limit.toLocaleString()}</p>
            </div>
          </div>
        )}

        {step === 'plans' && (
          <>
            {/* Billing toggle */}
            <div className="flex items-center gap-3">
              <span className={`text-sm ${cycle === 'monthly' ? 'text-[#e8e8f0]' : 'text-[#7a7a9a]'}`}>Monthly</span>
              <button onClick={() => setCycle(c => c === 'monthly' ? 'yearly' : 'monthly')}
                className={`w-10 h-5 rounded-full transition-all relative ${cycle === 'yearly' ? 'bg-[#6c63ff]' : 'bg-[#1c1c28]'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${cycle === 'yearly' ? 'left-5' : 'left-0.5'}`} />
              </button>
              <span className={`text-sm ${cycle === 'yearly' ? 'text-[#e8e8f0]' : 'text-[#7a7a9a]'}`}>
                Yearly <span className="badge badge-green text-[10px] ml-1">Save 2 months</span>
              </span>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, plan]) => {
                const price = cycle === 'yearly' ? plan.yearly : plan.monthly
                const isSelected = selectedPlan === key
                const isCurrent = profile?.plan === key
                return (
                  <div key={key}
                    onClick={() => setSelectedPlan(key)}
                    className={`card p-5 cursor-pointer transition-all ${isSelected ? 'border-[#6c63ff]/60 bg-[#6c63ff]/5' : 'border-white/[0.07] hover:border-white/[0.12]'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-[#e8e8f0]">{plan.name}</h3>
                      {isCurrent && <span className="badge badge-green text-[10px]">Current</span>}
                      {key === 'pro' && !isCurrent && <span className="badge badge-purple text-[10px]">Popular</span>}
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-[#e8e8f0]">ZMW {price}</span>
                      <span className="text-[#7a7a9a] text-sm">/{cycle === 'yearly' ? 'yr' : 'mo'}</span>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {plan.features.map(f => (
                        <li key={f} className="text-xs text-[#7a7a9a] flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <div className={`w-full py-2 rounded-lg text-xs font-semibold text-center transition-all ${isSelected ? 'bg-[#6c63ff] text-white' : 'bg-[#16161f] text-[#7a7a9a] border border-white/[0.07]'}`}>
                      {isSelected ? 'Selected' : 'Select Plan'}
                    </div>
                  </div>
                )
              })}
            </div>

            <button onClick={() => setStep('checkout')}
              className="btn-primary px-8 py-3 text-sm">
              Continue with {PLANS[selectedPlan].name} Plan →
            </button>
          </>
        )}

        {step === 'checkout' && (
          <div className="max-w-md">
            <div className="card p-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[#e8e8f0]">Pay with Mobile Money</h2>
                <p className="text-xs text-[#7a7a9a] mt-1">
                  {PLANS[selectedPlan].name} Plan — ZMW {cycle === 'yearly' ? PLANS[selectedPlan].yearly : PLANS[selectedPlan].monthly}/{cycle === 'yearly' ? 'year' : 'month'}
                </p>
              </div>

              {error && <div className="px-3 py-2.5 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm">{error}</div>}

              {/* Network selector */}
              <div>
                <label className="block text-xs font-medium text-[#7a7a9a] mb-2">Mobile Network</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MTN', 'AIRTEL', 'ZAMTEL'] as Network[]).map(n => (
                    <button key={n} onClick={() => setNetwork(n)}
                      className={`py-2.5 rounded-lg text-xs font-semibold border transition-all ${network === n ? 'border-[#6c63ff]/60 bg-[#6c63ff]/10 text-violet-300' : 'border-white/[0.07] bg-[#16161f] text-[#7a7a9a] hover:border-white/[0.12]'}`}>
                      {n === 'MTN' ? '🟡 MTN' : n === 'AIRTEL' ? '🔴 Airtel' : '🟢 Zamtel'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7a7a9a] mb-1.5">Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name" className="input" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7a7a9a] mb-1.5">Mobile Number</label>
                <div className="flex gap-2">
                  <span className="input w-16 text-center flex-shrink-0 flex items-center justify-center text-[#7a7a9a]">+260</span>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="97XXXXXXX" maxLength={9} className="input flex-1" />
                </div>
                <p className="text-[11px] text-[#7a7a9a] mt-1">Enter your {network} number without the country code</p>
              </div>

              <div className="bg-[#16161f] rounded-lg p-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-[#7a7a9a]">
                  <span>{PLANS[selectedPlan].name} ({cycle})</span>
                  <span className="text-[#e8e8f0] font-medium">
                    ZMW {cycle === 'yearly' ? PLANS[selectedPlan].yearly : PLANS[selectedPlan].monthly}
                  </span>
                </div>
                <div className="border-t border-white/[0.07] pt-2 flex justify-between font-semibold">
                  <span className="text-[#e8e8f0]">Total</span>
                  <span className="text-emerald-400">
                    ZMW {cycle === 'yearly' ? PLANS[selectedPlan].yearly : PLANS[selectedPlan].monthly}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('plans')} className="btn-secondary flex-1 justify-center py-2.5 text-xs">← Back</button>
                <button onClick={handlePay} disabled={loading} className="btn-primary flex-1 justify-center py-2.5 text-xs">
                  {loading ? 'Processing…' : `Pay ZMW ${cycle === 'yearly' ? PLANS[selectedPlan].yearly : PLANS[selectedPlan].monthly}`}
                </button>
              </div>

              <p className="text-[10px] text-[#7a7a9a] text-center leading-relaxed">
                🔒 Secured by Flutterwave. You'll receive a USSD prompt on your phone to confirm payment.
              </p>
            </div>
          </div>
        )}

        {step === 'pending' && (
          <div className="max-w-md">
            <div className="card p-8 text-center space-y-4">
              <div className="text-5xl animate-pulse">📱</div>
              <h2 className="text-lg font-semibold text-[#e8e8f0]">Check Your Phone</h2>
              <p className="text-sm text-[#7a7a9a] leading-relaxed">
                A payment request of <strong className="text-[#e8e8f0]">ZMW {cycle === 'yearly' ? PLANS[selectedPlan].yearly : PLANS[selectedPlan].monthly}</strong> has been sent to <strong className="text-[#e8e8f0]">+260{phone}</strong> via <strong className="text-[#e8e8f0]">{network}</strong>. Enter your PIN to confirm.
              </p>
              <div className="bg-[#16161f] rounded-lg p-3 text-xs text-[#7a7a9a] text-left space-y-1">
                <p>1. Open your {network} menu or wait for USSD prompt</p>
                <p>2. Confirm the payment of ZMW {cycle === 'yearly' ? PLANS[selectedPlan].yearly : PLANS[selectedPlan].monthly}</p>
                <p>3. Enter your {network} PIN</p>
                <p>4. Click "I've Paid" below once confirmed</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('checkout')} className="btn-secondary flex-1 justify-center py-2.5 text-xs">← Back</button>
                <button onClick={checkStatus} disabled={loading} className="btn-primary flex-1 justify-center py-2.5 text-xs">
                  {loading ? 'Verifying…' : "I've Paid ✓"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

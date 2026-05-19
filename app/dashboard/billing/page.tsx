'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PLANS } from '@/lib/payment/flutterwave'
import type { Profile } from '@/types'

type PlanKey = 'student' | 'pro' | 'team'
type BillingCycle = 'monthly' | 'yearly'

const AIRTEL_NUMBER   = '0973759352'
const WHATSAPP_NUMBER = '260973759352'
const BUSINESS_NAME   = 'Flow-Student'

export default function BillingPage() {
  const [profile, setProfile]           = useState<Profile | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('student')
  const [cycle, setCycle]               = useState<BillingCycle>('monthly')
  const [step, setStep]                 = useState<'plans' | 'pay' | 'submitted'>('plans')
  const [name, setName]                 = useState('')
  const [phone, setPhone]               = useState('')
  const [txRef, setTxRef]               = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          setProfile(data)
          setName(data?.full_name || '')
          setPhone(data?.phone || '')
        })
    })
  }, [])

  const plan   = PLANS[selectedPlan]
  const amount = cycle === 'yearly' ? plan.yearly : plan.monthly

  async function submitPayment() {
    if (!name.trim() || !phone.trim() || !txRef.trim()) {
      setError('Please fill in all fields')
      return
    }
    setSubmitting(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('payment_transactions').insert({
        user_id: user.id,
        tx_ref: txRef.trim(),
        amount,
        currency: 'ZMW',
        mobile_number: `260${phone.trim()}`,
        network: 'AIRTEL',
        plan: selectedPlan,
        billing_cycle: cycle,
        status: 'pending',
      })
    }
    setSubmitting(false)
    setStep('submitted')
  }

  // SUBMITTED
  if (step === 'submitted') {
    const msg = encodeURIComponent(
      `Hi! I just paid ZMW ${amount} for Flow-Student ${plan.name} plan.\n\n` +
      `Name: ${name}\nPhone: +260${phone}\nTransaction ID: ${txRef}\nEmail: ${profile?.email}\n\n` +
      `Please activate my account. Thank you!`
    )
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="card p-8 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-400/15 flex items-center justify-center text-4xl mx-auto">✅</div>
          <h2 className="text-xl font-semibold text-[#e8e8f0]">Payment Submitted!</h2>
          <p className="text-sm text-[#7a7a9a] leading-relaxed">
            Send your Airtel Money confirmation screenshot on WhatsApp for instant activation.
          </p>
          <div className="bg-[#16161f] rounded-xl p-4 text-left space-y-2.5">
            {[
              ['Plan', `${plan.name} (${cycle})`],
              ['Amount', `ZMW ${amount}`],
              ['Transaction ID', txRef],
              ['Status', '⏳ Pending Activation'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-[#7a7a9a]">{k}</span>
                <span className={`font-medium ${k === 'Amount' ? 'text-emerald-400' : k === 'Status' ? 'text-orange-400' : 'text-[#e8e8f0]'}`}>{v}</span>
              </div>
            ))}
          </div>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`}
            target="_blank" rel="noopener noreferrer"
            className="btn-primary w-full justify-center py-3 inline-flex text-sm">
            💬 Send Proof on WhatsApp
          </a>
          <p className="text-[11px] text-[#7a7a9a]">Usually activated within 5–15 minutes.</p>
          <button onClick={() => { setStep('plans'); setTxRef('') }}
            className="text-xs text-[#7a7a9a] hover:text-[#e8e8f0] transition-colors">
            ← Back to plans
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-semibold text-[#e8e8f0] tracking-tight">Upgrade Your Plan</h1>
          <p className="text-sm text-[#7a7a9a] mt-1">Pay with Airtel Money — activated within minutes</p>
        </div>

        {profile && (
          <div className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#6c63ff]/15 flex items-center justify-center text-xl flex-shrink-0">📋</div>
            <div className="flex-1">
              <p className="text-xs text-[#7a7a9a]">Current Plan</p>
              <p className="text-sm font-semibold text-[#e8e8f0] capitalize">{profile.plan}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#7a7a9a]">Words used</p>
              <p className="text-sm font-semibold text-[#e8e8f0]">
                {profile.words_used.toLocaleString()} / {profile.words_limit >= 999999999 ? '∞' : profile.words_limit.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* PLANS */}
        {step === 'plans' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${cycle === 'monthly' ? 'text-[#e8e8f0]' : 'text-[#7a7a9a]'}`}>Monthly</span>
              <button onClick={() => setCycle(c => c === 'monthly' ? 'yearly' : 'monthly')}
                className={`w-11 h-6 rounded-full relative transition-all duration-200 flex-shrink-0 ${cycle === 'yearly' ? 'bg-[#6c63ff]' : 'bg-[#1c1c28] border border-white/10'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${cycle === 'yearly' ? 'left-6' : 'left-1'}`} />
              </button>
              <span className={`text-sm font-medium ${cycle === 'yearly' ? 'text-[#e8e8f0]' : 'text-[#7a7a9a]'}`}>Yearly</span>
              {cycle === 'yearly' && <span className="badge badge-green text-[10px]">Save 2 months</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, p]) => {
                const price      = cycle === 'yearly' ? p.yearly : p.monthly
                const isSelected = selectedPlan === key
                const isCurrent  = profile?.plan === key
                return (
                  <div key={key} onClick={() => setSelectedPlan(key)}
                    className={`relative card p-5 cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-[#6c63ff]/70 bg-gradient-to-b from-[#6c63ff]/10 to-transparent'
                        : 'hover:border-white/[0.15]'
                    }`}>
                    {key === 'pro' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="badge badge-purple text-[10px] px-3">Most Popular</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-[#e8e8f0]">{p.name}</h3>
                      {isCurrent && <span className="badge badge-green text-[9px]">Active</span>}
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-[#e8e8f0]">ZMW {price}</span>
                      <span className="text-[#7a7a9a] text-xs ml-1">/{cycle === 'yearly' ? 'yr' : 'mo'}</span>
                      {cycle === 'yearly' && (
                        <p className="text-[10px] text-emerald-400 mt-0.5">≈ ZMW {Math.round(price / 12)}/mo</p>
                      )}
                    </div>
                    <ul className="space-y-2 mb-5">
                      {p.features.map(f => (
                        <li key={f} className="text-[11px] text-[#7a7a9a] flex items-start gap-2">
                          <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    <div className={`w-full py-2.5 rounded-lg text-xs font-semibold text-center transition-all ${
                      isSelected ? 'bg-[#6c63ff] text-white' : 'bg-[#1c1c28] text-[#7a7a9a] border border-white/[0.07]'
                    }`}>
                      {isSelected ? '✓ Selected' : 'Select Plan'}
                    </div>
                  </div>
                )
              })}
            </div>

            <button onClick={() => setStep('pay')} className="btn-primary py-3 px-8 text-sm">
              Pay ZMW {amount} with Airtel Money →
            </button>
          </div>
        )}

        {/* PAY */}
        {step === 'pay' && (
          <div className="max-w-md space-y-4">

            {/* Airtel Money card */}
            <div className="rounded-2xl overflow-hidden border border-white/[0.07]">
              <div className="bg-gradient-to-br from-red-600 via-red-600 to-red-700 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-black text-sm">A</span>
                  </div>
                  <div>
                    <p className="text-white font-bold">Airtel Money</p>
                    <p className="text-red-200 text-xs">Send to complete your order</p>
                  </div>
                </div>
                <div className="bg-black/20 rounded-xl p-4 space-y-4">
                  <div>
                    <p className="text-red-300 text-[10px] uppercase tracking-widest mb-1">Send To</p>
                    <p className="text-white font-bold text-3xl tracking-wider">{AIRTEL_NUMBER}</p>
                    <p className="text-red-200 text-xs mt-0.5">{BUSINESS_NAME}</p>
                  </div>
                  <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-red-300 text-[10px] uppercase tracking-widest mb-1">Amount</p>
                      <p className="text-white font-bold text-2xl">ZMW {amount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-300 text-[10px] uppercase tracking-widest mb-1">Plan</p>
                      <p className="text-white font-semibold">{plan.name}</p>
                      <p className="text-red-200 text-xs capitalize">{cycle}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#111118] p-5">
                <p className="text-[11px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-3">Steps</p>
                <div className="space-y-2.5">
                  {[
                    'Open Airtel Money on your phone',
                    `Tap "Send Money" → enter ${AIRTEL_NUMBER}`,
                    `Enter amount: ZMW ${amount}`,
                    'Reference: Flow-Student',
                    'Confirm with your Airtel PIN',
                    'Copy the Transaction ID from your SMS',
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-xs text-[#7a7a9a]">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="card p-5 space-y-4">
              <p className="text-sm font-semibold text-[#e8e8f0]">Confirm your payment</p>

              {error && (
                <div className="px-3 py-2.5 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-xs">{error}</div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#7a7a9a] mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Name used for payment" className="input" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7a7a9a] mb-1.5">Your Airtel Number</label>
                <div className="flex gap-2">
                  <span className="input w-16 text-center flex-shrink-0 text-[#7a7a9a] text-xs flex items-center justify-center">+260</span>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="97XXXXXXX" maxLength={9} className="input flex-1" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7a7a9a] mb-1.5">
                  Transaction ID <span className="text-red-400">*</span>
                </label>
                <input type="text" value={txRef} onChange={e => setTxRef(e.target.value)}
                  placeholder="e.g. CI250516.1234.A12345" className="input font-mono text-sm" />
                <p className="text-[10px] text-[#7a7a9a] mt-1">From your Airtel Money confirmation SMS</p>
              </div>

              <div className="bg-[#16161f] rounded-lg p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#7a7a9a]">
                  <span>{plan.name} ({cycle})</span>
                  <span className="text-[#e8e8f0]">ZMW {amount}</span>
                </div>
                <div className="border-t border-white/[0.07] pt-1.5 flex justify-between font-semibold">
                  <span className="text-[#e8e8f0]">Total</span>
                  <span className="text-emerald-400">ZMW {amount}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('plans')} className="btn-secondary flex-1 justify-center py-2.5 text-xs">← Back</button>
                <button onClick={submitPayment} disabled={submitting || !name || !phone || !txRef}
                  className="btn-primary flex-1 justify-center py-2.5 text-xs">
                  {submitting ? 'Submitting…' : "I've Paid ✓"}
                </button>
              </div>

              <p className="text-[10px] text-[#7a7a9a] text-center">
                After submitting, send your screenshot on WhatsApp for instant activation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

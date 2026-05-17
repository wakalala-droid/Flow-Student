'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard/settings`,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c63ff] to-violet-400 flex items-center justify-center text-lg">✦</div>
          <div>
            <div className="font-semibold text-base text-[#e8e8f0] leading-none">Flow-Student</div>
            <div className="text-[10px] font-bold tracking-widest text-violet-400 uppercase">AI Suite</div>
          </div>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="text-center space-y-3">
              <div className="text-4xl">📬</div>
              <h2 className="text-lg font-semibold text-[#e8e8f0]">Check your email</h2>
              <p className="text-sm text-[#7a7a9a]">We sent a reset link to <strong className="text-[#e8e8f0]">{email}</strong>.</p>
              <Link href="/auth/login" className="btn-primary inline-flex w-full justify-center py-2.5 mt-2">Back to login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-[#e8e8f0] mb-1">Reset password</h1>
              <p className="text-sm text-[#7a7a9a] mb-6">Enter your email and we'll send a reset link.</p>
              {error && <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm">{error}</div>}
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#7a7a9a] mb-1.5">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-sm text-[#7a7a9a] mt-5">
          <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">← Back to login</Link>
        </p>
      </div>
    </div>
  )
}

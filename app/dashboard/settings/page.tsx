'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          setProfile(data)
          setFullName(data?.full_name || '')
          setPhone(data?.phone || '')
        })
    })
  }, [])

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName, phone, updated_at: new Date().toISOString() }).eq('id', profile.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function changePassword() {
    if (!newPassword || newPassword.length < 6) { setPwMsg('Password must be at least 6 characters'); return }
    setPwSaving(true); setPwMsg('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwSaving(false)
    setPwMsg(error ? error.message : 'Password updated successfully!')
    setNewPassword('')
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#e8e8f0] tracking-tight">Settings</h1>
          <p className="text-sm text-[#7a7a9a] mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#e8e8f0]">Profile Information</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 flex items-center justify-center text-xl font-bold text-[#0a0a0f]">
              {fullName?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-[#e8e8f0]">{profile?.email}</p>
              <p className="text-xs text-[#7a7a9a] capitalize mt-0.5">{profile?.plan} plan · Member since {profile?.created_at ? new Date(profile.created_at).getFullYear() : '—'}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#7a7a9a] mb-1.5">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7a7a9a] mb-1.5">Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="+260 9X XXX XXXX" />
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving} className="btn-primary text-xs py-2 px-4">
            {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {/* Password */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#e8e8f0]">Change Password</h2>
          {pwMsg && (
            <div className={`px-3 py-2 rounded-lg text-xs ${pwMsg.includes('successfully') ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' : 'bg-red-400/10 border border-red-400/20 text-red-400'}`}>
              {pwMsg}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-[#7a7a9a] mb-1.5">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input" placeholder="Min. 6 characters" />
          </div>
          <button onClick={changePassword} disabled={pwSaving} className="btn-secondary text-xs py-2 px-4">
            {pwSaving ? 'Updating…' : 'Update Password'}
          </button>
        </div>

        {/* Plan info */}
        <div className="card p-6 space-y-3">
          <h2 className="text-sm font-semibold text-[#e8e8f0]">Plan & Usage</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#16161f] rounded-lg p-3">
              <p className="text-[10px] text-[#7a7a9a] uppercase tracking-wider">Plan</p>
              <p className="text-sm font-semibold text-[#e8e8f0] capitalize mt-0.5">{profile?.plan}</p>
            </div>
            <div className="bg-[#16161f] rounded-lg p-3">
              <p className="text-[10px] text-[#7a7a9a] uppercase tracking-wider">Words Used</p>
              <p className="text-sm font-semibold text-[#e8e8f0] mt-0.5">{profile?.words_used?.toLocaleString() ?? 0} / {profile?.words_limit?.toLocaleString() ?? 5000}</p>
            </div>
          </div>
          <a href="/dashboard/billing" className="btn-primary inline-flex text-xs py-2 px-4">Manage Plan →</a>
        </div>

        {/* Danger zone */}
        <div className="card p-6 space-y-3 border-red-400/20">
          <h2 className="text-sm font-semibold text-red-400">Account Actions</h2>
          <button onClick={signOut} className="btn-danger text-xs py-2 px-4">Sign Out</button>
        </div>
      </div>
    </div>
  )
}

'use client'
// app/dashboard/admin/page.tsx

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ScanRow { id: string; user_id: string; tool: string; word_count: number; created_at: string }
interface TxRow   { id: string; user_id: string; amount: number; currency: string; plan: string; status: string; network: string; mobile_number: string; created_at: string }
interface UserRow {
  id: string; email: string; full_name: string | null; avatar_url: string | null
  plan: string; words_used: number; words_limit: number; scans_used: number; scans_limit: number
  is_admin: boolean; is_unlimited: boolean; created_at: string
  scans: ScanRow[]; transactions: TxRow[]; total_scans: number; total_spent: number
}
type Tab        = 'overview' | 'users' | 'payments'
type PlanFilter = 'all' | 'free' | 'student' | 'pro' | 'team'

const PLAN_LIMITS: Record<string, { words: number; scans: number }> = {
  free: { words: 5_000, scans: 10 }, student: { words: 20_000, scans: 50 },
  pro:  { words: 50_000, scans: 200 }, team: { words: 200_000, scans: 1_000 },
}
const PC: Record<string, string> = {
  free: 'bg-[#7a7a9a]/20 text-[#9a9ab0] border-[#7a7a9a]/30',
  student: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  pro: 'bg-violet-400/20 text-violet-300 border-violet-400/30',
  team: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
}
const PI: Record<string, string> = { free: '🆓', student: '🎓', pro: '⚡', team: '🏢' }
const TI: Record<string, string> = {
  humanizer: '✨', detector: '🔍', plagiarism: '📋', paraphraser: '🔄',
  grammar: '✅', factcheck: '🧾', seo: '📈', tone: '🎭', citation: '📚',
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`
}
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('en-ZM', { day:'numeric', month:'short', year:'numeric' }) }

export default function AdminPage() {
  const supabase = createClient()
  const [tab,         setTab]         = useState<Tab>('overview')
  const [planFilter,  setPlanFilter]  = useState<PlanFilter>('all')
  const [search,      setSearch]      = useState('')
  const [allUsers,    setAllUsers]    = useState<UserRow[]>([])  // full unfiltered list
  const [allTxns,     setAllTxns]     = useState<TxRow[]>([])
  const [loading,     setLoading]     = useState(true)
  const [usersLoad,   setUsersLoad]   = useState(false)
  const [isAdmin,     setIsAdmin]     = useState(false)
  const [error,       setError]       = useState('')
  const [saving,      setSaving]      = useState<string|null>(null)
  const [expanded,    setExpanded]    = useState<string|null>(null)
  const [toast,       setToast]       = useState<{msg:string;ok:boolean}|null>(null)
  const [upgradeUser, setUpgradeUser] = useState<UserRow|null>(null)
  const [upgradePlan, setUpgradePlan] = useState('student')
  const [upgCycle,    setUpgCycle]    = useState<'monthly'|'yearly'>('monthly')
  const [upgrading,   setUpgrading]   = useState(false)

  // Client-side filter — no extra API calls when searching
  const users = allUsers.filter(u => {
    const q = search.trim().toLowerCase()
    const matchSearch = !q || u.email?.toLowerCase().includes(q) || (u.full_name?.toLowerCase() ?? '').includes(q)
    const matchPlan   = planFilter === 'all' || u.plan === planFilter
    return matchSearch && matchPlan
  })

  function toast_(msg: string, ok = true) { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }

  // Fetch ALL users once — no filters sent to server
  const fetchUsers = useCallback(async () => {
    setUsersLoad(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res  = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${session?.access_token ?? ''}` }
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to load users'); setAllUsers([]); return }
      setAllUsers(Array.isArray(data) ? data : [])
    } catch { setError('Network error — could not load users') }
    finally { setUsersLoad(false) }
  }, [])

  async function init() {
    setLoading(true); setError('')
    try {
      const ck = await fetch('/api/admin/check').then(r => r.json())
      if (!ck.isAdmin) { setIsAdmin(false); setLoading(false); return }
      setIsAdmin(true)
      // Load users and payments in parallel
      const [, txRes] = await Promise.all([
        fetchUsers(),
        supabase.from('payment_transactions').select('*').order('created_at', { ascending: false }).limit(500)
      ])
      setAllTxns(txRes.data ?? [])
    } catch { setError('Could not connect. Check your network.') }
    finally { setLoading(false) }
  }

  useEffect(() => { init() }, [])

  async function patchUser(userId: string, updates: Record<string, unknown>) {
    setSaving(userId)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token ?? ''}` },
      body: JSON.stringify({ userId, updates }),
    })
    const d = await res.json()
    res.ok ? toast_('Saved ✓') : toast_(d.error ?? 'Failed', false)
    await fetchUsers(); setSaving(null)
  }

  async function resetUsage(userId: string) {
    setSaving(userId)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token ?? ''}` },
      body: JSON.stringify({ userId, updates: { words_used: 0, scans_used: 0 } }),
    })
    toast_('Usage reset'); await fetchUsers(); setSaving(null)
  }

  async function deleteUser(u: UserRow) {
    if (!confirm(`Delete ${u.email}? Cannot be undone.`)) return
    setSaving(u.id)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token ?? ''}` },
      body: JSON.stringify({ userId: u.id }),
    })
    toast_('User deleted'); await fetchUsers(); setSaving(null)
  }

  async function doUpgrade() {
    if (!upgradeUser) return
    setUpgrading(true)
    try {
      const res = await fetch('/api/admin/upgrade', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: upgradeUser.id, plan: upgradePlan, billingCycle: upgCycle }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      toast_(`✅ ${upgradeUser.email} → ${upgradePlan.toUpperCase()}`)
      setUpgradeUser(null); await fetchUsers()
    } catch(e: unknown) { toast_(e instanceof Error ? e.message : 'Failed', false) }
    finally { setUpgrading(false) }
  }

  // ── Derived counts ────────────────────────────────────────────────────────
  const counts = {
    total:   allUsers.length,
    free:    allUsers.filter(u => u.plan === 'free').length,
    student: allUsers.filter(u => u.plan === 'student').length,
    pro:     allUsers.filter(u => u.plan === 'pro').length,
    team:    allUsers.filter(u => u.plan === 'team').length,
    paid:    allUsers.filter(u => u.plan !== 'free').length,
  }
  const totalScans   = allUsers.reduce((s, u) => s + (u.total_scans ?? 0), 0)
  const totalRevenue = allTxns.filter(t => t.status === 'success').reduce((s, t) => s + Number(t.amount), 0)

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#6c63ff] rounded-full animate-spin"/>
        <p className="text-sm text-[#7a7a9a]">Loading admin panel…</p>
      </div>
    </div>
  )
  if (!isAdmin) return (
    <div className="h-full flex items-center justify-center">
      <div className="card p-8 max-w-sm text-center space-y-3">
        <div className="text-4xl">🔒</div>
        <h2 className="text-lg font-semibold text-[#e8e8f0]">Admin Access Only</h2>
        <p className="text-xs text-[#7a7a9a]">Your account doesn't have admin privileges.</p>
      </div>
    </div>
  )

  const TABS = [
    { key:'overview' as Tab, icon:'📊', label:'Overview' },
    { key:'users'    as Tab, icon:'👥', label:`Users (${counts.total})` },
    { key:'payments' as Tab, icon:'💳', label:`Payments (${allTxns.length})` },
  ]
  const PLAN_TABS: { key: PlanFilter; label: string }[] = [
    { key:'all',     label:`All (${counts.total})` },
    { key:'free',    label:`🆓 Free (${counts.free})` },
    { key:'student', label:`🎓 Student (${counts.student})` },
    { key:'pro',     label:`⚡ Pro (${counts.pro})` },
    { key:'team',    label:`🏢 Team (${counts.team})` },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border transition-all
          ${toast.ok ? 'bg-emerald-400/20 border-emerald-400/30 text-emerald-300' : 'bg-red-400/20 border-red-400/30 text-red-300'}`}>
          {toast.msg}
        </div>
      )}

      {/* Upgrade modal */}
      {upgradeUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card p-6 w-full max-w-md space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#e8e8f0]">Upgrade User Plan</h3>
                <p className="text-xs text-[#7a7a9a] mt-0.5 truncate max-w-[280px]">{upgradeUser.email}</p>
              </div>
              <button onClick={() => setUpgradeUser(null)} className="text-[#7a7a9a] hover:text-[#e8e8f0] text-lg">✕</button>
            </div>
            <div className="flex items-center gap-2 bg-[#16161f] rounded-lg p-3 text-xs">
              <span className={`px-2 py-0.5 rounded-full border font-bold text-[10px] ${PC[upgradeUser.plan]}`}>{PI[upgradeUser.plan]} {upgradeUser.plan.toUpperCase()}</span>
              <span className="text-[#7a7a9a]">→</span>
              <span className={`px-2 py-0.5 rounded-full border font-bold text-[10px] ${PC[upgradePlan]}`}>{PI[upgradePlan]} {upgradePlan.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['free','student','pro','team'] as const).map(p => (
                <button key={p} onClick={() => setUpgradePlan(p)}
                  className={`p-3 rounded-xl border text-left transition-all ${upgradePlan===p ? `${PC[p]} border-current` : 'bg-[#16161f] border-white/[0.07] text-[#7a7a9a]'}`}>
                  <div className="text-sm font-semibold capitalize">{PI[p]} {p}</div>
                  <div className="text-[10px] mt-0.5 opacity-70">{PLAN_LIMITS[p].words.toLocaleString()} words · {PLAN_LIMITS[p].scans} scans</div>
                </button>
              ))}
            </div>
            {upgradePlan !== 'free' && (
              <div className="flex gap-2">
                {(['monthly','yearly'] as const).map(c => (
                  <button key={c} onClick={() => setUpgCycle(c)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium capitalize transition-all ${upgCycle===c ? 'bg-[#6c63ff]/20 border-[#6c63ff]/40 text-violet-300' : 'bg-[#16161f] border-white/[0.07] text-[#7a7a9a]'}`}>
                    {c}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setUpgradeUser(null)} disabled={upgrading} className="flex-1 btn-secondary py-2.5 text-sm">Cancel</button>
              <button onClick={doUpgrade} disabled={upgrading}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-[#6c63ff] hover:bg-[#7c73ff] text-white disabled:opacity-50 flex items-center justify-center gap-2">
                {upgrading ? <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"/>Upgrading…</> : `✓ Apply ${upgradePlan.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-3 flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-[#e8e8f0]">🛡 Admin Panel <span className="badge badge-red text-[10px] ml-1">ADMIN</span></h1>
          <p className="text-xs text-[#7a7a9a]">Every user, every scan, full control</p>
        </div>
        <button onClick={() => { init(); fetchUsers() }} className="ml-auto btn-ghost text-xs">↻ Refresh</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-3 pb-3 border-b border-white/[0.07] flex-shrink-0">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab===t.key ? 'bg-[#6c63ff]/20 text-violet-300 border border-[#6c63ff]/30' : 'text-[#7a7a9a] hover:text-[#e8e8f0]'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-300 text-xs flex items-center gap-2">
            ⚠ {error}
            <button onClick={() => { setError(''); init(); fetchUsers() }} className="ml-auto underline">Retry</button>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label:'Total Users',   value: counts.total,         color:'text-violet-400', icon:'👥' },
                { label:'Paid Users',    value: counts.paid,          color:'text-emerald-400',icon:'💎' },
                { label:'Total Scans',   value: totalScans,           color:'text-blue-400',   icon:'🔬' },
                { label:'Revenue (ZMW)', value: totalRevenue.toFixed(2), color:'text-orange-400',icon:'💰' },
              ].map(s => (
                <div key={s.label} className="card p-4">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[11px] text-[#7a7a9a] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Plan breakdown */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Users by Plan</h3>
              {(['free','student','pro','team'] as const).map(plan => {
                const count = counts[plan]; const pct = counts.total ? Math.round((count/counts.total)*100) : 0
                const bar: Record<string,string> = { free:'from-[#7a7a9a] to-[#7a7a9a]', student:'from-blue-400 to-blue-500', pro:'from-[#6c63ff] to-violet-400', team:'from-emerald-400 to-emerald-500' }
                return (
                  <button key={plan} onClick={() => { setTab('users'); setPlanFilter(plan) }} className="w-full mb-3 text-left group">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#7a7a9a] group-hover:text-[#e8e8f0] transition-colors">{PI[plan]} {plan.charAt(0).toUpperCase()+plan.slice(1)}</span>
                      <span className="text-[#e8e8f0] font-medium">{count} ({pct}%) →</span>
                    </div>
                    <div className="h-1.5 bg-[#1c1c28] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${bar[plan]}`} style={{width:`${pct}%`}}/>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Most active users */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-[#e8e8f0] mb-3">Most Active Users</h3>
              {[...users].sort((a,b) => b.total_scans - a.total_scans).slice(0,5).map(u => (
                <div key={u.id} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6c63ff] to-violet-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {(u.full_name?.[0] ?? u.email?.[0] ?? 'U').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#e8e8f0] truncate">{u.email}</p>
                    <p className="text-[11px] text-[#7a7a9a]">{u.total_scans} scans · {u.words_used?.toLocaleString()} words used</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${PC[u.plan]}`}>{PI[u.plan]} {u.plan.toUpperCase()}</span>
                </div>
              ))}
              {users.length === 0 && <p className="text-xs text-[#7a7a9a]">No users loaded yet — go to Users tab.</p>}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7a9a]">🔍</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…" className="input w-full pl-8"/>
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7a9a] hover:text-[#e8e8f0] text-xs">✕</button>}
            </div>

            {/* Plan pills */}
            <div className="flex gap-1.5 flex-wrap">
              {PLAN_TABS.map(f => (
                <button key={f.key} onClick={() => setPlanFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all whitespace-nowrap
                    ${planFilter===f.key ? (f.key==='all' ? 'bg-white/10 border-white/20 text-[#e8e8f0]' : `${PC[f.key]} border-current`) : 'bg-[#16161f] border-white/[0.07] text-[#7a7a9a] hover:border-white/20'}`}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="text-[11px] text-[#7a7a9a] flex items-center gap-2">
              {usersLoad
                ? <><span className="w-3 h-3 border border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin inline-block"/>Loading users from Supabase…</>
                : <span>Showing <span className="text-[#e8e8f0] font-medium">{users.length}</span> users{search ? ` · "${search}"` : ''}{planFilter!=='all' ? ` · ${planFilter}` : ''}</span>
              }
            </div>

            {/* User cards */}
            {!usersLoad && users.map(u => {
              const isExpanded = expanded === u.id
              const usagePct   = u.words_limit > 0 ? Math.min(100, Math.round((u.words_used/u.words_limit)*100)) : 0
              const usageColor = usagePct > 90 ? 'bg-red-400' : usagePct > 70 ? 'bg-orange-400' : 'bg-[#6c63ff]'

              return (
                <div key={u.id} className="card overflow-hidden">
                  {/* Main row */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6c63ff] to-violet-400 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {(u.full_name?.[0] ?? u.email?.[0] ?? 'U').toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-[#e8e8f0]">{u.full_name ?? '—'}</p>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${PC[u.plan]}`}>{PI[u.plan]} {u.plan.toUpperCase()}</span>
                          {u.is_admin     && <span className="badge badge-red text-[9px]">ADMIN</span>}
                          {u.is_unlimited && <span className="badge badge-purple text-[9px]">∞ UNLIMITED</span>}
                        </div>
                        <p className="text-xs text-[#7a7a9a]">{u.email}</p>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-[11px] text-[#7a7a9a]">
                            📝 {u.words_used?.toLocaleString() ?? 0} / {u.is_unlimited ? '∞' : u.words_limit?.toLocaleString()} words
                          </span>
                          <span className="text-[11px] text-[#7a7a9a]">
                            🔬 {u.total_scans} scans
                          </span>
                          {u.total_spent > 0 && (
                            <span className="text-[11px] text-emerald-400 font-medium">
                              💰 ZMW {u.total_spent.toFixed(2)}
                            </span>
                          )}
                          <span className="text-[11px] text-[#7a7a9a]">
                            📅 {fmtDate(u.created_at)}
                          </span>
                        </div>

                        {/* Usage bar */}
                        {!u.is_unlimited && u.words_limit > 0 && (
                          <div className="mt-2 h-1 bg-[#1c1c28] rounded-full overflow-hidden max-w-[200px]">
                            <div className={`h-full rounded-full transition-all ${usageColor}`} style={{width:`${usagePct}%`}}/>
                          </div>
                        )}
                      </div>

                      {saving===u.id && (
                        <span className="text-[11px] text-violet-400 flex items-center gap-1 flex-shrink-0">
                          <span className="w-3 h-3 border border-violet-400/30 border-t-violet-400 rounded-full animate-spin"/>Saving…
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap mt-3 pl-13">
                      <button onClick={() => { setUpgradeUser(u); setUpgradePlan(u.plan==='free'?'student':u.plan) }}
                        disabled={saving===u.id}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[#6c63ff]/20 border border-[#6c63ff]/40 text-violet-300 hover:bg-[#6c63ff]/30 transition-all">
                        ⬆ Upgrade Plan
                      </button>

                      <select value={u.plan} onChange={e => patchUser(u.id, {plan:e.target.value})}
                        disabled={saving===u.id} className="input py-1 text-xs w-28">
                        {['free','student','pro','team'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                      </select>

                      <button onClick={() => patchUser(u.id, {is_unlimited:!u.is_unlimited})} disabled={saving===u.id}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${u.is_unlimited ? 'bg-violet-400/20 border-violet-400/40 text-violet-300' : 'bg-[#16161f] border-white/[0.07] text-[#7a7a9a]'}`}>
                        {u.is_unlimited ? '∞ Unlimited' : 'Set Unlimited'}
                      </button>

                      <button onClick={() => patchUser(u.id, {is_admin:!u.is_admin})} disabled={saving===u.id}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${u.is_admin ? 'bg-red-400/20 border-red-400/40 text-red-400' : 'bg-[#16161f] border-white/[0.07] text-[#7a7a9a]'}`}>
                        {u.is_admin ? '🛡 Admin' : 'Make Admin'}
                      </button>

                      <button onClick={() => resetUsage(u.id)} disabled={saving===u.id}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#16161f] border border-white/[0.07] text-[#7a7a9a] hover:border-white/20 transition-all">
                        ↺ Reset Usage
                      </button>

                      <button onClick={() => setExpanded(isExpanded ? null : u.id)}
                        className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${isExpanded ? 'bg-blue-400/20 border-blue-400/40 text-blue-300' : 'bg-[#16161f] border-white/[0.07] text-[#7a7a9a] hover:border-white/20'}`}>
                        {isExpanded ? '▲ Hide Scans' : `▼ View Scans (${u.total_scans})`}
                      </button>

                      <button onClick={() => deleteUser(u)} disabled={saving===u.id}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition-all ml-auto">
                        🗑 Delete
                      </button>
                    </div>
                  </div>

                  {/* Expanded scan history */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.07] bg-[#13131c]">
                      <div className="px-4 py-2 flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-[#7a7a9a] uppercase tracking-wider">Scan History</p>
                        <p className="text-[11px] text-[#7a7a9a]">{u.scans.length} total</p>
                      </div>
                      {u.scans.length === 0 ? (
                        <p className="px-4 pb-4 text-xs text-[#7a7a9a]">No scans yet.</p>
                      ) : (
                        <div className="max-h-56 overflow-y-auto divide-y divide-white/[0.04]">
                          {u.scans.slice(0, 50).map(s => (
                            <div key={s.id} className="flex items-center gap-3 px-4 py-2">
                              <span className="text-base flex-shrink-0">{TI[s.tool] ?? '🔧'}</span>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-[#e8e8f0] capitalize">{s.tool}</p>
                                <p className="text-[11px] text-[#7a7a9a]">{s.word_count?.toLocaleString() ?? 0} words</p>
                              </div>
                              <p className="text-[11px] text-[#7a7a9a] flex-shrink-0">{timeAgo(s.created_at)}</p>
                            </div>
                          ))}
                          {u.scans.length > 50 && (
                            <p className="px-4 py-2 text-[11px] text-[#7a7a9a] text-center">+{u.scans.length-50} more scans</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {!usersLoad && users.length === 0 && !error && (
              <div className="text-center py-16 space-y-2">
                <p className="text-4xl">👥</p>
                <p className="text-sm text-[#e8e8f0] font-medium">No users found</p>
                <p className="text-xs text-[#7a7a9a]">{search ? `No results for "${search}"` : planFilter!=='all' ? `No users on ${planFilter} plan` : 'Make sure you ran the SQL fix in Supabase.'}</p>
                {(search||planFilter!=='all') && (
                  <button onClick={() => { setSearch(''); setPlanFilter('all') }} className="text-xs text-violet-400 hover:text-violet-300">Clear filters</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {tab === 'payments' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label:'Revenue',    value:`ZMW ${totalRevenue.toFixed(2)}`, color:'text-emerald-400' },
                { label:'Successful', value:allTxns.filter(t=>t.status==='success').length, color:'text-blue-400' },
                { label:'Pending',    value:allTxns.filter(t=>t.status==='pending').length,  color:'text-orange-400' },
              ].map(s => (
                <div key={s.label} className="card p-3 text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-[#7a7a9a]">{s.label}</p>
                </div>
              ))}
            </div>
            {allTxns.map(t => (
              <div key={t.id} className="card p-3.5 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-medium text-[#e8e8f0]">ZMW {t.amount}</p>
                    <span className={`badge text-[9px] ${t.status==='success'?'badge-green':t.status==='pending'?'badge-orange':'badge-red'}`}>{t.status.toUpperCase()}</span>
                    <span className="badge badge-blue text-[9px] capitalize">{t.plan}</span>
                  </div>
                  <p className="text-[11px] text-[#7a7a9a]">{t.network} · {t.mobile_number}</p>
                </div>
                <p className="text-[11px] text-[#7a7a9a] flex-shrink-0">{timeAgo(t.created_at)}</p>
              </div>
            ))}
            {allTxns.length === 0 && <p className="text-sm text-[#7a7a9a] text-center py-10">No payments yet.</p>}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'
// app/dashboard/admin/page.tsx

import { useState, useEffect, useCallback } from 'react'
import { formatDate } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils/format'
import { createClient } from '@/lib/supabase/client'

interface UserRow {
  id: string; email: string; full_name: string | null
  plan: string; words_used: number; words_limit: number
  scans_used: number; scans_limit: number
  is_admin: boolean; is_unlimited: boolean
  created_at: string; updated_at: string
}
interface ScanRow  { id: string; tool: string; word_count: number; created_at: string }
interface TxRow {
  id: string; amount: number; currency: string; network: string
  plan: string; status: string; mobile_number: string; created_at: string
}
type Tab        = 'overview' | 'users' | 'scans' | 'payments'
type PlanFilter = 'all' | 'free' | 'student' | 'pro' | 'team'

const PLAN_LIMITS: Record<string, { words: number; scans: number }> = {
  free:    { words: 5_000,   scans: 10  },
  student: { words: 20_000,  scans: 50  },
  pro:     { words: 50_000,  scans: 200 },
  team:    { words: 200_000, scans: 1_000 },
}
const PLAN_COLOR: Record<string, string> = {
  free:    'bg-[#7a7a9a]/20 text-[#9a9ab0] border-[#7a7a9a]/30',
  student: 'bg-blue-400/20  text-blue-300  border-blue-400/30',
  pro:     'bg-violet-400/20 text-violet-300 border-violet-400/30',
  team:    'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
}
const PLAN_ICON: Record<string, string> = { free:'🆓', student:'🎓', pro:'⚡', team:'🏢' }
const TOOL_ICON: Record<string, string> = {
  humanizer:'✨', detector:'🔍', plagiarism:'📋', paraphraser:'🔄',
  grammar:'✅', factcheck:'🧾', seo:'📈', tone:'🎭', citation:'📚',
}

export default function AdminPage() {
  const supabase = createClient()

  const [tab,        setTab]        = useState<Tab>('overview')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all')
  const [search,     setSearch]     = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [users,   setUsers]   = useState<UserRow[]>([])
  const [scans,   setScans]   = useState<ScanRow[]>([])
  const [txns,    setTxns]    = useState<TxRow[]>([])
  const [counts,  setCounts]  = useState<Record<string,number>>({})

  const [loading,     setLoading]     = useState(true)
  const [usersLoading,setUsersLoading]= useState(false)
  const [isAdmin,     setIsAdmin]     = useState(false)
  const [loadError,   setLoadError]   = useState('')
  const [saving,      setSaving]      = useState<string|null>(null)
  const [toast,       setToast]       = useState<{msg:string;type:'ok'|'err'}|null>(null)

  // Upgrade modal
  const [upgradeTarget, setUpgradeTarget] = useState<UserRow|null>(null)
  const [upgradePlan,   setUpgradePlan]   = useState('student')
  const [upgradeCycle,  setUpgradeCycle]  = useState<'monthly'|'yearly'>('monthly')
  const [upgrading,     setUpgrading]     = useState(false)

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  // Re-fetch users when filter or search changes
  useEffect(() => {
    if (isAdmin) fetchUsers()
  }, [planFilter, debouncedSearch, isAdmin])

  function showToast(msg: string, type: 'ok'|'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Initial load (admin check + scans + payments) ────────────────────────
  async function load() {
    setLoading(true); setLoadError('')
    try {
      const check = await fetch('/api/admin/check').then(r => r.json())
      if (!check.isAdmin) { setIsAdmin(false); setLoading(false); return }
      setIsAdmin(true)

      const [scansRes, txRes] = await Promise.all([
        supabase.from('ai_scans').select('id,tool,word_count,created_at').order('created_at',{ascending:false}).limit(200),
        supabase.from('payment_transactions').select('*').order('created_at',{ascending:false}).limit(200),
      ])
      setScans(scansRes.data ?? [])
      setTxns(Array.isArray(txRes) ? txRes : (txRes.data ?? []))
    } catch(e) {
      setLoadError('Failed to load. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // ── Fetch users (with server-side search + plan filter) ──────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (planFilter !== 'all') params.set('plan', planFilter)
      params.set('limit', '500')

      const res  = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()

      if (!res.ok) {
        setLoadError(data.error ?? 'Failed to load users')
        setUsers([])
        return
      }

      const rows: UserRow[] = Array.isArray(data) ? data : []
      setUsers(rows)

      // Update counts only when not filtered
      if (!debouncedSearch && planFilter === 'all') {
        setCounts({
          total:   rows.length,
          free:    rows.filter(u => u.plan === 'free').length,
          student: rows.filter(u => u.plan === 'student').length,
          pro:     rows.filter(u => u.plan === 'pro').length,
          team:    rows.filter(u => u.plan === 'team').length,
          paid:    rows.filter(u => u.plan !== 'free').length,
        })
      }
    } catch {
      setLoadError('Network error loading users')
    } finally {
      setUsersLoading(false)
    }
  }, [debouncedSearch, planFilter])

  useEffect(() => { load() }, [])

  // ── User actions ─────────────────────────────────────────────────────────
  async function updateUser(userId: string, updates: Partial<UserRow>) {
    setSaving(userId)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates }),
    })
    const data = await res.json()
    if (!res.ok) { showToast(data.error ?? 'Update failed', 'err') }
    else { showToast('User updated') }
    await fetchUsers(); setSaving(null)
  }

  async function resetUsage(userId: string) {
    setSaving(userId)
    await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates: { words_used:0, scans_used:0 } }),
    })
    showToast('Usage reset'); await fetchUsers(); setSaving(null)
  }

  async function deleteUser(userId: string, email: string) {
    if (!confirm(`Delete ${email}? This cannot be undone.`)) return
    setSaving(userId)
    await fetch('/api/admin/users', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    showToast('User deleted'); await fetchUsers(); setSaving(null)
  }

  // ── Upgrade modal ────────────────────────────────────────────────────────
  async function commitUpgrade() {
    if (!upgradeTarget) return
    setUpgrading(true)
    try {
      const res = await fetch('/api/admin/upgrade', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: upgradeTarget.id, plan: upgradePlan, billingCycle: upgradeCycle }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upgrade failed')
      showToast(`✅ ${upgradeTarget.email} → ${upgradePlan.toUpperCase()}`)
      setUpgradeTarget(null)
      await fetchUsers()
    } catch(e: unknown) {
      showToast(e instanceof Error ? e.message : 'Upgrade failed', 'err')
    } finally { setUpgrading(false) }
  }

  // ── Guards ───────────────────────────────────────────────────────────────
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
        <p className="text-xs text-[#7a7a9a]">Your account doesn't have admin access.</p>
      </div>
    </div>
  )

  const TABS = [
    { key:'overview' as Tab, label:'Overview',              icon:'📊' },
    { key:'users'    as Tab, label:`Users (${counts.total ?? users.length})`, icon:'👥' },
    { key:'scans'    as Tab, label:`Scans (${scans.length})`,  icon:'🔬' },
    { key:'payments' as Tab, label:`Payments (${txns.length})`,icon:'💳' },
  ]

  const PLAN_TABS: { key: PlanFilter; label: string }[] = [
    { key:'all',     label:`All (${counts.total ?? 0})` },
    { key:'free',    label:`🆓 Free (${counts.free ?? 0})` },
    { key:'student', label:`🎓 Student (${counts.student ?? 0})` },
    { key:'pro',     label:`⚡ Pro (${counts.pro ?? 0})` },
    { key:'team',    label:`🏢 Team (${counts.team ?? 0})` },
  ]

  const revenue = txns.filter(t => t.status === 'success').reduce((s,t) => s + t.amount, 0)

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border
          ${toast.type==='ok' ? 'bg-emerald-400/20 border-emerald-400/30 text-emerald-300' : 'bg-red-400/20 border-red-400/30 text-red-300'}`}>
          {toast.msg}
        </div>
      )}

      {/* Upgrade modal */}
      {upgradeTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card p-6 w-full max-w-md space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#e8e8f0]">Upgrade User Plan</h3>
                <p className="text-xs text-[#7a7a9a] mt-0.5 truncate max-w-[280px]">{upgradeTarget.email}</p>
              </div>
              <button onClick={() => setUpgradeTarget(null)} className="text-[#7a7a9a] hover:text-[#e8e8f0] text-lg">✕</button>
            </div>

            <div className="flex items-center gap-2 bg-[#16161f] rounded-lg p-3 text-xs">
              <span className={`px-2 py-0.5 rounded-full border font-bold text-[10px] ${PLAN_COLOR[upgradeTarget.plan]}`}>
                {PLAN_ICON[upgradeTarget.plan]} {upgradeTarget.plan.toUpperCase()}
              </span>
              <span className="text-[#7a7a9a]">→</span>
              <span className={`px-2 py-0.5 rounded-full border font-bold text-[10px] ${PLAN_COLOR[upgradePlan]}`}>
                {PLAN_ICON[upgradePlan]} {upgradePlan.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['free','student','pro','team'] as const).map(p => (
                <button key={p} onClick={() => setUpgradePlan(p)}
                  className={`p-3 rounded-xl border text-left transition-all ${upgradePlan===p ? `${PLAN_COLOR[p]} border-current` : 'bg-[#16161f] border-white/[0.07] text-[#7a7a9a] hover:border-white/20'}`}>
                  <div className="text-sm font-semibold capitalize">{PLAN_ICON[p]} {p}</div>
                  <div className="text-[10px] mt-0.5 opacity-70">{PLAN_LIMITS[p].words.toLocaleString()} words · {PLAN_LIMITS[p].scans} scans</div>
                </button>
              ))}
            </div>

            {upgradePlan !== 'free' && (
              <div className="flex gap-2">
                {(['monthly','yearly'] as const).map(c => (
                  <button key={c} onClick={() => setUpgradeCycle(c)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium capitalize transition-all ${upgradeCycle===c ? 'bg-[#6c63ff]/20 border-[#6c63ff]/40 text-violet-300' : 'bg-[#16161f] border-white/[0.07] text-[#7a7a9a]'}`}>
                    {c}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setUpgradeTarget(null)} disabled={upgrading} className="flex-1 btn-secondary py-2.5 text-sm">Cancel</button>
              <button onClick={commitUpgrade} disabled={upgrading}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-[#6c63ff] hover:bg-[#7c73ff] text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
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
          <p className="text-xs text-[#7a7a9a]">Full control — users, scans, payments</p>
        </div>
        <button onClick={load} className="ml-auto btn-ghost text-xs">↻ Refresh</button>
      </div>

      {/* Main tabs */}
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
        {loadError && (
          <div className="mb-4 p-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-300 text-xs flex items-center gap-2">
            ⚠ {loadError}
            <button onClick={() => { setLoadError(''); load() }} className="ml-auto underline">Retry</button>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label:'Total Users',   value: counts.total ?? 0,               color:'text-violet-400', icon:'👥' },
                { label:'Paid Users',    value: counts.paid  ?? 0,               color:'text-emerald-400',icon:'💎' },
                { label:'Total Scans',   value: scans.length,                    color:'text-blue-400',   icon:'🔬' },
                { label:'Revenue (ZMW)', value: revenue.toFixed(2),              color:'text-orange-400', icon:'💰' },
              ].map(s => (
                <div key={s.label} className="card p-4">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[11px] text-[#7a7a9a] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Users by Plan — click to filter</h3>
              {(['free','student','pro','team'] as const).map(plan => {
                const count = counts[plan] ?? 0
                const total = counts.total || 1
                const pct   = Math.round((count / total) * 100)
                const bar: Record<string,string> = {
                  free:'from-[#7a7a9a] to-[#7a7a9a]', student:'from-blue-400 to-blue-500',
                  pro:'from-[#6c63ff] to-violet-400',  team:'from-emerald-400 to-emerald-500',
                }
                return (
                  <button key={plan} onClick={() => { setTab('users'); setPlanFilter(plan) }}
                    className="w-full mb-3 text-left group hover:opacity-80 transition-opacity">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#7a7a9a] group-hover:text-[#e8e8f0] transition-colors">{PLAN_ICON[plan]} {plan.charAt(0).toUpperCase()+plan.slice(1)}</span>
                      <span className="text-[#e8e8f0] font-medium">{count} ({pct}%) →</span>
                    </div>
                    <div className="h-1.5 bg-[#1c1c28] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${bar[plan]}`} style={{width:`${pct}%`}}/>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Tool Usage</h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(
                  scans.reduce((acc,s) => { acc[s.tool]=(acc[s.tool]||0)+1; return acc }, {} as Record<string,number>)
                ).sort(([,a],[,b])=>b-a).map(([tool,count]) => (
                  <div key={tool} className="bg-[#16161f] rounded-lg p-3 flex items-center gap-2">
                    <span className="text-lg">{TOOL_ICON[tool]??'🔧'}</span>
                    <div>
                      <div className="text-xs font-medium text-[#e8e8f0] capitalize">{tool}</div>
                      <div className="text-[11px] text-[#7a7a9a]">{count} runs</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div className="space-y-3">

            {/* Search bar */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7a9a] text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="input w-full pl-8"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7a9a] hover:text-[#e8e8f0] text-xs">✕</button>
              )}
            </div>

            {/* Plan filter pills */}
            <div className="flex gap-1.5 flex-wrap">
              {PLAN_TABS.map(f => (
                <button key={f.key} onClick={() => setPlanFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all whitespace-nowrap
                    ${planFilter===f.key
                      ? f.key==='all' ? 'bg-white/10 border-white/20 text-[#e8e8f0]' : `${PLAN_COLOR[f.key]} border-current`
                      : 'bg-[#16161f] border-white/[0.07] text-[#7a7a9a] hover:border-white/20'}`}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Result info */}
            <div className="flex items-center gap-2 text-[11px] text-[#7a7a9a]">
              {usersLoading
                ? <><span className="w-3 h-3 border border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin"/>Loading users…</>
                : <span>Showing <span className="text-[#e8e8f0] font-medium">{users.length}</span> users{search ? ` matching "${search}"` : ''}{planFilter!=='all' ? ` on ${planFilter}` : ''}</span>
              }
            </div>

            {/* User cards */}
            {!usersLoading && users.map(u => (
              <div key={u.id} className="card p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6c63ff] to-violet-400 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {(u.full_name?.[0] ?? u.email?.[0] ?? 'U').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-[#e8e8f0]">{u.full_name ?? '—'}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${PLAN_COLOR[u.plan]}`}>
                        {PLAN_ICON[u.plan]} {u.plan.toUpperCase()}
                      </span>
                      {u.is_admin     && <span className="badge badge-red text-[9px]">ADMIN</span>}
                      {u.is_unlimited && <span className="badge badge-purple text-[9px]">∞</span>}
                    </div>
                    <p className="text-xs text-[#7a7a9a] mt-0.5">{u.email}</p>
                    <p className="text-[11px] text-[#7a7a9a]">
                      {u.words_used?.toLocaleString()} / {u.is_unlimited ? '∞' : u.words_limit?.toLocaleString()} words ·{' '}
                      {u.scans_used ?? 0} / {u.is_unlimited ? '∞' : u.scans_limit ?? 0} scans · joined {formatDate(u.created_at)}
                    </p>
                    {!u.is_unlimited && u.words_limit > 0 && (
                      <div className="mt-1.5 h-1 bg-[#1c1c28] rounded-full overflow-hidden max-w-[180px]">
                        <div className={`h-full rounded-full ${(u.words_used/u.words_limit)>.9?'bg-red-400':(u.words_used/u.words_limit)>.7?'bg-orange-400':'bg-[#6c63ff]'}`}
                          style={{width:`${Math.min(100,Math.round((u.words_used/u.words_limit)*100))}%`}}/>
                      </div>
                    )}
                  </div>
                  {saving===u.id && (
                    <span className="text-[11px] text-violet-400 flex items-center gap-1 flex-shrink-0">
                      <span className="w-3 h-3 border border-violet-400/30 border-t-violet-400 rounded-full animate-spin"/>
                      Saving…
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap pl-12">
                  <button onClick={() => { setUpgradeTarget(u); setUpgradePlan(u.plan==='free'?'student':u.plan) }}
                    disabled={saving===u.id}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[#6c63ff]/20 border border-[#6c63ff]/40 text-violet-300 hover:bg-[#6c63ff]/30 transition-all">
                    ⬆ Upgrade Plan
                  </button>

                  <select value={u.plan} onChange={e => updateUser(u.id,{plan:e.target.value})}
                    disabled={saving===u.id} className="input py-1 text-xs w-28">
                    {['free','student','pro','team'].map(p => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>
                    ))}
                  </select>

                  <button onClick={() => updateUser(u.id,{is_unlimited:!u.is_unlimited})} disabled={saving===u.id}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${u.is_unlimited?'bg-violet-400/20 border-violet-400/40 text-violet-300':'bg-[#16161f] border-white/[0.07] text-[#7a7a9a] hover:border-white/20'}`}>
                    {u.is_unlimited ? '∞ Unlimited' : 'Set Unlimited'}
                  </button>

                  <button onClick={() => updateUser(u.id,{is_admin:!u.is_admin})} disabled={saving===u.id}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${u.is_admin?'bg-red-400/20 border-red-400/40 text-red-400':'bg-[#16161f] border-white/[0.07] text-[#7a7a9a] hover:border-white/20'}`}>
                    {u.is_admin ? '🛡 Admin' : 'Make Admin'}
                  </button>

                  <button onClick={() => resetUsage(u.id)} disabled={saving===u.id}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#16161f] border border-white/[0.07] text-[#7a7a9a] hover:border-white/20 transition-all">
                    ↺ Reset Usage
                  </button>

                  <button onClick={() => deleteUser(u.id, u.email)} disabled={saving===u.id}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition-all">
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}

            {!usersLoading && users.length === 0 && (
              <div className="text-center py-16 space-y-2">
                <p className="text-3xl">👥</p>
                <p className="text-sm text-[#7a7a9a]">
                  {search ? `No users matching "${search}"` : planFilter !== 'all' ? `No users on ${planFilter} plan` : 'No users found'}
                </p>
                {(search || planFilter !== 'all') && (
                  <button onClick={() => { setSearch(''); setPlanFilter('all') }} className="text-xs text-violet-400 hover:text-violet-300">
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SCANS ── */}
        {tab === 'scans' && (
          <div className="space-y-2">
            <p className="text-xs text-[#7a7a9a] mb-3">Last 200 scans across all users</p>
            {scans.map(s => (
              <div key={s.id} className="card p-3 flex items-center gap-3">
                <span className="text-lg">{TOOL_ICON[s.tool]??'🔧'}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#e8e8f0] capitalize">{s.tool}</p>
                  <p className="text-[11px] text-[#7a7a9a]">{s.word_count} words</p>
                </div>
                <p className="text-[11px] text-[#7a7a9a]">{formatRelativeTime(s.created_at)}</p>
              </div>
            ))}
            {scans.length === 0 && <p className="text-sm text-[#7a7a9a] text-center py-10">No scans yet.</p>}
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {tab === 'payments' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label:'Total Revenue', value:`ZMW ${revenue.toFixed(2)}`,                          color:'text-emerald-400' },
                { label:'Successful',    value:txns.filter(t=>t.status==='success').length,           color:'text-blue-400'   },
                { label:'Pending',       value:txns.filter(t=>t.status==='pending').length,           color:'text-orange-400' },
              ].map(s => (
                <div key={s.label} className="card p-3 text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-[#7a7a9a]">{s.label}</p>
                </div>
              ))}
            </div>
            {txns.map(t => (
              <div key={t.id} className="card p-3.5 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-medium text-[#e8e8f0]">ZMW {t.amount}</p>
                    <span className={`badge text-[9px] ${t.status==='success'?'badge-green':t.status==='pending'?'badge-orange':'badge-red'}`}>{t.status.toUpperCase()}</span>
                    <span className="badge badge-blue text-[9px] capitalize">{t.plan}</span>
                  </div>
                  <p className="text-[11px] text-[#7a7a9a]">{t.network} · {t.mobile_number}</p>
                </div>
                <p className="text-[11px] text-[#7a7a9a]">{formatRelativeTime(t.created_at)}</p>
              </div>
            ))}
            {txns.length === 0 && <p className="text-sm text-[#7a7a9a] text-center py-10">No payments yet.</p>}
          </div>
        )}

      </div>
    </div>
  )
}

'use client'
// app/dashboard/admin/page.tsx  — replace your existing file with this

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils/format'

interface UserRow {
  id: string; email: string; full_name: string | null
  plan: string; words_used: number; words_limit: number
  scans_used: number; scans_limit: number
  is_admin: boolean; is_unlimited: boolean; created_at: string
}
interface ScanRow  { id: string; tool: string; word_count: number; created_at: string }
interface TxRow {
  id: string; amount: number; currency: string; network: string
  plan: string; status: string; mobile_number: string; created_at: string
}
type Tab      = 'overview' | 'users' | 'scans' | 'payments'
type PlanFilter = 'all' | 'free' | 'student' | 'pro' | 'team'

const PLAN_LIMITS: Record<string, { words: number; scans: number }> = {
  free:    { words: 5_000,   scans: 10  },
  student: { words: 20_000,  scans: 50  },
  pro:     { words: 50_000,  scans: 200 },
  team:    { words: 200_000, scans: 1_000 },
}

const PLAN_COLORS: Record<string, string> = {
  free:    'bg-[#7a7a9a]/20 text-[#7a7a9a] border-[#7a7a9a]/30',
  student: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  pro:     'bg-violet-400/20 text-violet-300 border-violet-400/30',
  team:    'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
}

const PLAN_ICONS: Record<string, string> = {
  free: '🆓', student: '🎓', pro: '⚡', team: '🏢',
}

const TOOL_ICONS: Record<string, string> = {
  humanizer:'✨', detector:'🔍', plagiarism:'📋', paraphraser:'🔄',
  grammar:'✅', factcheck:'🧾', seo:'📈', tone:'🎭', citation:'📚',
}

export default function AdminPage() {
  const [tab,        setTab]        = useState<Tab>('overview')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all')
  const [users,      setUsers]      = useState<UserRow[]>([])
  const [scans,      setScans]      = useState<ScanRow[]>([])
  const [txns,       setTxns]       = useState<TxRow[]>([])
  const [stats,      setStats]      = useState<Record<string, number>>({})
  const [loading,    setLoading]    = useState(true)
  const [isAdmin,    setIsAdmin]    = useState(false)
  const [search,     setSearch]     = useState('')
  const [saving,     setSaving]     = useState<string | null>(null)
  const [toast,      setToast]      = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  // Upgrade modal state
  const [upgradeTarget, setUpgradeTarget]   = useState<UserRow | null>(null)
  const [upgradePlan,   setUpgradePlan]     = useState('student')
  const [upgradeCycle,  setUpgradeCycle]    = useState<'monthly' | 'yearly'>('monthly')
  const [upgradeNote,   setUpgradeNote]     = useState('Manually upgraded by admin')
  const [upgrading,     setUpgrading]       = useState(false)

  const supabase = createClient()

  useEffect(() => { load() }, [])

  function showToast(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function load() {
    setLoading(true)
    const check = await fetch('/api/admin/check').then(r => r.json())
    if (!check.isAdmin) { setIsAdmin(false); setLoading(false); return }
    setIsAdmin(true)

    const [usersRes, scansRes, txRes] = await Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      supabase.from('ai_scans').select('id,tool,word_count,created_at').order('created_at', { ascending: false }).limit(200),
      supabase.from('payment_transactions').select('*').order('created_at', { ascending: false }).limit(200),
    ])

    const u: UserRow[] = Array.isArray(usersRes) ? usersRes : []
    const s: ScanRow[] = scansRes.data ?? []
    const t: TxRow[]   = Array.isArray(txRes) ? txRes : (txRes.data ?? [])

    setUsers(u); setScans(s); setTxns(t)
    setStats({
      totalUsers:  u.length,
      freeUsers:   u.filter(x => x.plan === 'free').length,
      studentUsers:u.filter(x => x.plan === 'student').length,
      proUsers:    u.filter(x => x.plan === 'pro').length,
      teamUsers:   u.filter(x => x.plan === 'team').length,
      paidUsers:   u.filter(x => x.plan !== 'free').length,
      totalScans:  s.length,
      revenue:     t.filter(x => x.status === 'success').reduce((a, x) => a + x.amount, 0),
    })
    setLoading(false)
  }

  async function updateUser(userId: string, updates: Partial<UserRow>) {
    setSaving(userId)
    const extra: Record<string, unknown> = {}
    if (updates.plan) {
      extra.words_limit = PLAN_LIMITS[updates.plan]?.words ?? 5000
      extra.scans_limit = PLAN_LIMITS[updates.plan]?.scans ?? 10
    }
    if (updates.is_unlimited) {
      extra.words_limit = 999_999_999
      extra.scans_limit = 999_999_999
    }
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates: { ...updates, ...extra } }),
    })
    await load(); setSaving(null)
  }

  async function resetUsage(userId: string) {
    setSaving(userId)
    await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates: { words_used: 0, scans_used: 0 } }),
    })
    await load(); setSaving(null)
    showToast('Usage reset to zero')
  }

  async function deleteUser(userId: string) {
    if (!confirm('Delete this user permanently? This cannot be undone.')) return
    setSaving(userId)
    await fetch('/api/admin/users', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    await load(); setSaving(null)
    showToast('User deleted')
  }

  // ── ONE-CLICK PLAN UPGRADE ──────────────────────────────────────────────────
  async function openUpgradeModal(user: UserRow) {
    setUpgradeTarget(user)
    setUpgradePlan(user.plan === 'free' ? 'student' : user.plan)
    setUpgradeCycle('monthly')
    setUpgradeNote('Manually upgraded by admin')
  }

  async function commitUpgrade() {
    if (!upgradeTarget) return
    setUpgrading(true)
    try {
      const res = await fetch('/api/admin/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:      upgradeTarget.id,
          plan:        upgradePlan,
          billingCycle: upgradeCycle,
          note:        upgradeNote,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      showToast(`✅ ${upgradeTarget.email} upgraded to ${upgradePlan.toUpperCase()}`)
      setUpgradeTarget(null)
      await load()
    } catch (e: unknown) {
      showToast(`❌ ${e instanceof Error ? e.message : 'Upgrade failed'}`, 'err')
    } finally {
      setUpgrading(false)
    }
  }

  // ── FILTERS ─────────────────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchSearch = u.email?.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name?.toLowerCase() ?? '').includes(search.toLowerCase())
    const matchPlan = planFilter === 'all' || u.plan === planFilter
    return matchSearch && matchPlan
  })

  // ── LOADING / ACCESS GUARDS ─────────────────────────────────────────────────
  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#6c63ff] rounded-full animate-spin"/>
        <p className="text-sm text-[#7a7a9a]">Loading admin panel...</p>
      </div>
    </div>
  )

  if (!isAdmin) return (
    <div className="h-full flex items-center justify-center">
      <div className="card p-8 max-w-sm text-center space-y-4">
        <div className="text-4xl">🔒</div>
        <h2 className="text-lg font-semibold text-[#e8e8f0]">Admin Access Only</h2>
        <p className="text-sm text-[#7a7a9a]">Run the SQL fix in Supabase then refresh.</p>
      </div>
    </div>
  )

  const TABS = [
    { key: 'overview' as Tab, label: 'Overview',               icon: '📊' },
    { key: 'users'    as Tab, label: `Users (${users.length})`,icon: '👥' },
    { key: 'scans'    as Tab, label: `Scans (${scans.length})`,icon: '🔬' },
    { key: 'payments' as Tab, label: `Payments (${txns.length})`,icon: '💳' },
  ]

  const PLAN_FILTER_TABS: { key: PlanFilter; label: string; count: number }[] = [
    { key: 'all',     label: 'All',     count: users.length },
    { key: 'free',    label: '🆓 Free', count: stats.freeUsers    ?? 0 },
    { key: 'student', label: '🎓 Student', count: stats.studentUsers ?? 0 },
    { key: 'pro',     label: '⚡ Pro',  count: stats.proUsers    ?? 0 },
    { key: 'team',    label: '🏢 Team', count: stats.teamUsers   ?? 0 },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border transition-all
          ${toast.type === 'ok'
            ? 'bg-emerald-400/20 border-emerald-400/30 text-emerald-300'
            : 'bg-red-400/20 border-red-400/30 text-red-300'}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Upgrade Modal ──────────────────────────────────────────────────── */}
      {upgradeTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card p-6 w-full max-w-md space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#e8e8f0]">Upgrade User Plan</h3>
                <p className="text-xs text-[#7a7a9a] mt-0.5 truncate max-w-[260px]">{upgradeTarget.email}</p>
              </div>
              <button onClick={() => setUpgradeTarget(null)} className="text-[#7a7a9a] hover:text-[#e8e8f0] text-lg leading-none">✕</button>
            </div>

            {/* Current plan badge */}
            <div className="flex items-center gap-2 bg-[#16161f] rounded-lg p-3">
              <span className="text-xs text-[#7a7a9a]">Current plan:</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PLAN_COLORS[upgradeTarget.plan]}`}>
                {PLAN_ICONS[upgradeTarget.plan]} {upgradeTarget.plan.toUpperCase()}
              </span>
              <span className="text-[#7a7a9a] text-xs">→</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PLAN_COLORS[upgradePlan]}`}>
                {PLAN_ICONS[upgradePlan]} {upgradePlan.toUpperCase()}
              </span>
            </div>

            {/* Plan selector */}
            <div>
              <label className="text-xs text-[#7a7a9a] block mb-2">Select new plan</label>
              <div className="grid grid-cols-2 gap-2">
                {(['free', 'student', 'pro', 'team'] as const).map(p => {
                  const lim = PLAN_LIMITS[p]
                  return (
                    <button key={p} onClick={() => setUpgradePlan(p)}
                      className={`p-3 rounded-xl border text-left transition-all ${upgradePlan === p
                        ? `${PLAN_COLORS[p]} border-current`
                        : 'bg-[#16161f] border-white/[0.07] text-[#7a7a9a] hover:border-white/20'}`}>
                      <div className="text-sm font-semibold capitalize">{PLAN_ICONS[p]} {p}</div>
                      <div className="text-[10px] mt-0.5 opacity-70">
                        {lim.words.toLocaleString()} words · {lim.scans} scans
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Billing cycle */}
            {upgradePlan !== 'free' && (
              <div>
                <label className="text-xs text-[#7a7a9a] block mb-2">Billing cycle (for subscription record)</label>
                <div className="flex gap-2">
                  {(['monthly', 'yearly'] as const).map(c => (
                    <button key={c} onClick={() => setUpgradeCycle(c)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium capitalize transition-all ${upgradeCycle === c
                        ? 'bg-[#6c63ff]/20 border-[#6c63ff]/40 text-violet-300'
                        : 'bg-[#16161f] border-white/[0.07] text-[#7a7a9a] hover:border-white/20'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Limits preview */}
            <div className="bg-[#16161f] rounded-lg p-3 space-y-1.5">
              <p className="text-[10px] text-[#7a7a9a] font-medium uppercase tracking-wider mb-2">Limits after upgrade</p>
              {[
                ['Words / month', PLAN_LIMITS[upgradePlan].words.toLocaleString()],
                ['Scans / month', PLAN_LIMITS[upgradePlan].scans.toLocaleString()],
                ['Subscription',  upgradePlan === 'free' ? 'Free' : `ZMW ${upgradePlan === 'student' ? 49 : upgradePlan === 'pro' ? 99 : 249}/mo`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-[#7a7a9a]">{label}</span>
                  <span className="text-[#e8e8f0] font-medium">{val}</span>
                </div>
              ))}
            </div>

            {/* Note */}
            <div>
              <label className="text-xs text-[#7a7a9a] block mb-1.5">Admin note (optional)</label>
              <input type="text" value={upgradeNote} onChange={e => setUpgradeNote(e.target.value)}
                className="input w-full text-xs py-2" placeholder="e.g. Manual upgrade — paid via cash"/>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setUpgradeTarget(null)} disabled={upgrading}
                className="flex-1 btn-secondary py-2.5 text-sm">
                Cancel
              </button>
              <button onClick={commitUpgrade} disabled={upgrading}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-[#6c63ff] hover:bg-[#7c73ff] text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {upgrading
                  ? <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"/>Upgrading…</>
                  : `✓ Apply ${upgradePlan.toUpperCase()} Plan`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-3 flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-[#e8e8f0]">🛡 Admin Panel
            <span className="badge badge-red text-[10px] ml-2">ADMIN</span>
          </h1>
          <p className="text-xs text-[#7a7a9a]">Full control — users, scans, payments</p>
        </div>
        <button onClick={load} className="ml-auto btn-ghost text-xs">↻ Refresh</button>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 px-6 pt-3 flex-shrink-0 border-b border-white/[0.07] pb-3">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t.key
              ? 'bg-[#6c63ff]/20 text-violet-300 border border-[#6c63ff]/30'
              : 'text-[#7a7a9a] hover:text-[#e8e8f0]'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-5">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Users',   value: stats.totalUsers,                             color: 'text-violet-400', icon: '👥' },
                { label: 'Paid Users',    value: stats.paidUsers,                              color: 'text-emerald-400',icon: '💎' },
                { label: 'Total Scans',   value: stats.totalScans,                             color: 'text-blue-400',   icon: '🔬' },
                { label: 'Revenue (ZMW)', value: `${(stats.revenue ?? 0).toFixed(2)}`,         color: 'text-orange-400', icon: '💰' },
              ].map(s => (
                <div key={s.label} className="card p-4">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[11px] text-[#7a7a9a] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tier breakdown — clickable to jump to filter */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Users by Plan</h3>
              {[
                { plan: 'free',    label: 'Free',    color: 'from-[#7a7a9a] to-[#7a7a9a]' },
                { plan: 'student', label: 'Student', color: 'from-blue-400 to-blue-500'    },
                { plan: 'pro',     label: 'Pro',     color: 'from-[#6c63ff] to-violet-400' },
                { plan: 'team',    label: 'Team',    color: 'from-emerald-400 to-emerald-500' },
              ].map(({ plan, label, color }) => {
                const count = users.filter(u => u.plan === plan).length
                const pct   = users.length ? Math.round((count / users.length) * 100) : 0
                return (
                  <button key={plan} onClick={() => { setTab('users'); setPlanFilter(plan as PlanFilter) }}
                    className="w-full mb-3 text-left hover:opacity-80 transition-opacity group">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#7a7a9a] group-hover:text-[#e8e8f0] transition-colors">
                        {PLAN_ICONS[plan]} {label}
                      </span>
                      <span className="text-[#e8e8f0] font-medium">{count} ({pct}%) →</span>
                    </div>
                    <div className="h-1.5 bg-[#1c1c28] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${pct}%` }}/>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Tool usage */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Tool Usage</h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(
                  scans.reduce((acc, s) => { acc[s.tool] = (acc[s.tool] || 0) + 1; return acc }, {} as Record<string, number>)
                ).sort(([, a], [, b]) => b - a).map(([tool, count]) => (
                  <div key={tool} className="bg-[#16161f] rounded-lg p-3 flex items-center gap-2">
                    <span className="text-lg">{TOOL_ICONS[tool] ?? '🔧'}</span>
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

        {/* ── USERS ─────────────────────────────────────────────────────── */}
        {tab === 'users' && (
          <div className="space-y-3">
            {/* Search + plan filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by email or name…" className="input flex-1 max-w-xs"/>
              <div className="flex gap-1 flex-wrap">
                {PLAN_FILTER_TABS.map(f => (
                  <button key={f.key} onClick={() => setPlanFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all whitespace-nowrap
                      ${planFilter === f.key
                        ? f.key === 'all'
                          ? 'bg-white/10 border-white/20 text-[#e8e8f0]'
                          : `${PLAN_COLORS[f.key]} border-current`
                        : 'bg-[#16161f] border-white/[0.07] text-[#7a7a9a] hover:border-white/20'}`}>
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Result count */}
            <p className="text-[11px] text-[#7a7a9a]">
              Showing {filteredUsers.length} of {users.length} users
              {planFilter !== 'all' && ` · filtered by ${planFilter}`}
            </p>

            {/* User cards */}
            {filteredUsers.map(u => (
              <div key={u.id} className="card p-4 space-y-3">
                <div className="flex items-start gap-3 flex-wrap">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6c63ff] to-violet-400 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {(u.full_name?.[0] ?? u.email?.[0] ?? 'U').toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-[#e8e8f0]">{u.full_name ?? '—'}</p>
                      {/* Plan badge */}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${PLAN_COLORS[u.plan]}`}>
                        {PLAN_ICONS[u.plan]} {u.plan.toUpperCase()}
                      </span>
                      {u.is_admin     && <span className="badge badge-red text-[9px]">ADMIN</span>}
                      {u.is_unlimited && <span className="badge badge-purple text-[9px]">∞ Unlimited</span>}
                    </div>
                    <p className="text-xs text-[#7a7a9a]">{u.email}</p>
                    <p className="text-[11px] text-[#7a7a9a] mt-0.5">
                      {u.words_used?.toLocaleString()} / {u.is_unlimited ? '∞' : u.words_limit?.toLocaleString()} words ·{' '}
                      {u.scans_used ?? 0} / {u.is_unlimited ? '∞' : u.scans_limit ?? '?'} scans · joined {formatDate(u.created_at)}
                    </p>
                    {/* Word usage bar */}
                    {!u.is_unlimited && u.words_limit > 0 && (
                      <div className="mt-1.5 h-1 bg-[#1c1c28] rounded-full overflow-hidden max-w-[200px]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            (u.words_used / u.words_limit) > 0.9 ? 'bg-red-400' :
                            (u.words_used / u.words_limit) > 0.7 ? 'bg-orange-400' : 'bg-[#6c63ff]'
                          }`}
                          style={{ width: `${Math.min(100, Math.round((u.words_used / u.words_limit) * 100))}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {saving === u.id && (
                    <span className="text-[11px] text-violet-400 flex items-center gap-1 flex-shrink-0">
                      <span className="w-3 h-3 border border-violet-400/30 border-t-violet-400 rounded-full animate-spin"/>
                      Saving…
                    </span>
                  )}
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 flex-wrap pl-12">
                  {/* ── ONE-CLICK UPGRADE BUTTON ── */}
                  <button
                    onClick={() => openUpgradeModal(u)}
                    disabled={saving === u.id}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[#6c63ff]/20 border border-[#6c63ff]/40 text-violet-300 hover:bg-[#6c63ff]/30 transition-all flex items-center gap-1.5">
                    ⬆ Upgrade Plan
                  </button>

                  {/* Quick plan dropdown (still available for power users) */}
                  <select value={u.plan} onChange={e => updateUser(u.id, { plan: e.target.value })}
                    disabled={saving === u.id} className="input py-1 text-xs w-28" title="Quick plan change">
                    {['free', 'student', 'pro', 'team'].map(p => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>

                  <button onClick={() => updateUser(u.id, { is_unlimited: !u.is_unlimited })} disabled={saving === u.id}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${u.is_unlimited
                      ? 'bg-violet-400/20 border-violet-400/40 text-violet-300'
                      : 'bg-[#16161f] border-white/[0.07] text-[#7a7a9a] hover:border-white/20'}`}>
                    {u.is_unlimited ? '∞ Unlimited' : 'Set Unlimited'}
                  </button>

                  <button onClick={() => updateUser(u.id, { is_admin: !u.is_admin })} disabled={saving === u.id}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${u.is_admin
                      ? 'bg-red-400/20 border-red-400/40 text-red-400'
                      : 'bg-[#16161f] border-white/[0.07] text-[#7a7a9a] hover:border-white/20'}`}>
                    {u.is_admin ? '🛡 Admin' : 'Make Admin'}
                  </button>

                  <button onClick={() => resetUsage(u.id)} disabled={saving === u.id}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#16161f] border border-white/[0.07] text-[#7a7a9a] hover:border-white/20 transition-all">
                    ↺ Reset Usage
                  </button>

                  <button onClick={() => deleteUser(u.id)} disabled={saving === u.id}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition-all">
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-16 space-y-2">
                <p className="text-3xl">🔍</p>
                <p className="text-sm text-[#7a7a9a]">No users found{planFilter !== 'all' ? ` on ${planFilter} plan` : ''}.</p>
                {planFilter !== 'all' && (
                  <button onClick={() => setPlanFilter('all')} className="text-xs text-violet-400 hover:text-violet-300">
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SCANS ─────────────────────────────────────────────────────── */}
        {tab === 'scans' && (
          <div className="space-y-2">
            <p className="text-xs text-[#7a7a9a] mb-3">Last 200 AI scans across all users</p>
            {scans.map(s => (
              <div key={s.id} className="card p-3 flex items-center gap-3">
                <span className="text-lg flex-shrink-0">{TOOL_ICONS[s.tool] ?? '🔧'}</span>
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

        {/* ── PAYMENTS ──────────────────────────────────────────────────── */}
        {tab === 'payments' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Total Revenue', value: `ZMW ${txns.filter(t => t.status === 'success').reduce((s, t) => s + t.amount, 0).toFixed(2)}`, color: 'text-emerald-400' },
                { label: 'Successful',    value: txns.filter(t => t.status === 'success').length, color: 'text-blue-400' },
                { label: 'Pending',       value: txns.filter(t => t.status === 'pending').length,  color: 'text-orange-400' },
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
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-medium text-[#e8e8f0]">ZMW {t.amount}</p>
                    <span className={`badge text-[9px] ${t.status === 'success' ? 'badge-green' : t.status === 'pending' ? 'badge-orange' : 'badge-red'}`}>
                      {t.status.toUpperCase()}
                    </span>
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

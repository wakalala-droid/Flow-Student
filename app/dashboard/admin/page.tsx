'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils/format'

interface UserRow {
  id: string; email: string; full_name: string | null
  plan: string; words_used: number; words_limit: number
  scans_used: number; is_admin: boolean; is_unlimited: boolean; created_at: string
}
interface ScanRow { id: string; tool: string; word_count: number; created_at: string }
interface TxRow {
  id: string; amount: number; currency: string; network: string
  plan: string; status: string; mobile_number: string; created_at: string
}
type Tab = 'overview' | 'users' | 'scans' | 'payments'

const TOOL_ICONS: Record<string, string> = {
  humanizer:'✨',detector:'🔍',plagiarism:'📋',paraphraser:'🔄',
  grammar:'✅',factcheck:'🧾',seo:'📈',tone:'🎭',citation:'📚',
}

export default function AdminPage() {
  const [tab, setTab]       = useState<Tab>('overview')
  const [users, setUsers]   = useState<UserRow[]>([])
  const [scans, setScans]   = useState<ScanRow[]>([])
  const [txns, setTxns]     = useState<TxRow[]>([])
  const [stats, setStats]   = useState<Record<string,number>>({})
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState<string|null>(null)
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)

    // Check admin via service-role API (bypasses RLS)
    const check = await fetch('/api/admin/check').then(r => r.json())
    if (!check.isAdmin) { setIsAdmin(false); setLoading(false); return }
    setIsAdmin(true)

    // Load all data via service role API
    const [usersRes, scansRes, txRes] = await Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      supabase.from('ai_scans').select('id,tool,word_count,created_at').order('created_at',{ascending:false}).limit(100),
      supabase.from('payment_transactions').select('*').order('created_at',{ascending:false}).limit(100),
    ])

    const u: UserRow[] = Array.isArray(usersRes) ? usersRes : []
    const s: ScanRow[] = scansRes.data ?? []
    const t: TxRow[]   = Array.isArray(txRes) ? txRes : txRes.data ?? []

    setUsers(u); setScans(s); setTxns(t)
    setStats({
      totalUsers: u.length,
      paidUsers:  u.filter(x => x.plan !== 'free').length,
      totalScans: s.length,
      revenue:    t.filter(x => x.status === 'success').reduce((a,x) => a + x.amount, 0),
    })
    setLoading(false)
  }

  async function updateUser(userId: string, updates: Partial<UserRow>) {
    setSaving(userId)
    const planLimits: Record<string,{words:number;scans:number}> = {
      free:{words:5000,scans:10}, student:{words:20000,scans:50},
      pro:{words:50000,scans:200}, team:{words:200000,scans:1000},
    }
    const extra: Record<string,unknown> = {}
    if (updates.plan) { extra.words_limit = planLimits[updates.plan]?.words ?? 5000 }
    if (updates.is_unlimited) { extra.words_limit = 999999999 }
    await fetch('/api/admin/users', {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ userId, updates: { ...updates, ...extra } }),
    })
    await load(); setSaving(null)
  }

  async function resetUsage(userId: string) {
    setSaving(userId)
    await fetch('/api/admin/users', {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ userId, updates: { words_used:0, scans_used:0 } }),
    })
    await load(); setSaving(null)
  }

  async function deleteUser(userId: string) {
    if (!confirm('Delete this user permanently?')) return
    setSaving(userId)
    await fetch('/api/admin/users', {
      method:'DELETE', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ userId }),
    })
    await load(); setSaving(null)
  }

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name?.toLowerCase() ?? '').includes(search.toLowerCase())
  )

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
        <div className="bg-[#16161f] rounded-lg p-3 text-left">
          <p className="text-[11px] text-[#7a7a9a] mb-1">Run in Supabase SQL Editor:</p>
          <code className="text-[11px] text-emerald-400">
            ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;<br/>
            ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN DEFAULT false;<br/>
            UPDATE public.profiles SET is_admin=true, is_unlimited=true, plan='team', words_limit=999999999 WHERE email='YOUR_EMAIL';
          </code>
        </div>
        <a href="/dashboard/humanizer" className="btn-secondary inline-flex w-full justify-center py-2">Go to Dashboard</a>
      </div>
    </div>
  )

  const TABS = [
    {key:'overview' as Tab, label:'Overview',              icon:'📊'},
    {key:'users'    as Tab, label:`Users (${users.length})`, icon:'👥'},
    {key:'scans'    as Tab, label:`Scans (${scans.length})`, icon:'🔬'},
    {key:'payments' as Tab, label:`Payments (${txns.length})`,icon:'💳'},
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-3 flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-[#e8e8f0]">🛡 Admin Panel <span className="badge badge-red text-[10px] ml-1">ADMIN</span></h1>
          <p className="text-xs text-[#7a7a9a]">Full control — users, scans, payments</p>
        </div>
        <button onClick={load} className="ml-auto btn-ghost text-xs">↻ Refresh</button>
      </div>

      <div className="flex gap-1 px-6 pt-3 flex-shrink-0 border-b border-white/[0.07] pb-3">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab===t.key?'bg-[#6c63ff]/20 text-violet-300 border border-[#6c63ff]/30':'text-[#7a7a9a] hover:text-[#e8e8f0]'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {label:'Total Users',   value:stats.totalUsers,                    color:'text-violet-400', icon:'👥'},
                {label:'Paid Users',    value:stats.paidUsers,                     color:'text-emerald-400',icon:'💎'},
                {label:'Total Scans',   value:stats.totalScans,                    color:'text-blue-400',   icon:'🔬'},
                {label:'Revenue (ZMW)', value:`${(stats.revenue??0).toFixed(2)}`,  color:'text-orange-400', icon:'💰'},
              ].map(s => (
                <div key={s.label} className="card p-4">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[11px] text-[#7a7a9a] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Users by Plan</h3>
              {[
                {plan:'free',    label:'Free',    color:'from-[#7a7a9a] to-[#7a7a9a]'},
                {plan:'student', label:'Student', color:'from-blue-400 to-blue-500'},
                {plan:'pro',     label:'Pro',     color:'from-[#6c63ff] to-violet-400'},
                {plan:'team',    label:'Team',    color:'from-emerald-400 to-emerald-500'},
              ].map(({plan,label,color}) => {
                const count = users.filter(u => u.plan === plan).length
                const pct   = users.length ? Math.round((count/users.length)*100) : 0
                return (
                  <div key={plan} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#7a7a9a]">{label}</span>
                      <span className="text-[#e8e8f0] font-medium">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-[#1c1c28] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{width:`${pct}%`}}/>
                    </div>
                  </div>
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
                    <span className="text-lg">{TOOL_ICONS[tool]??'🔧'}</span>
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

        {/* USERS */}
        {tab === 'users' && (
          <div className="space-y-3">
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search by email or name..." className="input max-w-sm"/>
            {filteredUsers.map(u => (
              <div key={u.id} className="card p-4 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6c63ff] to-violet-400 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {(u.full_name?.[0] ?? u.email?.[0] ?? 'U').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-[#e8e8f0]">{u.full_name ?? '—'}</p>
                      {u.is_admin     && <span className="badge badge-red text-[9px]">ADMIN</span>}
                      {u.is_unlimited && <span className="badge badge-purple text-[9px]">∞ Unlimited</span>}
                    </div>
                    <p className="text-xs text-[#7a7a9a]">{u.email}</p>
                    <p className="text-[11px] text-[#7a7a9a]">
                      {u.words_used?.toLocaleString()} / {u.is_unlimited?'∞':u.words_limit?.toLocaleString()} words · joined {formatDate(u.created_at)}
                    </p>
                  </div>
                  {saving === u.id && <span className="text-[11px] text-violet-400 flex items-center gap-1"><span className="w-3 h-3 border border-violet-400/30 border-t-violet-400 rounded-full animate-spin"/>Saving...</span>}
                </div>

                <div className="flex items-center gap-2 flex-wrap pl-12">
                  <select value={u.plan} onChange={e=>updateUser(u.id,{plan:e.target.value})}
                    disabled={saving===u.id} className="input py-1 text-xs w-28">
                    {['free','student','pro','team'].map(p=>(
                      <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>
                    ))}
                  </select>

                  <button onClick={()=>updateUser(u.id,{is_unlimited:!u.is_unlimited})} disabled={saving===u.id}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${u.is_unlimited?'bg-violet-400/20 border-violet-400/40 text-violet-300':'bg-[#16161f] border-white/[0.07] text-[#7a7a9a] hover:border-white/20'}`}>
                    {u.is_unlimited?'∞ Unlimited':'Set Unlimited'}
                  </button>

                  <button onClick={()=>updateUser(u.id,{is_admin:!u.is_admin})} disabled={saving===u.id}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${u.is_admin?'bg-red-400/20 border-red-400/40 text-red-400':'bg-[#16161f] border-white/[0.07] text-[#7a7a9a] hover:border-white/20'}`}>
                    {u.is_admin?'🛡 Admin':'Make Admin'}
                  </button>

                  <button onClick={()=>resetUsage(u.id)} disabled={saving===u.id}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#16161f] border border-white/[0.07] text-[#7a7a9a] hover:border-white/20 transition-all">
                    ↺ Reset Usage
                  </button>

                  <button onClick={()=>deleteUser(u.id)} disabled={saving===u.id}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition-all">
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
            {filteredUsers.length===0 && <p className="text-sm text-[#7a7a9a] text-center py-10">No users found.</p>}
          </div>
        )}

        {/* SCANS */}
        {tab === 'scans' && (
          <div className="space-y-2">
            <p className="text-xs text-[#7a7a9a] mb-3">Last 100 AI scans across all users</p>
            {scans.map(s => (
              <div key={s.id} className="card p-3 flex items-center gap-3">
                <span className="text-lg flex-shrink-0">{TOOL_ICONS[s.tool]??'🔧'}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#e8e8f0] capitalize">{s.tool}</p>
                  <p className="text-[11px] text-[#7a7a9a]">{s.word_count} words</p>
                </div>
                <p className="text-[11px] text-[#7a7a9a]">{formatRelativeTime(s.created_at)}</p>
              </div>
            ))}
            {scans.length===0 && <p className="text-sm text-[#7a7a9a] text-center py-10">No scans yet.</p>}
          </div>
        )}

        {/* PAYMENTS */}
        {tab === 'payments' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                {label:'Total Revenue', value:`ZMW ${txns.filter(t=>t.status==='success').reduce((s,t)=>s+t.amount,0).toFixed(2)}`, color:'text-emerald-400'},
                {label:'Successful',    value:txns.filter(t=>t.status==='success').length, color:'text-blue-400'},
                {label:'Pending',       value:txns.filter(t=>t.status==='pending').length, color:'text-orange-400'},
              ].map(s=>(
                <div key={s.label} className="card p-3 text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-[#7a7a9a]">{s.label}</p>
                </div>
              ))}
            </div>
            {txns.map(t=>(
              <div key={t.id} className="card p-3.5 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-medium text-[#e8e8f0]">ZMW {t.amount}</p>
                    <span className={`badge text-[9px] ${t.status==='success'?'badge-green':t.status==='pending'?'badge-orange':'badge-red'}`}>{t.status.toUpperCase()}</span>
                    <span className="badge badge-blue text-[9px] capitalize">{t.plan}</span>
                  </div>
                  <p className="text-[11px] text-[#7a7a9a]">{t.network} · {t.mobile_number}</p>
                </div>
                <p className="text-[11px] text-[#7a7a9a]">{formatRelativeTime(t.created_at)}</p>
              </div>
            ))}
            {txns.length===0 && <p className="text-sm text-[#7a7a9a] text-center py-10">No payments yet.</p>}
          </div>
        )}

      </div>
    </div>
  )
}

'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { TOOLS } from '@/types'
import type { Profile } from '@/types'

const NAV_EXTRAS = [
  { href: '/dashboard/documents', icon: '📁', label: 'Documents' },
  { href: '/dashboard/billing',   icon: '💳', label: 'Billing' },
  { href: '/dashboard/settings',  icon: '⚙️', label: 'Settings' },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const usagePct = profile ? Math.round((profile.words_used / profile.words_limit) * 100) : 0

  useEffect(() => {
    fetch('/api/admin/check').then(r => r.json()).then(d => setIsAdmin(d.isAdmin))
  }, [])

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col bg-[#111118] border-r border-white/[0.07] overflow-hidden">
      <div className="px-4 py-5 border-b border-white/[0.07]">
        <Link href="/dashboard/humanizer" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c63ff] to-violet-400 flex items-center justify-center text-base flex-shrink-0">✦</div>
          <div>
            <div className="text-[13px] font-semibold text-[#e8e8f0] leading-none tracking-tight">Flow-Student</div>
            <div className="text-[9px] font-bold tracking-widest text-violet-400 uppercase mt-0.5">AI Suite</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
        <p className="px-2.5 pt-2 pb-1.5 text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-widest">Tools</p>
        {TOOLS.map(tool => {
          const href   = `/dashboard/${tool.key}`
          const active = pathname === href
          return (
            <Link key={tool.key} href={href} className={cn('nav-item', active && 'nav-item-active')}>
              <span className="text-base w-5 text-center flex-shrink-0">{tool.icon}</span>
              <span className="truncate">{tool.label}</span>
              {tool.badge && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#6c63ff]/25 text-violet-300">{tool.badge}</span>
              )}
            </Link>
          )
        })}

        <p className="px-2.5 pt-4 pb-1.5 text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-widest">Account</p>
        {NAV_EXTRAS.map(item => (
          <Link key={item.href} href={item.href} className={cn('nav-item', pathname === item.href && 'nav-item-active')}>
            <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        {/* Admin — only shown if is_admin = true */}
        {isAdmin && (
          <Link href="/dashboard/admin" className={cn('nav-item', pathname === '/dashboard/admin' && 'nav-item-active')}>
            <span className="text-base w-5 text-center flex-shrink-0">🛡️</span>
            <span>Admin Panel</span>
            <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-400/20 text-red-400">ADMIN</span>
          </Link>
        )}
      </nav>

      <div className="border-t border-white/[0.07] p-3">
        <div className="flex items-center gap-2.5 mb-3 px-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 flex items-center justify-center text-[11px] font-bold text-[#0a0a0f] flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-[#e8e8f0] truncate">{profile?.full_name ?? 'User'}</div>
            <div className="text-[10px] text-[#7a7a9a] capitalize">{profile?.plan ?? 'free'} plan</div>
          </div>
        </div>
        <div className="h-1 bg-[#1c1c28] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-violet-400 transition-all"
            style={{ width: `${Math.min(usagePct, 100)}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-[#7a7a9a] mt-1">
          <span>{profile?.words_used?.toLocaleString() ?? 0} / {(profile?.words_limit ?? 0) >= 999999999 ? '∞' : profile?.words_limit?.toLocaleString()} words</span>
          {profile?.plan === 'free' && <Link href="/dashboard/billing" className="text-violet-400">Upgrade</Link>}
        </div>
      </div>
    </aside>
  )
}

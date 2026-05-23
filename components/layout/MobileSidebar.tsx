'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { TOOLS } from '@/types'
import type { Profile } from '@/types'

const NAV_EXTRAS = [
  { href: '/dashboard/documents', icon: '📁', label: 'Documents' },
  { href: '/dashboard/billing',   icon: '💳', label: 'Billing' },
  { href: '/dashboard/settings',  icon: '⚙️', label: 'Settings' },
  { href: '/dashboard/admin',     icon: '🛡️', label: 'Admin Panel' },
]

export default function MobileSidebar({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/5 transition-colors text-[#7a7a9a] hover:text-[#e8e8f0]"
        aria-label="Open menu">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)} />
      )}

      {/* Drawer */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-72 bg-[#111118] border-r border-white/[0.07] flex flex-col transition-transform duration-300 ease-out',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="px-4 py-5 border-b border-white/[0.07] flex items-center justify-between">
          <Link href="/dashboard/humanizer" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c63ff] to-violet-400 flex items-center justify-center text-base">✦</div>
            <div>
              <div className="text-[13px] font-semibold text-[#e8e8f0] leading-none">Flow-Student</div>
              <div className="text-[9px] font-bold tracking-widest text-violet-400 uppercase mt-0.5">AI Suite</div>
            </div>
          </Link>
          <button onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#7a7a9a] hover:text-[#e8e8f0] transition-colors">
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <p className="px-2.5 pt-2 pb-1.5 text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-widest">Tools</p>
          {TOOLS.map(tool => {
            const href   = `/dashboard/${tool.key}`
            const active = pathname === href
            return (
              <Link key={tool.key} href={href} onClick={() => setOpen(false)}
                className={cn('nav-item', active && 'nav-item-active')}>
                <span className="text-lg w-6 text-center flex-shrink-0">{tool.icon}</span>
                <span className="truncate">{tool.label}</span>
                {tool.badge && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#6c63ff]/25 text-violet-300">
                    {tool.badge}
                  </span>
                )}
              </Link>
            )
          })}

          <p className="px-2.5 pt-4 pb-1.5 text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-widest">Account</p>
          {NAV_EXTRAS.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={cn('nav-item', pathname === item.href && 'nav-item-active')}>
              <span className="text-lg w-6 text-center flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/[0.07] p-4 mobile-safe-bottom">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 flex items-center justify-center text-sm font-bold text-[#0a0a0f] flex-shrink-0">
              {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-[#e8e8f0] truncate">{profile?.full_name ?? 'User'}</div>
              <div className="text-xs text-[#7a7a9a] capitalize">{profile?.plan ?? 'free'} plan</div>
            </div>
          </div>
          {profile?.plan === 'free' && (
            <Link href="/dashboard/billing" onClick={() => setOpen(false)}
              className="mt-3 btn-primary w-full justify-center text-xs py-2.5">
              ✦ Upgrade Plan
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}

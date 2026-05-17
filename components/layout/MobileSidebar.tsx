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
]

export default function MobileSidebar({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 text-[#7a7a9a] hover:text-[#e8e8f0]"
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-[#111118] border-r border-white/[0.07] flex flex-col transition-transform duration-200 lg:hidden',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="px-4 py-5 border-b border-white/[0.07] flex items-center justify-between">
          <Link href="/dashboard/humanizer" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c63ff] to-violet-400 flex items-center justify-center text-base">✦</div>
            <div>
              <div className="text-[13px] font-semibold text-[#e8e8f0] leading-none">Flow-Student</div>
              <div className="text-[9px] font-bold tracking-widest text-violet-400 uppercase mt-0.5">AI Suite</div>
            </div>
          </Link>
          <button onClick={() => setOpen(false)} className="text-[#7a7a9a] hover:text-[#e8e8f0] text-lg">✕</button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
          <p className="px-2.5 pt-2 pb-1.5 text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-widest">Tools</p>
          {TOOLS.map(tool => {
            const href = `/dashboard/${tool.key}`
            const active = pathname === href
            return (
              <Link key={tool.key} href={href} onClick={() => setOpen(false)}
                className={cn('nav-item', active && 'nav-item-active')}>
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
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={cn('nav-item', pathname === item.href && 'nav-item-active')}>
              <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/[0.07] p-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 flex items-center justify-center text-[11px] font-bold text-[#0a0a0f] flex-shrink-0">
              {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#e8e8f0] truncate">{profile?.full_name ?? 'User'}</div>
              <div className="text-[10px] text-[#7a7a9a] capitalize">{profile?.plan ?? 'free'} plan</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

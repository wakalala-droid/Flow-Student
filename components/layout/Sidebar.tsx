'use client'
import Link from 'next/link'
import { LOGO_BASE64 } from '@/lib/logo'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { TOOLS } from '@/types'
import type { Profile } from '@/types'
import ToolIcon from '@/components/shared/ToolIcon'

const NAV_EXTRAS = [
  { href: '/dashboard/documents', iconKey: 'documents', label: 'Documents' },
  { href: '/dashboard/billing',   iconKey: 'billing',   label: 'Billing'    },
  { href: '/dashboard/settings',  iconKey: 'settings',  label: 'Settings'   },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const usagePct = profile
    ? Math.min(100, Math.round((profile.words_used / profile.words_limit) * 100))
    : 0

  useEffect(() => {
    fetch('/api/admin/check').then(r => r.json()).then(d => setIsAdmin(d.isAdmin))
  }, [])

  return (
    <aside className="w-[232px] flex-shrink-0 flex flex-col bg-[#111118] border-r border-white/[0.07] overflow-hidden">

      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/[0.07]">
        <Link href="/dashboard/humanizer" className="flex items-center gap-2.5 group">
          <img src={LOGO_BASE64} alt="Flow-Student" style={{ width:34, height:34, borderRadius:10, flexShrink:0 }} />
          <div>
            <div className="text-[14px] font-semibold text-[#e8e8f0] leading-none tracking-[-0.3px]">Flow-Student</div>
            <div className="text-[10px] font-bold tracking-[0.15em] text-violet-400 uppercase mt-1">AI Suite</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2.5 space-y-px">
        <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-[#5a5a7a] uppercase tracking-[0.08em]">Tools</p>

        {TOOLS.map(tool => {
          const href   = `/dashboard/${tool.key}`
          const active = pathname === href
          return (
            <Link
              key={tool.key}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-[7px] rounded-xl text-[13px] font-medium transition-all duration-150 group leading-none',
                active
                  ? 'bg-[#6c63ff]/15 text-[#e8e8f0]'
                  : 'text-[#8888a8] hover:text-[#c8c8d8] hover:bg-white/[0.04]'
              )}
            >
              {/* Icon container — matches Quillbot style */}
              <span className={cn(
                'flex-shrink-0 flex items-center justify-center w-[30px] h-[30px] rounded-lg transition-all duration-150',
                active
                  ? 'bg-[#6c63ff]/25 text-[#a89eff]'
                  : 'bg-white/[0.04] text-[#7a7a9a] group-hover:bg-white/[0.07] group-hover:text-[#c8c8d8]'
              )}>
                <ToolIcon toolKey={tool.key} size={16} />
              </span>

              <span className="truncate font-medium">{tool.label}</span>

              {tool.badge && (
                <span className={cn(
                  'ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 leading-none',
                  tool.badge === 'HOT' ? 'bg-orange-400/20 text-orange-300' :
                  tool.badge === 'NEW' ? 'bg-emerald-400/20 text-emerald-300' :
                  'bg-[#6c63ff]/20 text-violet-300'
                )}>
                  {tool.badge}
                </span>
              )}
            </Link>
          )
        })}

        <div className="my-1.5 mx-1 border-t border-white/[0.05]" />
        <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-[#5a5a7a] uppercase tracking-[0.08em]">Account</p>

        {NAV_EXTRAS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-[7px] rounded-xl text-[13px] font-medium transition-all duration-150 group leading-none',
                active
                  ? 'bg-[#6c63ff]/15 text-[#e8e8f0]'
                  : 'text-[#8888a8] hover:text-[#c8c8d8] hover:bg-white/[0.04]'
              )}
            >
              <span className={cn(
                'flex-shrink-0 flex items-center justify-center w-[30px] h-[30px] rounded-lg transition-all duration-150',
                active
                  ? 'bg-[#6c63ff]/25 text-[#a89eff]'
                  : 'bg-white/[0.04] text-[#7a7a9a] group-hover:bg-white/[0.07] group-hover:text-[#c8c8d8]'
              )}>
                <ToolIcon toolKey={item.iconKey} size={16} />
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}

        {/* Admin link */}
        {isAdmin && (
          <Link
            href="/dashboard/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-[7px] rounded-xl text-[13px] font-medium transition-all duration-150 group leading-none',
              pathname === '/dashboard/admin'
                ? 'bg-red-400/15 text-red-300'
                : 'text-[#7a7a9a] hover:text-red-300 hover:bg-red-400/[0.06]'
            )}
          >
            <span className={cn(
              'flex-shrink-0 flex items-center justify-center w-[30px] h-[30px] rounded-lg transition-all',
              pathname === '/dashboard/admin'
                ? 'bg-red-400/20 text-red-400'
                : 'bg-white/[0.04] text-[#7a7a9a] group-hover:bg-red-400/10 group-hover:text-red-400'
            )}>
              <ToolIcon toolKey="admin" size={16} />
            </span>
            <span className="font-medium">Admin</span>
            <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-400/20 text-red-400 flex-shrink-0">
              ADMIN
            </span>
          </Link>
        )}
      </nav>

      {/* Usage footer */}
      <div className="border-t border-white/[0.07] p-3 space-y-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-[#e8e8f0] truncate leading-none">{profile?.full_name ?? 'User'}</div>
            <div className="text-[11px] text-[#6666aa] capitalize mt-0.5">{profile?.plan ?? 'free'} plan</div>
          </div>
        </div>

        <div>
          <div className="h-1 bg-[#1c1c28] rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                usagePct > 90 ? 'bg-red-400' :
                usagePct > 70 ? 'bg-orange-400' :
                'bg-gradient-to-r from-[#6c63ff] to-violet-400'
              )}
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#6666aa] mt-1.5">
            <span>
              {profile?.words_used?.toLocaleString() ?? 0}
              {' / '}
              {(profile?.words_limit ?? 0) >= 999_999_999 ? '∞' : profile?.words_limit?.toLocaleString()} words
            </span>
            {profile?.plan === 'free' && (
              <Link href="/dashboard/billing" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

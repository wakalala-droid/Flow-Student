'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard/humanizer',  icon: '✨', label: 'Humanize' },
  { href: '/dashboard/detector',   icon: '🔍', label: 'Detect' },
  { href: '/dashboard/grammar',    icon: '✅', label: 'Grammar' },
  { href: '/dashboard/documents',  icon: '📁', label: 'Docs' },
  { href: '/dashboard/billing',    icon: '💳', label: 'Billing' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#111118] border-t border-white/[0.07] mobile-safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[56px]',
                active ? 'text-violet-400' : 'text-[#7a7a9a]'
              )}>
              <span className="text-xl leading-none">{item.icon}</span>
              <span className={cn('text-[10px] font-medium', active ? 'text-violet-400' : 'text-[#7a7a9a]')}>
                {item.label}
              </span>
              {active && <span className="absolute bottom-0 w-1 h-1 rounded-full bg-violet-400" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

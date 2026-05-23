'use client'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TOOLS } from '@/types'
import type { Profile } from '@/types'

interface TopbarProps {
  profile: Profile | null
  mobileSidebar?: React.ReactNode
}

export default function Topbar({ profile, mobileSidebar }: TopbarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const toolKey  = pathname.split('/')[2]
  const tool     = TOOLS.find(t => t.key === toolKey)

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="h-14 flex-shrink-0 flex items-center px-4 lg:px-6 border-b border-white/[0.07] bg-[#0a0a0f] gap-3">
      {/* Mobile menu button */}
      <div className="lg:hidden flex-shrink-0">
        {mobileSidebar}
      </div>

      {/* Tool info */}
      {tool ? (
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">{tool.icon}</span>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-[#e8e8f0] leading-none truncate">{tool.label}</div>
            <div className="text-[11px] text-[#7a7a9a] mt-0.5 hidden sm:block truncate">{tool.description}</div>
          </div>
        </div>
      ) : (
        <div className="text-[13px] font-semibold text-[#e8e8f0] capitalize">{toolKey}</div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {profile?.plan === 'free' && (
          <a href="/dashboard/billing"
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6c63ff] to-violet-400 text-white hover:opacity-90 transition-opacity whitespace-nowrap">
            ✦ Upgrade
          </a>
        )}
        <button onClick={signOut}
          className="flex items-center gap-2 cursor-pointer group p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 flex items-center justify-center text-[11px] font-bold text-[#0a0a0f] flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <span className="text-[11px] text-[#7a7a9a] group-hover:text-[#e8e8f0] transition-colors hidden sm:block">Sign out</span>
        </button>
      </div>
    </header>
  )
}

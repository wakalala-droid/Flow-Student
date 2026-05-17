'use client'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TOOLS } from '@/types'
import type { Profile } from '@/types'

export default function Topbar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const toolKey = pathname.split('/')[2]
  const tool = TOOLS.find(t => t.key === toolKey)

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="h-14 flex-shrink-0 flex items-center px-6 border-b border-white/[0.07] bg-[#0a0a0f] gap-4">
      {tool ? (
        <>
          <span className="text-xl">{tool.icon}</span>
          <div>
            <div className="text-[13px] font-semibold text-[#e8e8f0] leading-none">{tool.label}</div>
            <div className="text-[11px] text-[#7a7a9a] mt-0.5">{tool.description}</div>
          </div>
        </>
      ) : (
        <div className="text-[13px] font-semibold text-[#e8e8f0] capitalize">{toolKey}</div>
      )}

      <div className="ml-auto flex items-center gap-3">
        {profile?.plan === 'free' && (
          <a href="/dashboard/billing"
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6c63ff] to-violet-400 text-white hover:opacity-90 transition-opacity">
            ✦ Upgrade
          </a>
        )}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={signOut}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 flex items-center justify-center text-[11px] font-bold text-[#0a0a0f]">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <span className="text-[11px] text-[#7a7a9a] group-hover:text-[#e8e8f0] transition-colors hidden sm:block">Sign out</span>
        </div>
      </div>
    </header>
  )
}

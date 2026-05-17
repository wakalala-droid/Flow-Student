'use client'
import Link from 'next/link'
import type { Profile } from '@/types'

interface UsageGateProps {
  profile: Profile | null
  children: React.ReactNode
  toolMinPlan?: 'free' | 'student' | 'pro'
}

const PLAN_ORDER = { free: 0, student: 1, pro: 2, team: 3 }

export default function UsageGate({ profile, children, toolMinPlan = 'free' }: UsageGateProps) {
  if (!profile) return <>{children}</>

  const userRank = PLAN_ORDER[profile.plan as keyof typeof PLAN_ORDER] ?? 0
  const minRank  = PLAN_ORDER[toolMinPlan] ?? 0

  // Plan too low
  if (userRank < minRank) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <h2 className="text-lg font-semibold text-[#e8e8f0]">Upgrade Required</h2>
          <p className="text-sm text-[#7a7a9a]">
            This tool requires the <span className="text-violet-300 capitalize font-medium">{toolMinPlan}</span> plan or higher.
          </p>
          <Link href="/dashboard/billing" className="btn-primary inline-flex w-full justify-center py-2.5">
            View Plans →
          </Link>
        </div>
      </div>
    )
  }

  // Word limit reached
  if (profile.words_used >= profile.words_limit) {
    const pct = Math.round((profile.words_used / profile.words_limit) * 100)
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">📊</div>
          <h2 className="text-lg font-semibold text-[#e8e8f0]">Word Limit Reached</h2>
          <p className="text-sm text-[#7a7a9a]">
            You've used {profile.words_used.toLocaleString()} of {profile.words_limit.toLocaleString()} words this month.
          </p>
          <div className="h-2 bg-[#1c1c28] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <Link href="/dashboard/billing" className="btn-primary inline-flex w-full justify-center py-2.5">
            Upgrade Plan →
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

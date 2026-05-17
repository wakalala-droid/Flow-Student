'use client'
import ToolShell from '@/components/tools/ToolShell'
import ScoreCard from '@/components/shared/ScoreCard'
import { cn } from '@/lib/utils'

export default function FactCheckPage() {
  return (
    <ToolShell
      toolKey="factcheck"
      outputLabel="Fact Check Report"
      placeholder="Paste text containing factual claims to verify…"
      runLabel="Fact Check"
    >
      {(state) => {
        const r = state.result as {
          claims?: { claim: string; status: string; confidence: number; explanation: string; source: string; correction?: string }[]
          overallScore?: number; totalClaims?: number; verified?: number; falseCount?: number; uncertain?: number
        }
        const claims = r.claims ?? []
        const statusStyle: Record<string, { badge: string; dot: string; label: string }> = {
          verified:     { badge: 'badge-green',  dot: 'bg-emerald-400', label: '✓ Verified' },
          false:        { badge: 'badge-red',     dot: 'bg-red-400',     label: '✗ False' },
          uncertain:    { badge: 'badge-orange',  dot: 'bg-orange-400',  label: '~ Uncertain' },
          unverifiable: { badge: 'badge-blue',    dot: 'bg-blue-400',    label: '? Unverifiable' },
        }

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <ScoreCard label="Credibility" value={`${r.overallScore ?? 0}/100`} progress={r.overallScore} color={r.overallScore! >= 70 ? 'green' : 'orange'} />
              <ScoreCard label="Claims" value={r.totalClaims ?? 0} color="blue" />
              <ScoreCard label="Verified" value={r.verified ?? 0} color="green" />
              <ScoreCard label="False" value={r.falseCount ?? 0} color="red" />
            </div>

            <div className="space-y-2.5">
              <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider">Claims Analysis</p>
              {claims.map((claim, i) => {
                const s = statusStyle[claim.status] ?? statusStyle.unverifiable
                return (
                  <div key={i} className="card p-3.5 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', s.dot)} />
                      <p className="text-sm text-[#e8e8f0] leading-snug flex-1">{claim.claim}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap pl-4">
                      <span className={cn('badge', s.badge)}>{s.label}</span>
                      <span className="text-[11px] text-[#7a7a9a]">Confidence: {claim.confidence}%</span>
                      {claim.source && <span className="text-[11px] text-blue-400 ml-auto">📎 {claim.source}</span>}
                    </div>
                    {claim.explanation && <p className="text-[11px] text-[#7a7a9a] pl-4 leading-snug">{claim.explanation}</p>}
                    {claim.correction && (
                      <div className="pl-4 text-[11px] text-emerald-400 bg-emerald-400/5 rounded px-2 py-1.5">
                        ✓ Correction: {claim.correction}
                      </div>
                    )}
                  </div>
                )
              })}
              {claims.length === 0 && (
                <div className="card p-4 text-center text-sm text-[#7a7a9a]">No factual claims detected.</div>
              )}
            </div>
          </div>
        )
      }}
    </ToolShell>
  )
}

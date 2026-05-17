'use client'
import ToolShell from '@/components/tools/ToolShell'
import ScoreCard from '@/components/shared/ScoreCard'
import { cn } from '@/lib/utils'

export default function GrammarPage() {
  return (
    <ToolShell
      toolKey="grammar"
      outputLabel="Grammar Report"
      placeholder="Paste your text to check grammar, spelling, punctuation and style…"
      runLabel="Fix Grammar"
    >
      {(state) => {
        const r = state.result as {
          correctedText?: string
          issues?: { type: string; original: string; suggestion: string; explanation: string }[]
          score?: number
          readabilityGrade?: string
          stats?: { passiveVoice: number; avgSentenceLength: number; longSentences: number; adverbs: number }
        }
        const score = r.score ?? 0
        const issues = r.issues ?? []
        const typeColor: Record<string, string> = {
          grammar: 'bg-red-400',
          spelling: 'bg-orange-400',
          punctuation: 'bg-yellow-400',
          style: 'bg-blue-400',
          clarity: 'bg-violet-400',
          passive: 'bg-emerald-400',
        }
        const typeBadge: Record<string, string> = {
          grammar: 'badge-red', spelling: 'badge-orange', punctuation: 'badge-orange',
          style: 'badge-blue', clarity: 'badge-purple', passive: 'badge-green',
        }

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <ScoreCard label="Writing Score" value={`${score}/100`} progress={score}
                color={score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red'} />
              <ScoreCard label="Issues" value={issues.length} color={issues.length === 0 ? 'green' : 'red'} />
              <ScoreCard label="Grade" value={r.readabilityGrade ?? '—'} color="blue" />
              <ScoreCard label="Passive Voice" value={r.stats?.passiveVoice ?? 0} color="orange" />
            </div>

            {r.correctedText && (
              <div className="card p-3.5">
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2">Corrected Text</p>
                <p className="text-sm text-[#e8e8f0] leading-relaxed whitespace-pre-wrap">{r.correctedText}</p>
              </div>
            )}

            {issues.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider">{issues.length} Issues Found</p>
                {issues.map((issue, i) => (
                  <div key={i} className="card card-hover p-3 flex gap-3 cursor-pointer">
                    <span className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', typeColor[issue.type] ?? 'bg-[#7a7a9a]')} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={cn('badge text-[9px]', typeBadge[issue.type] ?? 'badge-blue')}>
                          {issue.type}
                        </span>
                        <span className="text-xs text-[#7a7a9a] line-through">{issue.original}</span>
                        <span className="text-xs text-emerald-400 font-medium">→ {issue.suggestion}</span>
                      </div>
                      <p className="text-[11px] text-[#7a7a9a] leading-snug">{issue.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {issues.length === 0 && r.correctedText && (
              <div className="card p-4 text-center">
                <div className="text-2xl mb-2">🎉</div>
                <p className="text-sm text-emerald-400 font-medium">No issues found!</p>
                <p className="text-xs text-[#7a7a9a] mt-1">Your writing looks great.</p>
              </div>
            )}
          </div>
        )
      }}
    </ToolShell>
  )
}

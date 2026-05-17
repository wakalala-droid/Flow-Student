'use client'
import ToolShell from '@/components/tools/ToolShell'
import ScoreCard from '@/components/shared/ScoreCard'

export default function PlagiarismPage() {
  return (
    <ToolShell
      toolKey="plagiarism"
      outputLabel="Plagiarism Report"
      placeholder="Paste text to check for plagiarism and duplicate content…"
      runLabel="Check Plagiarism"
    >
      {(state) => {
        const r = state.result as {
          similarityScore?: number; uniqueScore?: number
          matches?: { phrase: string; likely_source: string; similarity_percent: number; context: string }[]
          riskLevel?: string; recommendation?: string
        }
        const sim = r.similarityScore ?? 0
        const simColor = sim >= 30 ? 'red' : sim >= 15 ? 'orange' : 'green'

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <ScoreCard label="Similarity" value={`${sim}%`} progress={sim} color={simColor} />
              <ScoreCard label="Unique" value={`${r.uniqueScore ?? 100}%`} progress={r.uniqueScore} color="green" />
              <ScoreCard label="Matches" value={r.matches?.length ?? 0} color="blue" />
            </div>

            <div className={`px-3 py-2 rounded-lg text-xs font-medium border ${
              r.riskLevel === 'high' ? 'bg-red-400/10 border-red-400/20 text-red-400' :
              r.riskLevel === 'medium' ? 'bg-orange-400/10 border-orange-400/20 text-orange-400' :
              'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
            }`}>
              Risk Level: {r.riskLevel?.toUpperCase() ?? 'LOW'}
            </div>

            {r.matches && r.matches.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider">Matched Sources</p>
                {r.matches.map((m, i) => (
                  <div key={i} className="card p-3.5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs text-blue-400 font-medium truncate">🌐 {m.likely_source}</span>
                      <span className="text-lg font-bold text-red-400 flex-shrink-0">{m.similarity_percent}%</span>
                    </div>
                    <p className="text-xs text-[#7a7a9a] italic leading-relaxed">"{m.phrase}"</p>
                    {m.context && <p className="text-[11px] text-[#7a7a9a] mt-1.5">{m.context}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-4 text-center">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-sm text-emerald-400 font-medium">No significant matches found</p>
                <p className="text-xs text-[#7a7a9a] mt-1">Content appears largely original</p>
              </div>
            )}

            {r.recommendation && (
              <div className="px-3 py-2.5 rounded-lg bg-[#6c63ff]/10 border border-[#6c63ff]/20">
                <p className="text-xs text-violet-300">💡 {r.recommendation}</p>
              </div>
            )}
          </div>
        )
      }}
    </ToolShell>
  )
}

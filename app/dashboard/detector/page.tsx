'use client'
import ToolShell from '@/components/tools/ToolShell'
import ScoreCard from '@/components/shared/ScoreCard'

export default function DetectorPage() {
  return (
    <ToolShell
      toolKey="detect"
      outputLabel="Detection Report"
      placeholder="Paste text to analyse for AI generation patterns…"
      runLabel="Detect AI"
    >
      {(state) => {
        const r = state.result as {
          aiScore?: number; humanScore?: number; confidence?: string
          sentences?: { text: string; aiProbability: number; flags: string[] }[]
          models?: { gpt: number; claude: number; gemini: number; mixed: number }
          summary?: string; recommendation?: string
        }
        const aiScore = r.aiScore ?? 0
        const humanScore = r.humanScore ?? 100

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <ScoreCard label="AI Score" value={`${aiScore}%`} progress={aiScore}
                color={aiScore >= 70 ? 'red' : aiScore >= 40 ? 'orange' : 'green'} />
              <ScoreCard label="Human Score" value={`${humanScore}%`} progress={humanScore} color="green" />
              <ScoreCard label="Confidence" value={r.confidence ?? '—'} color="blue" />
            </div>

            {/* Model breakdown */}
            {r.models && (
              <div className="card p-3.5 space-y-2">
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-1">Model Breakdown</p>
                {Object.entries(r.models).map(([model, score]) => (
                  <div key={model}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#7a7a9a] capitalize">{model}</span>
                      <span className="text-[#e8e8f0] font-medium">{score}%</span>
                    </div>
                    <div className="h-1 bg-[#1c1c28] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-orange-400 transition-all"
                        style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sentence heatmap */}
            {r.sentences && r.sentences.length > 0 && (
              <div className="card p-3.5">
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-3">Sentence Heatmap</p>
                <p className="text-sm leading-loose">
                  {r.sentences.map((s, i) => {
                    const heat = s.aiProbability >= 80 ? 4 : s.aiProbability >= 60 ? 3 : s.aiProbability >= 40 ? 2 : s.aiProbability >= 20 ? 1 : 0
                    return (
                      <span key={i} className={`heat-${heat} cursor-default`} title={`AI: ${s.aiProbability}%`}>
                        {s.text}{' '}
                      </span>
                    )
                  })}
                </p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="text-[10px] text-[#7a7a9a]">Risk:</span>
                  {[['Low','heat-1'],['Medium','heat-2'],['High','heat-3'],['Very High','heat-4']].map(([label, cls]) => (
                    <span key={label} className={`text-[10px] px-2 py-0.5 rounded ${cls}`}>{label}</span>
                  ))}
                </div>
              </div>
            )}

            {r.summary && (
              <div className="card p-3.5">
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-1.5">Summary</p>
                <p className="text-sm text-[#e8e8f0] leading-relaxed">{r.summary}</p>
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

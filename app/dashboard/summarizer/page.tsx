'use client'
// app/dashboard/summarizer/page.tsx
import { useState } from 'react'
import ToolShell from '@/components/tools/ToolShell'
import ScoreCard from '@/components/shared/ScoreCard'
import { cn } from '@/lib/utils'

const STYLES  = ['bullet', 'paragraph', 'tldr', 'academic'] as const
const LENGTHS = ['short', 'medium', 'detailed'] as const

export default function SummarizerPage() {
  const [style,  setStyle]  = useState<typeof STYLES[number]>('bullet')
  const [length, setLength] = useState<typeof LENGTHS[number]>('medium')

  return (
    <ToolShell
      toolKey="summarize"
      outputLabel="Summary"
      placeholder="Paste any text, article, essay or document to summarize…"
      runLabel="Summarize"
      sidePanel={(state) => (
        <>
          <div className="card p-3.5">
            <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2.5">Style</p>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map(s => (
                <button key={s} onClick={() => setStyle(s)}
                  className={cn('chip text-[10px] capitalize', style === s && 'chip-active')}>
                  {s === 'tldr' ? 'TL;DR' : s}
                </button>
              ))}
            </div>
          </div>
          <div className="card p-3.5">
            <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2.5">Length</p>
            <div className="flex flex-wrap gap-1.5">
              {LENGTHS.map(l => (
                <button key={l} onClick={() => setLength(l)}
                  className={cn('chip text-[10px] capitalize', length === l && 'chip-active')}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => state.run({ style, length })}
            disabled={state.isLoading || !state.inputText.trim()}
            className="btn-primary w-full justify-center text-xs py-2">
            ▶ Summarize
          </button>
        </>
      )}
    >
      {(state) => {
        const r = state.result as { summary?: string; keyPoints?: string[]; reductionPct?: number; wordCount?: number }
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <ScoreCard label="Reduced By"   value={`${r.reductionPct ?? 0}%`} color="green" progress={r.reductionPct} />
              <ScoreCard label="Summary Words" value={r.wordCount ?? 0}          color="blue" />
            </div>
            {r.keyPoints && r.keyPoints.length > 0 && (
              <div className="card p-3.5">
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2">Key Points</p>
                <ul className="space-y-1.5">
                  {r.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#e8e8f0]">
                      <span className="text-violet-400 mt-0.5">◆</span>{pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-sm text-[#e8e8f0] leading-relaxed whitespace-pre-wrap">{r.summary}</div>
          </div>
        )
      }}
    </ToolShell>
  )
}

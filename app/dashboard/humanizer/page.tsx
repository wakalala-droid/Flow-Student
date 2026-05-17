'use client'
import { useState } from 'react'
import ToolShell from '@/components/tools/ToolShell'
import ScoreCard from '@/components/shared/ScoreCard'
import { cn } from '@/lib/utils'

const MODES = ['Academic', 'Professional', 'Casual', 'Creative', 'Undetectable', 'Native English', 'Gen Z', 'Formal'] as const
type Mode = typeof MODES[number]

export default function HumanizerPage() {
  const [mode, setMode] = useState<Mode>('Academic')
  const [readability, setReadability] = useState(65)
  const [burstiness, setBurstiness] = useState(72)
  const [perplexity, setPerplexity] = useState(58)
  const [vocab, setVocab] = useState(40)

  return (
    <ToolShell
      toolKey="humanize"
      outputLabel="Humanized Output"
      placeholder="Paste AI-generated text here to make it sound naturally human…"
      runLabel="Humanize"
      sidePanel={(state) => (
        <>
          <div className="card p-3.5">
            <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2.5">Style</p>
            <div className="flex flex-wrap gap-1.5">
              {MODES.map(m => (
                <button key={m}
                  onClick={() => setMode(m)}
                  className={cn('chip text-[10px]', mode === m && 'chip-active')}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-3.5 space-y-4">
            <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider">Controls</p>
            {([
              ['Readability', readability, setReadability],
              ['Burstiness', burstiness, setBurstiness],
              ['Perplexity', perplexity, setPerplexity],
              ['Vocab Level', vocab, setVocab],
            ] as [string, number, (v: number) => void][]).map(([label, val, set]) => (
              <div key={label}>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-[#7a7a9a]">{label}</span>
                  <span className="text-violet-400 font-semibold">{val}</span>
                </div>
                <input type="range" min={1} max={100} value={val}
                  onChange={e => set(Number(e.target.value))}
                  className="w-full h-1 bg-[#1c1c28] rounded-full appearance-none cursor-pointer accent-[#6c63ff]" />
              </div>
            ))}
          </div>

          <button
            onClick={() => state.run({ mode, readability, burstiness, perplexity, vocabComplexity: vocab })}
            disabled={state.isLoading || !state.inputText.trim()}
            className="btn-primary w-full justify-center text-xs py-2">
            ▶ Humanize
          </button>
        </>
      )}
    >
      {(state) => {
        const r = state.result as { humanizedText?: string; humanScore?: number; wordsChanged?: number }
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <ScoreCard label="Human Score" value={`${r.humanScore ?? 0}%`} color={r.humanScore! >= 85 ? 'green' : 'orange'} progress={r.humanScore} />
              <ScoreCard label="Mode" value={mode} color="purple" />
              <ScoreCard label="Words Changed" value={r.wordsChanged ?? 0} color="blue" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <span className="badge badge-green">✓ Undetectable</span>
              <span className="badge badge-purple">Burstiness ↑</span>
              <span className="badge badge-blue">Perplexity: {perplexity}</span>
            </div>
            <div className="text-sm text-[#e8e8f0] leading-relaxed whitespace-pre-wrap">
              {r.humanizedText}
            </div>
          </div>
        )
      }}
    </ToolShell>
  )
}
